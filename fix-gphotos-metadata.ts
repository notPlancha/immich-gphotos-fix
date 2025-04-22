import { $ } from "bun";
import {
	init,
	getTimeBuckets,
	AssetOrder,
	TimeBucketSize,
	getTimeBucket,
	updateAsset,
} from "@immich/sdk";
import { exit } from "node:process";
import { DateTime } from "luxon";

const apiKey = "21TDFYiI1CtfeuxxlLNGHHCDVpg97ZwwrjWmAnG48M";
init({ baseUrl: "http://192.168.1.200:2283/api", apiKey });

const album2014 = "6e966c34-9590-48fd-8592-0fc2c885d2c7";
const gphotosFolder = "/tmp/imm/Photos from 2014/";

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
	console.log("got", bucket.length, "items in bucket", first.timeBucket);
	await Bun.write("bucket.json", JSON.stringify(bucket, null, 2));
	console.log("wrote bucket.json");

	bucket.some(async (asset) => {
		console.log("checking", asset.originalFileName);
		const unixTimestamp = await getTimeFromSidecar(asset.originalFileName);
		console.log("unix timestamp from sidecar:", unixTimestamp);
		await addTimeToAsset(unixTimestamp, asset.id);
		exit(20);
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
async function findSidecar(filename: string) {
	const uneditedFilename = filename.replace("-edited.jp", ".jp");

	// IMG-20141201-WA0001.jpg.supplemental-metadata.json
	// IMG-20141013-WA0001-edited.jpeg // might have .jpeg extension
	const sidecar = `${gphotosFolder}${uneditedFilename}.supplemental-metadata.json`;
	const f = Bun.file(sidecar);
	const exists = await f.exists();
	console.log(sidecar, exists ? "exists" : "doesnt exist");
	if (exists) return f;

	throw new Error(`sidecar not found for ${filename}`);
}
async function getTimeFromSidecar(filename: string) {
	if (!filename.endsWith(".jpg") && !filename.endsWith(".jpeg"))
		throw new Error(`unexpected filename ${filename}`);
	const f = await findSidecar(filename);
	const sidecar = (await f.json()) as SupplementalMetadata;
	// console.dir(sidecar, { depth: 5 });
	const unixTimestamp = sidecar.photoTakenTime.timestamp;
	if (!unixTimestamp) throw new Error("no timestamp in sidecar");
	return unixTimestamp;
}

async function addTimeToAsset(unixTime: string, assetId: string) {
	const unixTimeAsNum = Number.parseInt(unixTime, 10);
	if (Number.isNaN(unixTimeAsNum)) throw new Error(`${unixTime} is NaN`);

	const d = new Date(unixTimeAsNum * 1000);

	const isoString = d.toISOString(); // could throw `RangeError: Invalid time value`
	if (!isoString.startsWith("2014") || !isoString.endsWith("Z"))
		throw new Error(`timestamp conversion failed with ${assetId}: ${unixTime}`);

	console.log("ISO timestamp: ", isoString);
	const dateTimeOriginal = `${isoString.slice(0, -1)}+00:00`;
	console.log("converted to dto", dateTimeOriginal);
	console.log("assigning to asset:", assetId);

	const r = await updateAsset({
		id: assetId,
		updateAssetDto: { dateTimeOriginal },
	});
	// fileCreatedAt and localDateTime and exifInfo.dateTimeOriginal will be changed
	// "fileCreatedAt": "2014-10-06T16:00:00.000Z",
	// "localDateTime": "2014-10-06T12:00:00.000Z",
	//  exifInfo."dateTimeOriginal": "2014-10-06T16:00:00+00:00",

	// exifInfo.dateTimeOriginal changes immediately, the others do not

	console.log(r);
	console.log(r.exifInfo?.dateTimeOriginal);
	console.log(r.exifInfo?.dateTimeOriginal === dateTimeOriginal);
}

await main();
