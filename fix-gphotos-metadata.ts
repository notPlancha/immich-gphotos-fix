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
import { DateTime, Settings } from "luxon"; // immich uses luxon internally, so we should also use it
// import type { TSSettings } from "luxon";
declare module "luxon" {
	interface TSSettings {
		throwOnInvalid: true;
	}
}
Settings.throwOnInvalid = true;
Settings.defaultZone = "utc";

const apiKey = "21TDFYiI1CtfeuxxlLNGHHCDVpg97ZwwrjWmAnG48M";
init({ baseUrl: "http://192.168.1.200:2283/api", apiKey });

const album2014 = "6e966c34-9590-48fd-8592-0fc2c885d2c7";
const gphotosFolder = "/tmp/imm/Photos from 2014";

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
	console.log("got", bucket.length, "items in bucket named", first.timeBucket);
	// await Bun.write("bucket.json", JSON.stringify(bucket, null, 2));
	// console.log("wrote bucket.json");

	let i = 0;
	for (const asset of bucket) {
		console.log("checking", asset.originalFileName);
		const unixTimestamp = await getTimeFromSidecar(asset.originalFileName);
		console.log("unix timestamp from sidecar:", unixTimestamp);
		await addTimeToAsset(unixTimestamp, asset.id);
		console.log("");
		i++;
		// if (i === 300) exit(i);
	}
}

function createEditedStack() {}

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
	const possibleExts = [".jpg", ".jpeg", ".mp4", ".png", ".gif"];
	const fileExt = possibleExts.find((ext) => filename.endsWith(ext));
	if (!fileExt) throw new Error(`unknown extension in filename ${filename}`);
	const fnNoExt = filename.slice(0, fileExt.length * -1);

	// IMG-20141013-WA0001-edited.jpeg // might have .jpeg extension
	// IMG-20141201-WA0002.jpg.supplemental-metadata.json
	// 04d0fd9dc8abd6fac3014db0cd05d0ba.jpg.supplemen.json // max 51 chars filename
	// Screenshot_2014-12-18-10-50-54.png.supplementa.json

	// hangout_snapshot_0(1).png
	// hangout_snapshot_0-edited(1).png
	// hangout_snapshot_0.png.supplemental-metadata(1).json

	const dupeRegex = /(.*)(\(\d{1,2}\))$/; // could extend this regex to include exts and -edited
	const matches = fnNoExt.match(dupeRegex);
	let fnNoDupe = fnNoExt;
	let dupeStr = "";
	if (matches) {
		if (matches.length !== 3 || !matches[1] || !matches[2])
			throw new Error(`unexpected dupe match for: ${filename}`);
		fnNoDupe = matches[1]; // "hangout_snapshot_0-edited"
		dupeStr = matches[2]; // "(12)"
	}

	const uneditedFilename = fnNoDupe.replace(/-edited$/, "");

	const suffix = "supplemental-metadata";
	let exists = false;
	for (let i = suffix.length; i >= 1; i--) {
		const trimmedSuffix = suffix.slice(0, i);
		const sidecar = `${gphotosFolder}/${uneditedFilename}${fileExt}.${trimmedSuffix}${dupeStr}.json`;
		const f = Bun.file(sidecar);
		exists = await f.exists();
		console.log(sidecar, exists ? "exists" : "doesnt exist");
		if (exists) return f;
	}

	throw new Error(`sidecar not found for ${filename}`);
}
async function getTimeFromSidecar(filename: string) {
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

	const dt = DateTime.fromSeconds(unixTimeAsNum, { zone: "UTC" });
	const isoString = dt.toISO({
		// suppressMilliseconds: true,
	});

	if (!dt.isValid || !isoString.startsWith("2014") || !isoString.endsWith("Z"))
		throw new Error(`timestamp conversion failed with ${assetId}: ${unixTime}`);

	console.log("as ISO:", isoString);
	// const dateTimeOriginal = `${isoString.slice(0, -1)}+00:00`;
	// console.log("converted to dto", dateTimeOriginal);
	console.log("assigning to asset:", assetId);

	const r = await updateAsset({
		id: assetId,
		updateAssetDto: { dateTimeOriginal: isoString },
	});
	// fileCreatedAt and localDateTime and exifInfo.dateTimeOriginal will be changed
	// "fileCreatedAt": "2014-10-06T16:00:00.000Z",
	// "localDateTime": "2014-10-06T12:00:00.000Z",
	//  exifInfo."dateTimeOriginal": "2014-10-06T16:00:00+00:00",

	// exifInfo.dateTimeOriginal changes immediately, the others do not

	// console.log(r);
	if (!r.exifInfo || !r.exifInfo.dateTimeOriginal)
		throw new Error("no exifInfo on asset");
	console.log("exifInfo.dateTimeOriginal:", r.exifInfo.dateTimeOriginal);
	const rdt = DateTime.fromISO(r.exifInfo.dateTimeOriginal);
	console.log("as luxon obj:", rdt);

	// console.log(+dt, "===", +rdt);
	const setTimeSuccessful = +dt === +rdt;
	if (!setTimeSuccessful)
		throw new Error(
			"time on returned asset was different than what we set it to",
		);
}

await main();
