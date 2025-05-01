import { createTag, getAllTags, tagAssets, upsertTags } from '@immich/sdk'
import { log } from './log.ts'

// tagName --> tagId
const tagMap = new Map<string, string>()

// returns tagId
async function getOrCreateTag(tagName: string) {
	let targetTagId = tagMap.get(tagName)
	if (targetTagId) return targetTagId

	log('pulling all tags..')
	const existingTags = await getAllTags()
	targetTagId = existingTags.find((tag) => tag.name === tagName)?.id

	if (!targetTagId) {
		log('creating tag', tagName)
		// const tagResponse = await upsertTags({ tagUpsertDto: { tags: [tagName] } })
		const tagResponse = await createTag({ tagCreateDto: { name: tagName } })
		targetTagId = tagResponse.id
	}

	tagMap.set(tagName, targetTagId)
	return targetTagId
}

export async function tagAs(assets: Set<string>, tagName: string) {
	if (!assets.size) return

	const targetTagId = await getOrCreateTag(tagName)
	log('got tag', tagName, 'with id', targetTagId)

	log('tagging', assets.size, 'assets with', tagName)
	const tagResponses = await tagAssets({ id: targetTagId, bulkIdsDto: { ids: Array.from(assets) } })
	for (const tagResponse of tagResponses) {
		const { id, success, error } = tagResponse
		log(`tagged ${id} - success: ${success}`)
		if (error) console.error(error)
	}
}
