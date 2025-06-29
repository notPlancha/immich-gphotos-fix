import { log, debug } from '../lib/log.ts'
import { getTimeBuckets, AssetOrder, TimeBucketSize, getTimeBucket, createStack } from '@immich/sdk'
import { tagAs } from '../lib/tags.ts'
import type { CreateStacksParams } from '../lib/types.ts'

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

export async function createEditedStacks(params: CreateStacksParams) {
	const { albumId, MAX_WRITE_OPS = Number.MAX_SAFE_INTEGER, tag } = params

	const assets = await getAllAssetsInAlbum(albumId, true)

	const nameMap = new Map()
	const dupes = []
	for (const asset of assets) {
		const { originalFileName } = asset
		if (nameMap.has(originalFileName)) dupes.push(originalFileName)
		else nameMap.set(originalFileName, asset)
	}
	for (const dupe of dupes) nameMap.delete(dupe) // dont make wrong stack by accident
	if (dupes.length) {
		console.error(`dupes in assets originalFileNames: ${dupes}`)
	}

	// keep some stats
	let found = 0
	let notFound = 0
	let alreadyStacked = 0
	let created = 0
	const changed = new Set<string>()
	try {
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
					if (dupes.includes(uneditedName)) console.error(uneditedName, 'was found twice, skipping')
					else console.error('couldnt find unedited asset', uneditedName, '. Maybe it got trashed')
					notFound++
					continue
				}
				debug('unedited:', uneditedAsset.originalFileName)

				if (created < MAX_WRITE_OPS) {
					const s = await createStack({ stackCreateDto: { assetIds: [asset.id, uneditedAsset.id] } })
					created++
					log('created stack with primaryAssetId:', s.primaryAssetId)
					changed.add(asset.id)
					changed.add(uneditedAsset.id)
				}
			}
		}
	} catch (e) {
		console.error(e)
	}
	log('found', found, 'edited assets')
	log(alreadyStacked, 'already in a stack')
	log(notFound, 'without an unedited version')

	if (changed.size && tag) {
		await tagAs(changed, tag)
	}
}
