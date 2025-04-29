import { getAllAlbums, init } from '@immich/sdk'
import { parseArgs } from 'node:util'
import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { createEditedStacks } from './cmd/stacks.ts'
import { fixDatesFromFilename, fixDatesFromSidecar } from './cmd/dates.ts'
import { Settings /*, type TSSettings */ } from 'luxon' // immich uses luxon internally, so we should also use it
import { debug, log, setDebug } from './lib/log.ts'
import { exit } from 'node:process'
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

const { values: argValues } = parseArgs({
	args: Bun.argv.slice(2), // [0] is bun executable, [1] is this file
	options: {
		'album-name': {
			type: 'string',
		},
		'album-id': {
      // takes precedence over album-name
			type: 'string',
		},
		verbose: {
			type: 'boolean',
			default: false,
			short: 'v',
		},
		'dry-run': {
			type: 'boolean',
			short: 'n',
		},
		'max-write-ops': {
			type: 'string',
			default: Number.MAX_SAFE_INTEGER.toString(),
			short: 'm',
		},
		tag: {
			type: 'string',
		},

		stacks: {
			type: 'boolean',
			default: false,
		},

		'dates-from-sidecar': {
			type: 'boolean',
			default: false,
		},
		'dates-from-filename': {
			type: 'boolean',
			default: false,
		},
		'in-time-bucket': {
			// bucket to fix metadata on. full bucket name is ISO date string like 2015-06-01T00:00:00.000Z
			// "2014-05" for Month bucket
			// "2014-05-07" for Day bucket
			type: 'string',
			default: '',
		},
		'expected-year-for-fixed': {
			// sanity check. Expected year for fixed date
			type: 'string',
			short: 'e',
		},
		'sidecar-folder': {
			// '/tmp/imm/Photos from 2015'
			// only json sidecar files are needed
			type: 'string',
			default: '',
		},
		'use-creation-time': {
			// in sidecar JSON, true to use creationTime , false to use photoTakenTime
			type: 'boolean',
			default: false,
		},
	},
})

setDebug(argValues.verbose)

if (!argValues['album-id'] && !argValues['album-name']) throw new Error('provide an album name or ID')
if (argValues['album-id'])
	assert.match(argValues['album-id'], /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/, 'album-id must be a UUID')

const s = +argValues.stacks
const ds = +argValues['dates-from-sidecar']
const df = +argValues['dates-from-filename']
if ((s && (ds || df)) || s + ds + df === 0 || ds + df > 1) {
	throw new Error('choose either to create stacks or to fix dates. Only choose one fix date operation')
}

if (ds || df) {
	assert.match(
		argValues['in-time-bucket'],
		/\d{4}-\d{2}(-\d{2})?$/,
		'time bucket must be an ISO date string like YYYY-MM or YYYY-MM-DD',
	)

	if (ds) {
		if (!argValues['sidecar-folder']) throw new Error('must provide sidecar folder to fix dates from sidecar')
		await readdir(argValues['sidecar-folder']) // will throw if folder does not exist
	}

	if (argValues['expected-year-for-fixed']) {
		assert.match(argValues['expected-year-for-fixed'], /^\d{4}$/, 'expected year must be in the format YYYY')
	}
}

const MAX_WRITE_OPS: number = argValues['dry-run'] ? 0 : Number.parseInt(argValues['max-write-ops'], 10)
debug('max write ops', MAX_WRITE_OPS)
if (Number.isNaN(MAX_WRITE_OPS)) throw new Error('max-write-ops is Not a Number')

init({ baseUrl: 'http://192.168.1.200:2283/api', apiKey: '21TDFYiI1CtfeuxxlLNGHHCDVpg97ZwwrjWmAnG48M' })

let albumId = argValues['album-id']
if (!albumId) {
	const albums = await getAllAlbums({})
	const albumName = argValues['album-name']
	const matchedAlbums = albums.filter((album) => album.albumName === albumName)
	if (!matchedAlbums.length || !matchedAlbums[0]) throw new Error(`album ${albumName} not found`)
	if (matchedAlbums.length > 1) throw new Error(`multiple albums found with name ${albumName}`)
	albumId = matchedAlbums[0].id
  log('album', albumName, '--> id', albumId)
}

if (argValues['dates-from-sidecar']) {
	await fixDatesFromSidecar({
		albumId,
		MAX_WRITE_OPS,
		TARGET_BUCKET: argValues['in-time-bucket'],
		SIDECAR_FOLDER: argValues['sidecar-folder'],
		EXPECTED_YEAR: argValues['expected-year-for-fixed'],
		useCreationTime: argValues['use-creation-time'],
	})
}

if (argValues['dates-from-filename']) {
	await fixDatesFromFilename({
		albumId,
		MAX_WRITE_OPS,
		TARGET_BUCKET: argValues['in-time-bucket'],
		EXPECTED_YEAR: argValues['expected-year-for-fixed'],
		tag: argValues.tag,
	})
}

if (argValues.stacks) {
	await createEditedStacks({ albumId, MAX_WRITE_OPS })
}
