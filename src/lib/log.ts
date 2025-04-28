let DEBUG_LOG = false
export const setDebug = (debug: boolean) => {
	DEBUG_LOG = debug
}

export const log = console.log.bind(console)
export const debug = (...args: unknown[]) => {
	if (DEBUG_LOG) log(...args)
}
export const dir = (unk: unknown) => {
	if (DEBUG_LOG) console.dir(unk, { depth: 100 })
}
