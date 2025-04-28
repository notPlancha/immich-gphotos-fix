import { init } from '@immich/sdk'
import { parseArgs } from 'node:util'
import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { createEditedStacks } from './cmd/stacks.ts'
import { fixBadBuckets } from './cmd/dates.ts'
import { Settings /*, type TSSettings */ } from 'luxon' // immich uses luxon internally, so we should also use it
import { setDebug } from './lib/log.ts'
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
		'album-id': {
			type: 'string',
			short: 'A',
		},
		debug: {
			type: 'boolean',
			default: false,
		},
		'dry-run': {
			type: 'boolean',
      short: 'n',
		},

		stacks: {
			type: 'boolean',
		},

		'fix-dates-in-time-bucket': {
			// bucket to fix metadata on. full bucket name is ISO date string like 2015-06-01T00:00:00.000Z
			type: 'string',
			default: '',
		},
		'sidecar-folder': {
			// only json sidecars are needed
			type: 'string',
			default: '',
		},
		'expected-year-for-fixed': {
			// sanity check. Expected year for fixed date
			type: 'string',
		},
	},
})

if (!argValues['album-id']) throw new Error('provide an album ID')
assert.match(argValues['album-id'], /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/, 'album-id must be a UUID')

if (
	(argValues.stacks && argValues['fix-dates-in-time-bucket']) ||
	(!argValues.stacks && !argValues['fix-dates-in-time-bucket'])
) {
	throw new Error('choose either to create stacks or to fix dates')
}

if (argValues['fix-dates-in-time-bucket']) {
	assert.match(argValues['fix-dates-in-time-bucket'], /^\d{4}-\d{2}-\d{2}/, 'time bucket must be an ISO date string')

	if (!argValues['sidecar-folder']) throw new Error('must provide sidecar folder to fix dates')
	await readdir(argValues['sidecar-folder']) // will throw if folder does not exist

	if (argValues['expected-year-for-fixed']) {
		assert.match(argValues['expected-year-for-fixed'], /^\d{4}$/, 'expected year must be in the format YYYY')
	}
}

setDebug(argValues.debug)

const MAX_WRITE_OPS: number = argValues['dry-run'] ? 0 : 50

const TARGET_BUCKET: string = argValues['fix-dates-in-time-bucket']
const SIDECAR_FOLDER: string = argValues['sidecar-folder'] // '/tmp/imm/Photos from 2015'
const EXPECTED_YEAR: string = argValues['expected-year-for-fixed'] ?? ''

init({ baseUrl: 'http://192.168.1.200:2283/api', apiKey: '21TDFYiI1CtfeuxxlLNGHHCDVpg97ZwwrjWmAnG48M' })

if (argValues['expected-year-for-fixed']) {
	await fixBadBuckets({ albumId: argValues['album-id'], MAX_WRITE_OPS, TARGET_BUCKET, SIDECAR_FOLDER, EXPECTED_YEAR })
}

if (argValues.stacks) {
	await createEditedStacks({ albumId: argValues['album-id'], MAX_WRITE_OPS })
}
