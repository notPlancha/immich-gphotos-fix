import { $ } from "bun";

const apiKey = "21TDFYiI1CtfeuxxlLNGHHCDVpg97ZwwrjWmAnG48M";

// http://192.168.1.200:2283/search?query={%22model%22%3A%22Canon+EOS+5D+Mark+II%22}
const searchData = { model: "Canon EOS 5D Mark II", withExif: true };

// https://immich.app/docs/api/search-assets
const search = await fetch("http://localhost:2283/api/search/metadata", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
		"x-api-key": apiKey,
	},
	body: JSON.stringify(searchData),
}).then((r) => {
	if (!r.ok) throw new Error(String(r.status));
	return r.json();
});
// console.log(search);

const items = search.assets.items;
console.log("assets.total", search.assets.total);
console.log("assets.count", search.assets.count);
console.log("asssets.items.length", items.length);
const filenames = items.map((item) => item.originalFileName);

filenames.map(filename => $``)
await $`echo "Hello World!"`; // Hello World!

const filenameJSON = JSON.stringify(filenames);
console.log(filenameJSON);
