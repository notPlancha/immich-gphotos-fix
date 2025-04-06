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

const isObj = (uk: unknown) => typeof uk === "object" && uk !== null;
if (
	!isObj(search) ||
	!("assets" in search) ||
	!isObj(search.assets) ||
	!("items" in search.assets) ||
	!("total" in search.assets) ||
	!("count" in search.assets) ||
	!Array.isArray(search.assets.items)
)
	throw new Error(`bad api result - ${search}`);

const items = search.assets.items;
console.log("assets.total", search.assets.total);
console.log("assets.count", search.assets.count);
console.log("asssets.items.length", items.length);
// originalPath === "upload/library/admin/2020/08/26/IMG_7140.cr2"
const filenames = items
	.map((item) => item.originalPath)
	.map((path) => `/path/to/media/immich/${path.substring(7)}`);

// const allFilenames = filenames.join(`\n`);
// await $`echo ${allFilenames} > /tmp/all.txt`
// await $`exiftool -time:all -progress -@ /tmp/all.txt`;

for (const filename of filenames) {
  const xmp = `${filename}.xmp`
  await $`cat ${xmp}`
  await $`rm -vf ${xmp}`
  
  // the backslashes at the end will concat this to a single line string
  await $`exiftool -d '%Y-%m-%dT%H:%M:%S%f%:z' \
    -TagsFromFile ${filename} \
    '-XMP-exif:DateTimeOriginal<\${CreateDate;$_=$self->GetValue("SubSecCreateDate")||$_}' \
    '-XMP-photoshop:DateCreated<\${CreateDate;$_=$self->GetValue("SubSecCreateDate")||$_}' \
    ${xmp}`
  
  await $`cat ${xmp}`

  break
	// await $`fd -i ${filename} /path/to/media/immich/ -E '*.xmp' -x exiftool -p '$CreateDate' -d '%Y-%m-%dT%H:%M:%S%:z'`;
}

