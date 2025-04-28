import { getTimeBuckets, AssetOrder, TimeBucketSize, getTimeBucket, updateAsset } from '@immich/sdk'
import { log, debug, dir } from '../lib/log.ts'
import type { SupplementalMetadata } from '../lib/types.ts'
import { getSidecarFilenames } from '../lib/filenames.ts'
import { DateTime } from 'luxon' // immich uses luxon internally, so we should also use it
import { join } from 'node:path'

type FixDatesParams = {
	albumId: string
	MAX_WRITE_OPS: number
	TARGET_BUCKET: string
	SIDECAR_FOLDER: string
	EXPECTED_YEAR: string
}

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
async function getTimeFromSidecar(filename: string, SIDECAR_FOLDER: string) {
	const f = await findSidecar(filename, SIDECAR_FOLDER)
	const sidecar = (await f.json()) as SupplementalMetadata
	dir(sidecar)
	const unixTimestamp = sidecar.photoTakenTime.timestamp
	if (!unixTimestamp) throw new Error('no timestamp in sidecar')
	return unixTimestamp
}

async function addTimeToAsset(unixTime: string, assetId: string, EXPECTED_YEAR: string) {
	const unixTimeAsNum = Number.parseInt(unixTime, 10)
	if (Number.isNaN(unixTimeAsNum)) throw new Error(`${unixTime} is NaN`)

	const dt = DateTime.fromSeconds(unixTimeAsNum, { zone: 'UTC' })
	const isoString = dt.toISO({
		// suppressMilliseconds: true,
	})

	if (!dt.isValid || !isoString.startsWith(EXPECTED_YEAR) || !isoString.endsWith('Z'))
		throw new Error(`timestamp conversion failed with ${assetId}: ${unixTime}`)

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

export async function fixBadBuckets(params: FixDatesParams) {
	const { albumId, MAX_WRITE_OPS, TARGET_BUCKET, SIDECAR_FOLDER, EXPECTED_YEAR } = params

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

	for (let i = 0; i < MAX_WRITE_OPS && i < bucket.length; i++) {
		debug('index', i)
		const asset = bucket[i]
		if (!asset) throw new Error(`no asset at index ${i}`)

		log('checking', asset.originalFileName)
		const unixTimestamp = await getTimeFromSidecar(asset.originalFileName, SIDECAR_FOLDER)
		log('unix timestamp from sidecar:', unixTimestamp)
		await addTimeToAsset(unixTimestamp, asset.id, EXPECTED_YEAR)
		log('')
	}
}
