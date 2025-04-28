import { $ } from 'bun'
import { init, getTimeBuckets, AssetOrder, TimeBucketSize, getTimeBucket, updateAsset, createStack } from '@immich/sdk'
import { exit } from 'node:process'
import type { SupplementalMetadata } from './lib/types.ts'
import { DateTime, Settings /*, type TSSettings */ } from 'luxon' // immich uses luxon internally, so we should also use it
import { getSidecarFilenames } from './lib/filenames.ts'
declare module 'luxon' {
	interface TSSettings {
		throwOnInvalid: true
		// If this interface extension is working, type of DateTime will be
		// `DateTime<IsValid extends boolean = true>` rather than
		// `DateTime<IsValid extends boolean = boolean>`
	}
}
Settings.throwOnInvalid = true
Settings.defaultZone = 'UTC'
import { parseArgs } from 'node:util'
// import assert from 'node:assert/strict'

const { values: argValues } = parseArgs({
	args: Bun.argv.slice(2),
	options: {
		stacks: {
			type: 'boolean',
		},
		'fix-date-for-bucket': {
			type: 'string',
		},
		'album-id': {
			type: 'string',
			short: 'A',
		},
	},
})
if ((argValues.stacks && argValues['fix-date-for-bucket']) || (!argValues.stacks && !argValues['fix-date-for-bucket']))
	throw new Error('choose either to create stacks or to fix dates')
if (!argValues['album-id']) throw new Error('provide an album ID')
if (argValues['fix-date-for-bucket'] === '') throw new Error('invalid bucket name')

init({ baseUrl: 'http://192.168.1.200:2283/api', apiKey: '21TDFYiI1CtfeuxxlLNGHHCDVpg97ZwwrjWmAnG48M' })

const album2014 = '6e966c34-9590-48fd-8592-0fc2c885d2c7'
const album2015 = '632558f9-d385-4a09-8c37-4fba528c9acc'
const TARGET_ALBUM_ID: string = album2015
const DEBUG_LOG: boolean = false

const MAX_STACKS_TO_CREATE: number = 0 // 0 is equiv to dry-run

const MAX_DATE_FIXED: number = 0 // 0 is equiv to dry-run
const TARGET_BUCKET: string = '2025-03-01' // bucket to fix metadata on. full bucket name is ISO date string like 2015-06-01T00:00:00.000Z
const GPHOTOS_FOLDER = '/tmp/imm/Photos from 2015' // only json sidecars are needed
const TARGET_YEAR: string = '2015' // sanity check. Expected year for fixed date

// https://immich.app/docs/api/search-assets
// https://immich.app/docs/api/get-album-info
// const albums = await getAllAlbums({});
// http://192.168.1.200:2283/api/timeline/buckets?albumId=6e966c34-9590-48fd-8592-0fc2c885d2c7&order=desc&size=MONTH
// http://192.168.1.200:2283/api/timeline/bucket?albumId=6e966c34-9590-48fd-8592-0fc2c885d2c7&order=desc&size=MONTH&timeBucket=2025-03-01T00%3A00%3A00.000Z

const log = console.log.bind(console)
const debug = (...args: unknown[]) => {
	if (DEBUG_LOG) log(...args)
}
const dir = (unk: unknown) => {
	if (DEBUG_LOG) console.dir(unk, { depth: 100 })
}

async function main() {
	await fixBadBuckets(TARGET_ALBUM_ID)
	// await createEditedStacks(TARGET_ALBUM_ID)
}

async function getAllAssetsInAlbum(albumId: string, withStacked?: boolean) {
	const buckets = await getTimeBuckets({
		albumId,
		order: AssetOrder.Desc,
		size: TimeBucketSize.Month,
		withStacked, // true decreases "count"
	})
	log('got', buckets.length, 'buckets')

	// these reqs will fire simultaneously
	const assets = (
		await Promise.all(
			buckets.map(async (curr) => {
				const bucket = await getTimeBucket({
					albumId,
					size: TimeBucketSize.Month,
					order: AssetOrder.Desc,
					timeBucket: curr.timeBucket,
					withStacked, // if false, "stack" prop is always null. if true, returns fewer items, one per stack.
				})
				debug('got', bucket.length, 'items in bucket named', curr.timeBucket)
				debug('expected', curr.count, 'items')
				if (bucket.length !== curr.count) throw new Error('unexpected number of items in bucket')
				return bucket
			}),
		)
	).flat()

	return assets
}

async function createEditedStacks(albumId: string) {
	const assets = await getAllAssetsInAlbum(albumId, true)

	const nameMap = new Map(assets.map((asset) => [asset.originalFileName, asset]))

	// keep some stats
	let found = 0
	let notFound = 0
	let alreadyStacked = 0
	let created = 0
	for (const asset of assets) {
		if (asset.originalFileName.includes('-edited')) {
			debug('\nfound:', asset.originalFileName)
			found++

			if (asset.stack) {
				debug('already in stack')
				alreadyStacked++
				continue
			}

			const uneditedName = asset.originalFileName.replace('-edited', '')
			const uneditedAsset = nameMap.get(uneditedName)
			if (!uneditedAsset) {
				console.error('couldnt find unedited asset', uneditedName, '. Maybe it got trashed')
				notFound++
				continue
			}
			// if (!uneditedAsset) throw new Error("couldnt find unedited asset. Maybe it got trashed");
			debug('unedited:', uneditedAsset.originalFileName)

			if (created < MAX_STACKS_TO_CREATE) {
				const s = await createStack({ stackCreateDto: { assetIds: [asset.id, uneditedAsset.id] } })
				created++
				log('created stack with primaryAssetId:', s.primaryAssetId)
			}
		}
	}
	log('found', found, 'edited assets')
	log(alreadyStacked, 'already in a stack')
	log(notFound, 'without an unedited version')
}

async function fixBadBuckets(albumId: string) {
	const buckets = await getTimeBuckets({
		albumId,
		order: AssetOrder.Desc,
		size: TimeBucketSize.Month,
	})
	debug(buckets)
	log('got', buckets.length, 'buckets')
	// await Bun.write("buckets.json", JSON.stringify(buckets, null, 2));
	// console.log('wrote buckets.json');

	const target = buckets.find((val) => val.timeBucket.startsWith(TARGET_BUCKET))
	if (!target) throw new Error('target bucket missing')

	const bucket = await getTimeBucket({
		albumId,
		size: TimeBucketSize.Month,
		order: AssetOrder.Desc,
		timeBucket: target.timeBucket,
	})
	log('got', bucket.length, 'items in bucket named', target.timeBucket)
	// await Bun.write("bucket.json", JSON.stringify(bucket, null, 2));
	// console.log("wrote bucket.json");

	for (let i = 0; i < MAX_DATE_FIXED && i < bucket.length; i++) {
		debug('index', i)
		const asset = bucket[i]
		if (!asset) throw new Error(`no asset at index ${i}`)

		log('checking', asset.originalFileName)
		const unixTimestamp = await getTimeFromSidecar(asset.originalFileName)
		log('unix timestamp from sidecar:', unixTimestamp)
		await addTimeToAsset(unixTimestamp, asset.id)
		log('')
	}
}

async function findSidecar(filename: string) {
	const candidates = getSidecarFilenames(filename).map((path) => `${GPHOTOS_FOLDER}/${path}`)
	for (const candidate of candidates) {
		const f = Bun.file(candidate)
		const exists = await f.exists()
		console.log(candidate, exists ? 'exists' : 'doesnt exist')
		if (exists) return f
	}

	throw new Error(`sidecar not found for ${filename}`)
}

async function getTimeFromSidecar(filename: string) {
	const f = await findSidecar(filename)
	const sidecar = (await f.json()) as SupplementalMetadata
	dir(sidecar)
	const unixTimestamp = sidecar.photoTakenTime.timestamp
	if (!unixTimestamp) throw new Error('no timestamp in sidecar')
	return unixTimestamp
}

async function addTimeToAsset(unixTime: string, assetId: string) {
	const unixTimeAsNum = Number.parseInt(unixTime, 10)
	if (Number.isNaN(unixTimeAsNum)) throw new Error(`${unixTime} is NaN`)

	const dt = DateTime.fromSeconds(unixTimeAsNum, { zone: 'UTC' })
	const isoString = dt.toISO({
		// suppressMilliseconds: true,
	})

	if (!dt.isValid || !isoString.startsWith(TARGET_YEAR) || !isoString.endsWith('Z'))
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

await main()
