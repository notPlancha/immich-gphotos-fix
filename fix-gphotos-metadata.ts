import { $ } from "bun";
import {
	getAllAlbums,
	getMyUser,
	init,
	getTimeBuckets,
	AssetOrder,
	TimeBucketSize,
} from "@immich/sdk";

// const albums = await getAllAlbums({});

const apiKey = "21TDFYiI1CtfeuxxlLNGHHCDVpg97ZwwrjWmAnG48M";
init({ baseUrl: "http://192.168.1.200:2283/api", apiKey });

const album2014 = "6e966c34-9590-48fd-8592-0fc2c885d2c7";

// https://immich.app/docs/api/search-assets
function api(endpoint: string, postData?: object) {
	const rinit: RequestInit = {
		method: postData ? "POST" : "GET",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			"x-api-key": apiKey,
		},
	} satisfies RequestInit;
	if (postData) rinit.body = JSON.stringify(postData);

	return fetch(`http://192.168.1.200:2283/api${endpoint}`, rinit).then((r) => {
		if (!r.ok) throw new Error(String(r.status));
		return r.json();
	});
}

const isObj = (uk: unknown) => typeof uk === "object" && uk !== null;

// type Buckets = Array<{}>;
function isBuckets(unk: unknown) {
	if (
		!Array.isArray(unk) ||
		!unk.every(
			(val) =>
				isObj(val) &&
				"timeBucket" in val &&
				typeof val.timeBucket === "string" &&
				"count" in val &&
				typeof val.timeBucket === "number",
		)
	) {
		throw new Error(`bad api result for buckets - ${unk}`);
	}
}

// https://immich.app/docs/api/get-album-info
// http://192.168.1.200:2283/api/timeline/buckets?albumId=6e966c34-9590-48fd-8592-0fc2c885d2c7&order=desc&size=MONTH
// http://192.168.1.200:2283/api/timeline/bucket?albumId=6e966c34-9590-48fd-8592-0fc2c885d2c7&order=desc&size=MONTH&timeBucket=2025-03-01T00%3A00%3A00.000Z

// const albums = await api("/albums/");

// const buckets = await api(
// 	`/timeline/buckets?albumId=${album2014}&size=MONTH&order=desc`,
// );
const buckets = await getTimeBuckets({
	albumId: album2014,
	order: AssetOrder.Desc,
	size: TimeBucketSize.Month,
}); // withStacked?

// isBuckets(buckets);
const b = buckets;
// await Bun.write("buckets.json", buckets);
console.log(buckets);
