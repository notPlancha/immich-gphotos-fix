import { exit } from "node:process";

// -H 'x-api-key: aontehusathoeu' \
const apiKey = "21TDFYiI1CtfeuxxlLNGHHCDVpg97ZwwrjWmAnG48M";

// https://immich.app/docs/api/login/
/*
loginData = {
  "email": "user@email.com",
  "password": "password"
}
const login = await fetch("http://192.168.1.200:2283/api/search/metadata", {
    method: 'POST',
    body: loginData,
    headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json'
    }
})

login.accessToken
*/

// http://192.168.1.200:2283/search?query={%22model%22%3A%22Canon+EOS+5D+Mark+II%22}
//const searchData = {"page":1,"withExif":true,"isVisible":true,"language":"en-US","model":"Canon EOS 5D Mark II"}
const searchData = { model: "Canon EOS 5D Mark II", withExif: true };

// https://immich.app/docs/api/search-assets
const search = await fetch("http://192.168.1.200:2283/api/search/metadata", {
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

const items = search.assets.items.length;
console.log("assets.total", search.assets.total);
console.log("assets.count", search.assets.count);
console.log("asssets.items.length", items);
for (let i = 0; i < items; i++) {
	console.log("index", i);
	// if (i === 3) break;
	const item = search.assets.items[i];

	const tz = item.exifInfo.timeZone; //= "UTC" | "UTC-8" | "UTC-7"
	const filename = item.originalFileName;
	if (tz !== null && tz !== "UTC") {
		console.log("date already set to", tz, "on", filename);
		continue;
	}

	const date = item.exifInfo.dateTimeOriginal;
	if (!date.endsWith("+00:00"))
		throw new Error(`${date} should have had UTC on ${filename}`);
	const dateObj = new Date(date);
	// no media between, aug 26 -> nov 23
	const november = 10; // 0 === january
	const newTz = dateObj.getMonth() < november ? "-07:00" : "-08:00";
	const newDate = date.replace("+00:00", newTz);

	const id = item.id;
	console.log("updating", filename, "from", date, "to", newDate);
	updateAsset(id, filename, newDate).catch((e) => console.error(e));
}

// https://immich.app/docs/api/update-asset
function updateAsset(id: string, filename: string, newDate: string) {
	const putData = { dateTimeOriginal: newDate };
	return fetch(`http://192.168.1.200:2283/api/assets/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			"x-api-key": apiKey,
		},
		body: JSON.stringify(putData),
	}).then((r) => {
		if (!r.ok) throw new Error(String(r.status));
		console.log(filename, r.status);
		return r.json();
	});
}
//search.assets.items[i].id = "3fc16e82-5aa5-494c-b5b5-8669413c94a0"
//search.assets.items[i].exifInfo.dateTimeOriginal = "2020-12-18T00:24:50+00:00"

// Sun, 1 Nov, 02:00	PDT → PST	-1 hour (DST end)	UTC-7 -> UTC-8h

// export {};
