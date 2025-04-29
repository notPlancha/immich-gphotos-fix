import { getAllTags, upsertTags } from "@immich/sdk"
import { log } from "./log.ts"

// tagName --> tagId
const tagMap = new Map<string, string>()

// returns tagId
async function getOrCreateTag(tagName: string) {
	let targetTagId = tagMap.get(tagName)
	if (!targetTagId) {
		log('pulling all tags..')
		const existingTags = await getAllTags()
		targetTagId = existingTags.find((tag) => tag.name === tagName)?.id
		if (!targetTagId) {
			log('creating tag', tagName)
			const tagResponse = await upsertTags({ tagUpsertDto: { tags: [tagName] } })
			if (!tagResponse.length || !tagResponse[0]) throw new Error(`failed to create tag: ${tagName}`)
			targetTagId = tagResponse[0].id
		}
		tagMap.set(tagName, targetTagId)
	}
	log('got tag', tagName, 'with id', targetTagId)
}