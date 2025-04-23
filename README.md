# immich Google Photos scripts

## Motivation

When uploading google photos to immich, the [immich-go](https://github.com/simulot/immich-go) cli does a bunch of extra work that is not needed or sometimes incorrect. While uploading google photos, it always uses the `supplemental-metadata.json` sidecar UTC timestamp, while filling in the timezone from system. Thus it creates unnecessary XMP files when embedded metadata is fine, and often fills in the incorrect timezone (when the photo was taken in a different TZ than the system TZ).

immich-go also does not handle `-edited` google photos correctly. When Google Photos adjusts a photo via color shift, crop, or rotate, it creates a copy of the photo with an `-edited` suffix (while keeping emedded metadata intact), adding or subtracting a few kb in the process. And there is only one `supplemental-metadata.json` for the two copies. Conflicting logic in immich-go detects the larger version as a "higher resolution copy", and discards the other. We want to keep the original as well as the edited version (incase it was edited for a good reason), and stack the two in immich. At some point Google applied color shift to every single photo, so there are many stacks to be created in immich.

So, instead of using immich-go, we do a different two-step process to avoid mistakes and missing uploads.

1) Upload photos with the [immich cli](https://immich.app/docs/features/command-line-interface/), grouping them into an album via `--album-name` / `-A`.
2) Identify the photos that have missing/bad metadata, and using the [immich API](https://immich.app/docs/api/), repair them using the Google Photos `supplemental-metadata.json` sidecar.

The photo assets that are missing embedded metadata can be easily identified because they all have the date that the Google Takeout was created.  
The photos that have wrong metadata are also grouped en masse on seemingly-random days. These photos/videos have embedded metadata, but it's incorrect, oftentimes with the date they were exported from WhatsApp or some other app.

These photos/videos that need repair can be grabbed via the [immich bucket API](https://immich.app/docs/api/get-time-buckets), which can select by album ID, and are grouped by month or day. Then the `supplemental-metadata.json` date can be added to every asset in the bucket.

## Usage

Upload photos:

```bash
immich upload -r -A 'Photos from 2015' ./'Photos from 2015'
```

Install dependencies:

```bash
bun install
```

Fix metadata from sidecar:

```bash
bun run 
```

Stack photos:

```bash
bun run 
```

## code notes

Variables in `ALL_CAPS` are meant to be configured by the user.

Mostly no concurrency. Not needed, plenty fast without it, makes catching errors easier.

## TODO

`unstackSolo()`
