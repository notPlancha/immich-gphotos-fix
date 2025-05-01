import { getTimeBuckets, AssetOrder, TimeBucketSize, getTimeBucket, updateAsset } from '@immich/sdk'
import { log, debug, dir } from '../lib/log.ts'
import type { SupplementalMetadata } from '../lib/types.ts'
import { dateFromFilename, getSidecarFilenames } from '../lib/filenames.ts'
import { DateTime } from 'luxon' // immich uses luxon internally, so we should also use it
import { join } from 'node:path'
import { exit } from 'node:process'
import { tagAs } from '../lib/tags.ts'

type FixDatesParams = {
	albumId: string
	MAX_WRITE_OPS: number
	TARGET_BUCKET: string
	EXPECTED_YEAR?: string
	tag?: string
}
type FixDatesSidecarParams = FixDatesParams & {
	SIDECAR_FOLDER: string
	useCreationTime: boolean
}
type FixDatesFilenameParams = FixDatesParams & {}

async function findSidecar(filename: string, SIDECAR_FOLDER: string) {
	const candidates = getSidecarFilenames(filename).map((path) => join(SIDECAR_FOLDER, path))
	for (const candidate of candidates) {
		const f = Bun.file(candidate)
		const exists = await f.exists()
		console.log(candidate, exists ? 'exists' : 'doesnt exist')
		if (exists) return f
	}

	throw new Error(`sidecar not found for ${filename}`)
}
async function getTimeFromSidecar(filename: string, SIDECAR_FOLDER: string, useCreationTime?: boolean) {
	const f = await findSidecar(filename, SIDECAR_FOLDER)
	const sidecar = (await f.json()) as SupplementalMetadata
	dir(sidecar)
	const timeField = useCreationTime ? 'creationTime' : 'photoTakenTime'
	const unixTimestamp = sidecar[timeField].timestamp
	if (!unixTimestamp) throw new Error('no timestamp in sidecar')
	return unixTimestamp
}

function unixTimeToLuxon(unixTime: string, EXPECTED_YEAR?: string) {
	const unixTimeAsNum = Number.parseInt(unixTime, 10)
	if (Number.isNaN(unixTimeAsNum)) throw new Error(`${unixTime} is NaN`)

	const dt = DateTime.fromSeconds(unixTimeAsNum, { zone: 'UTC' })

	const isoString = dt.toISO()
	if (!dt.isValid || !isoString.endsWith('Z') || (EXPECTED_YEAR && !isoString.startsWith(EXPECTED_YEAR)))
		throw new Error(`timestamp conversion failed with ${unixTime}: ${dt}`)

	return dt
}

async function addTimeToAsset(dt: DateTime, assetId: string) {
	const isoString = dt.toISO({
		// suppressMilliseconds: true,
	})

	log('as ISO:', isoString)
	log('assigning to asset:', assetId)

	const r = await updateAsset({
		id: assetId,
		updateAssetDto: { dateTimeOriginal: isoString },
	})
	// fileCreatedAt and localDateTime and exifInfo.dateTimeOriginal will be changed
	// "fileCreatedAt": "2014-10-06T16:00:00.000Z",
	// "localDateTime": "2014-10-06T12:00:00.000Z",
	//  exifInfo."dateTimeOriginal": "2014-10-06T16:00:00+00:00",

	// exifInfo.dateTimeOriginal changes immediately, the others do not

	debug(r)
	if (!r.exifInfo || !r.exifInfo.dateTimeOriginal) throw new Error('no exifInfo on asset')
	log('exifInfo.dateTimeOriginal:', r.exifInfo.dateTimeOriginal)
	const rdt = DateTime.fromISO(r.exifInfo.dateTimeOriginal)
	log('as luxon obj:', rdt)

	debug(+dt, '===', +rdt)
	const setTimeSuccessful = +dt === +rdt
	if (!setTimeSuccessful) throw new Error('time on returned asset was different than what we set it to')
}

async function getBucket(albumId: string, TARGET_BUCKET: string) {
	const bucketSize = /^\d{4}-\d{2}-\d{2}/.test(TARGET_BUCKET) ? TimeBucketSize.Day : TimeBucketSize.Month
	const buckets = await getTimeBuckets({
		albumId,
		order: AssetOrder.Desc,
		size: bucketSize,
	})
	debug(buckets)
	log('got', buckets.length, 'buckets')
	// await Bun.write("buckets.json", JSON.stringify(buckets, null, 2));
	// console.log('wrote buckets.json');

	const target = buckets.find((val) => val.timeBucket.startsWith(TARGET_BUCKET))
	if (!target) throw new Error('target bucket missing')

	const bucket = await getTimeBucket({
		albumId,
		size: bucketSize,
		order: AssetOrder.Desc,
		timeBucket: target.timeBucket,
	})
	log('got', bucket.length, 'items in bucket named', target.timeBucket)
	// await Bun.write("bucket.json", JSON.stringify(bucket, null, 2));
	// console.log("wrote bucket.json");

	return bucket
}

export async function fixDatesFromSidecar(params: FixDatesSidecarParams) {
	const { albumId, MAX_WRITE_OPS, TARGET_BUCKET, SIDECAR_FOLDER, EXPECTED_YEAR, useCreationTime, tag } = params

	const bucket = await getBucket(albumId, TARGET_BUCKET)

	const changed = new Set<string>()
	try {
		for (let i = 0; i < MAX_WRITE_OPS && i < bucket.length; i++) {
			debug('index', i)
			const asset = bucket[i]
			if (!asset) throw new Error(`no asset at index ${i}`)

			log('checking', asset.originalFileName, 'id', asset.id)

			const unixTimestamp = await getTimeFromSidecar(asset.originalFileName, SIDECAR_FOLDER, useCreationTime)
			log('unix timestamp from sidecar:', unixTimestamp)

			if (!asset.exifInfo?.dateTimeOriginal) throw new Error('expected asset to have exifInfo')
			const originalDT = DateTime.fromISO(asset.exifInfo?.dateTimeOriginal)
			const sidecarDT = unixTimeToLuxon(unixTimestamp, EXPECTED_YEAR)
			const diff = originalDT.diff(sidecarDT, 'minutes').toObject()
			debug('time diff', diff)
			if (typeof diff.minutes !== 'number') throw new Error('luxon diff failed')
			if (Math.abs(diff.minutes) <= 3) {
				log('sidecar timestamp is within 3m of the current one. Not changing.')
			} else {
				log('changing', originalDT.toISO(), 'to', sidecarDT.toISO())
				await addTimeToAsset(sidecarDT, asset.id)
				changed.add(asset.id)
			}
			log('')
		}
	} catch (e: unknown) {
		console.error(e)
	}

	if (changed.size && tag) {
		await tagAs(changed, tag)
	}
}

export async function fixDatesFromFilename(params: FixDatesFilenameParams) {
	const { albumId, MAX_WRITE_OPS, TARGET_BUCKET, EXPECTED_YEAR, tag } = params
	const bucket = await getBucket(albumId, TARGET_BUCKET)

	const changed = new Set<string>()
	try {
		for (const asset of bucket) {
			if (changed.size >= MAX_WRITE_OPS) break

			const { originalFileName } = asset
			log('for asset', originalFileName)
			const newDate = dateFromFilename(originalFileName)
			if (EXPECTED_YEAR && newDate.year.toString() !== EXPECTED_YEAR) {
				throw new Error(`expected filename date ${newDate} to have year ${EXPECTED_YEAR}`)
			}

			const dto = asset.exifInfo?.dateTimeOriginal
			if (!dto) throw new Error('expected asset to have exifInfo')
			const oldDate = DateTime.fromISO(dto, { zone: 'UTC' })
			if (!oldDate.isValid) throw new Error(`failed to parse asset dto date: ${dto}`)

			const diff = oldDate.diff(newDate, 'minutes').toObject()
			debug('time diff', diff)
			if (typeof diff.minutes !== 'number' || Number.isNaN(diff.minutes)) throw new Error('luxon diff failed')
			if (Math.abs(diff.minutes) <= 3) {
				log('sidecar timestamp is within 3m of the current one. Not changing.')
				continue
			}

			log('changing', oldDate.toISO(), 'to', newDate.toISO())
			await addTimeToAsset(newDate, asset.id)
			changed.add(asset.id)

			log('')
		}
	} catch (e: unknown) {
		console.error(e)
	}

	if (changed.size && tag) {
		await tagAs(changed, tag)
	}
}
