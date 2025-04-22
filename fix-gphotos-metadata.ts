import { $ } from "bun";
import {
	init,
	getTimeBuckets,
	AssetOrder,
	TimeBucketSize,
	getTimeBucket,
} from "@immich/sdk";
import { exit } from "node:process";

const apiKey = "21TDFYiI1CtfeuxxlLNGHHCDVpg97ZwwrjWmAnG48M";
init({ baseUrl: "http://192.168.1.200:2283/api", apiKey });

const album2014 = "6e966c34-9590-48fd-8592-0fc2c885d2c7";

// https://immich.app/docs/api/search-assets
// https://immich.app/docs/api/get-album-info
// const albums = await getAllAlbums({});
// http://192.168.1.200:2283/api/timeline/buckets?albumId=6e966c34-9590-48fd-8592-0fc2c885d2c7&order=desc&size=MONTH
// http://192.168.1.200:2283/api/timeline/bucket?albumId=6e966c34-9590-48fd-8592-0fc2c885d2c7&order=desc&size=MONTH&timeBucket=2025-03-01T00%3A00%3A00.000Z

async function main() {
	const buckets = await getTimeBuckets({
		albumId: album2014,
		order: AssetOrder.Desc,
		size: TimeBucketSize.Month,
		// withStacked: true, // decreases "count"
	});
	// console.log(buckets);
	console.log("got", buckets.length, "buckets");

	// await Bun.write("buckets.json", JSON.stringify(buckets, null, 2));
	// console.log('wrote buckets.json');

	const first = buckets[0];
	if (!first) throw new Error("no buckets");
	if (!first.timeBucket.startsWith("2025"))
		throw new Error("bad bucket missing");
	// first.timeBucket = '2014-12-01T00:00:00.000Z'

	const bucket = await getTimeBucket({
		albumId: album2014,
		size: TimeBucketSize.Month,
		order: AssetOrder.Desc,
		timeBucket: first.timeBucket,
		withStacked: false, // if false, "stack" prop is always null. if true, returns fewer items, one per stack.
	});
	// console.log(bucket);

	// await Bun.write("bucket.json", JSON.stringify(bucket, null, 2));
	// console.log("wrote bucket.json");

	bucket.some(async (asset) => {
		console.log("checking", asset.originalFileName);
		await getTimeFromSidecar(asset.originalFileName);
	});
}

function createEditedStack() {
	// "originalFileName": "IMG-20140811-WA0035-edited.jpg", // extension seems normalized to always be .jpg, not .jpeg
}

interface SupplementalMetadata {
	title: string;
	description: string;
	imageViews: string;
	creationTime: {
		timestamp: string;
		formatted: string;
	};
	photoTakenTime: {
		timestamp: string;
		formatted: string;
	};
	geoData: {
		latitude: number;
		longitude: number;
		altitude: number;
		latitudeSpan: number;
		longitudeSpan: number;
	};
	geoDataExif?: {
		latitude: number;
		longitude: number;
		altitude: number;
		latitudeSpan: number;
		longitudeSpan: number;
	};
	url: string;
	googlePhotosOrigin?: {
		mobileUpload: {
			deviceFolder: {
				localFolderName: string;
			};
			deviceType: string;
		};
	};
	appSource?: {
		androidPackageName: string;
	};
}
async function findSidecar(basename: string) {
	const uneditedBasename = basename.endsWith("-edited")
		? basename.slice(0, "-edited".length * -1)
		: basename;

	// IMG-20141201-WA0001.jpg.supplemental-metadata.json // might have .jpeg extension
	for (const ext of ["jpg", "jpeg"]) {
		const folder = "/tmp/imm/Photos from 2014/";
		const sidecar = `${folder}${uneditedBasename}.${ext}.supplemental-metadata.json`;
		const f = Bun.file(sidecar);
		const exists = await f.exists();
		console.log(sidecar, exists ? "exists" : "doesnt exist");
		if (exists) return f;
	}
	throw new Error(`sidecar not found for ${basename}`);
}
async function getTimeFromSidecar(filename: string) {
	let basename: string;
	if (filename.endsWith(".jpg"))
		basename = filename.slice(0, ".jpg".length * -1);
	else if (filename.endsWith(".jpeg"))
		basename = filename.slice(0, ".jpeg".length * -1);
	else throw new Error(`unexpected filename ${filename}`);
	const f = await findSidecar(basename);
	const sidecar = (await f.json()) as SupplementalMetadata;
	// console.dir(sidecar, { depth: 5 });
	const timestamp = sidecar.photoTakenTime.timestamp;
	if (!timestamp) throw new Error("no timestamp in sidecar");
	return timestamp;
}

function addTimeToAsset() {}

await main();
