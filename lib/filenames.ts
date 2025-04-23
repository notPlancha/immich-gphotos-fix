export function getSidecarFilenames(filename: string): string[] {
	const exts = /\.(jpg|jpeg|png|gif|mp4|m4v)$/i
	const match = exts.exec(filename)
	if (!match) throw new Error(`unknown extension in filename ${filename}`)
	const fileExt = match[0]
	const fnNoExt = filename.slice(0, fileExt.length * -1)

	const dupeRegex = /(.*)(\(\d{1,2}\))$/ // could extend this regex to include exts and -edited
	const matches = fnNoExt.match(dupeRegex)
	let fnNoDupe = fnNoExt
	let dupe = ''
	if (matches) {
		if (matches.length !== 3 || !matches[1] || !matches[2]) throw new Error(`unexpected dupe match for: ${filename}`)
		fnNoDupe = matches[1] // "hangout_snapshot_0-edited"
		dupe = matches[2] // "(12)"
	}

	const uneditedFilename = fnNoDupe.replace(/-edited$/, '')

	const maxFilenameLength = 46 // 51 with .json ext. dupe not counted
	const baseSidecar = `${uneditedFilename}${fileExt}.supplemental-metadata`.slice(0, maxFilenameLength)

	const sidecars = [`${baseSidecar}${dupe}.json`]
	if (dupe)
		sidecars.push(
			`${`${uneditedFilename}${dupe}${fileExt}.supplemental-metadata`.slice(0, maxFilenameLength)}.json`, // strange, keep dupe before filename sometimes
			`${baseSidecar}.json`, // strange, just drop dupe sometimes if verylongname
		)

	return sidecars
}
