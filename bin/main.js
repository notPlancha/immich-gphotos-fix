// node_modules/@oazapfts/runtime/util.js
var a = [encodeURIComponent, encodeURIComponent];
function f(r, n = ",") {
  const t = (e, o) => {
    const c = r[o % r.length];
    return typeof e > "u" ? "" : typeof e == "object" ? Array.isArray(e) ? e.map(c).join(n) : Object.entries(e).reduce((i, d) => [...i, ...d], []).map(c).join(n) : c(String(e));
  };
  return (e, ...o) => e.reduce((c, u, i) => `${c}${u}${t(o[i], i)}`, "");
}
function l(r = ",") {
  return (n, t = a) => Object.entries(n).filter(([, e]) => e !== undefined).map(([e, o]) => f(t, r)`${e}=${o}`).join("&");
}
function j(...r) {
  return r.filter(Boolean).map((n, t) => t === 0 ? n : n.replace(/^\/+/, "")).map((n, t, e) => t === e.length - 1 ? n : n.replace(/\/+$/, "")).join("/");
}

// node_modules/@oazapfts/runtime/query.js
function q(...r) {
  const n = r.filter(Boolean).join("&");
  return n && `?${n}`;
}
function m(r, n = a) {
  const o = f(n);
  return Object.entries(r).filter(([, t]) => t !== undefined).map(([t, e]) => Array.isArray(e) ? e.map((i) => o`${t}=${i}`).join("&") : typeof e == "object" ? m(e, n) : o`${t}=${e}`).join("&");
}
var O = l();
var l2 = l("|");
var k = l("%20");

// node_modules/@oazapfts/runtime/headers.js
function o(e, r) {
  const n = t(e);
  return t(r).forEach((i, s) => {
    n.set(s, i);
  }), n;
}
function t(e) {
  return e && !(e instanceof Headers) && !Array.isArray(e) ? new Headers(Object.fromEntries(Object.entries(e).filter(([, r]) => r != null).map(([r, n]) => [r, String(n)]))) : new Headers(e);
}

// node_modules/@oazapfts/runtime/index.js
function J(o2 = {}) {
  async function e(r, n) {
    const t2 = await p(r, n);
    let s;
    try {
      s = await t2.text();
    } catch {}
    return {
      status: t2.status,
      headers: t2.headers,
      contentType: t2.headers.get("content-type"),
      data: s
    };
  }
  async function i(r, n = {}) {
    const { status: t2, headers: s, contentType: u, data: c } = await e(r, {
      ...n,
      headers: o({
        Accept: "application/json"
      }, n.headers)
    });
    return (u ? u.includes("json") : false) ? {
      status: t2,
      headers: s,
      data: c ? JSON.parse(c) : null
    } : { status: t2, headers: s, data: c };
  }
  async function f2(r, n = {}) {
    const t2 = await p(r, n);
    let s;
    try {
      s = await t2.blob();
    } catch {}
    return { status: t2.status, headers: t2.headers, data: s };
  }
  async function p(r, n = {}) {
    const {
      baseUrl: t2,
      fetch: s,
      ...u
    } = {
      ...o2,
      ...n,
      headers: o(o2.headers, n.headers)
    }, c = j(t2, r);
    return await (s || fetch)(c, u);
  }
  return {
    ok: y,
    fetchText: e,
    fetchJson: i,
    fetchBlob: f2,
    mergeHeaders: o,
    json({ body: r, headers: n, ...t2 }) {
      return {
        ...t2,
        ...r != null && { body: JSON.stringify(r) },
        headers: o({
          "Content-Type": "application/json"
        }, n)
      };
    },
    form({ body: r, headers: n, ...t2 }) {
      return {
        ...t2,
        ...r != null && { body: O(r) },
        headers: o({
          "Content-Type": "application/x-www-form-urlencoded"
        }, n)
      };
    },
    multipart({ body: r, headers: n, ...t2 }) {
      if (r == null)
        return { ...t2, body: r, headers: t(n) };
      const s = new (o2.formDataConstructor || t2.formDataConstructor || FormData), u = (c, a2) => {
        typeof a2 == "string" || a2 instanceof Blob ? s.append(c, a2) : typeof a2 == "number" || typeof a2 == "boolean" ? s.append(c, String(a2)) : s.append(c, new Blob([JSON.stringify(a2)], { type: "application/json" }));
      };
      return Object.entries(r).forEach(([c, a2]) => {
        Array.isArray(a2) ? a2.forEach((m2) => u(c, m2)) : u(c, a2);
      }), {
        ...t2,
        body: s,
        headers: t(n)
      };
    }
  };
}
var j2 = [200, 201, 202, 204];
async function y(o2) {
  const e = await o2;
  if (j2.some((i) => i == e.status))
    return e.data;
  throw new l3(e.status, e.data, e.headers);
}
class l3 extends Error {
  status;
  data;
  headers;
  constructor(e, i, f2) {
    super(`Error: ${e}`), this.status = e, this.data = i, this.headers = f2;
  }
}

// node_modules/@immich/sdk/build/fetch-client.js
var defaults = {
  headers: {},
  baseUrl: "/api"
};
var oazapfts = J(defaults);
function getAllAlbums({ assetId, shared }, opts) {
  return oazapfts.ok(oazapfts.fetchJson(`/albums${q(m({
    assetId,
    shared
  }))}`, {
    ...opts
  }));
}
function updateAsset({ id, updateAssetDto }, opts) {
  return oazapfts.ok(oazapfts.fetchJson(`/assets/${encodeURIComponent(id)}`, oazapfts.json({
    ...opts,
    method: "PUT",
    body: updateAssetDto
  })));
}
function validateAccessToken(opts) {
  return oazapfts.ok(oazapfts.fetchJson("/auth/validateToken", {
    ...opts,
    method: "POST"
  }));
}
function pingServer(opts) {
  return oazapfts.ok(oazapfts.fetchJson("/server/ping", {
    ...opts
  }));
}
function createStack({ stackCreateDto }, opts) {
  return oazapfts.ok(oazapfts.fetchJson("/stacks", oazapfts.json({
    ...opts,
    method: "POST",
    body: stackCreateDto
  })));
}
function getAllTags(opts) {
  return oazapfts.ok(oazapfts.fetchJson("/tags", {
    ...opts
  }));
}
function createTag({ tagCreateDto }, opts) {
  return oazapfts.ok(oazapfts.fetchJson("/tags", oazapfts.json({
    ...opts,
    method: "POST",
    body: tagCreateDto
  })));
}
function tagAssets({ id, bulkIdsDto }, opts) {
  return oazapfts.ok(oazapfts.fetchJson(`/tags/${encodeURIComponent(id)}/assets`, oazapfts.json({
    ...opts,
    method: "PUT",
    body: bulkIdsDto
  })));
}
function getTimeBucket({ albumId, isArchived, isFavorite, isTrashed, key, order, personId, size, tagId, timeBucket, userId, withPartners, withStacked }, opts) {
  return oazapfts.ok(oazapfts.fetchJson(`/timeline/bucket${q(m({
    albumId,
    isArchived,
    isFavorite,
    isTrashed,
    key,
    order,
    personId,
    size,
    tagId,
    timeBucket,
    userId,
    withPartners,
    withStacked
  }))}`, {
    ...opts
  }));
}
function getTimeBuckets({ albumId, isArchived, isFavorite, isTrashed, key, order, personId, size, tagId, userId, withPartners, withStacked }, opts) {
  return oazapfts.ok(oazapfts.fetchJson(`/timeline/buckets${q(m({
    albumId,
    isArchived,
    isFavorite,
    isTrashed,
    key,
    order,
    personId,
    size,
    tagId,
    userId,
    withPartners,
    withStacked
  }))}`, {
    ...opts
  }));
}
var ReactionLevel;
(function(ReactionLevel2) {
  ReactionLevel2["Album"] = "album";
  ReactionLevel2["Asset"] = "asset";
})(ReactionLevel || (ReactionLevel = {}));
var ReactionType;
(function(ReactionType2) {
  ReactionType2["Comment"] = "comment";
  ReactionType2["Like"] = "like";
})(ReactionType || (ReactionType = {}));
var UserAvatarColor;
(function(UserAvatarColor2) {
  UserAvatarColor2["Primary"] = "primary";
  UserAvatarColor2["Pink"] = "pink";
  UserAvatarColor2["Red"] = "red";
  UserAvatarColor2["Yellow"] = "yellow";
  UserAvatarColor2["Blue"] = "blue";
  UserAvatarColor2["Green"] = "green";
  UserAvatarColor2["Purple"] = "purple";
  UserAvatarColor2["Orange"] = "orange";
  UserAvatarColor2["Gray"] = "gray";
  UserAvatarColor2["Amber"] = "amber";
})(UserAvatarColor || (UserAvatarColor = {}));
var UserStatus;
(function(UserStatus2) {
  UserStatus2["Active"] = "active";
  UserStatus2["Removing"] = "removing";
  UserStatus2["Deleted"] = "deleted";
})(UserStatus || (UserStatus = {}));
var AlbumUserRole;
(function(AlbumUserRole2) {
  AlbumUserRole2["Editor"] = "editor";
  AlbumUserRole2["Viewer"] = "viewer";
})(AlbumUserRole || (AlbumUserRole = {}));
var SourceType;
(function(SourceType2) {
  SourceType2["MachineLearning"] = "machine-learning";
  SourceType2["Exif"] = "exif";
  SourceType2["Manual"] = "manual";
})(SourceType || (SourceType = {}));
var AssetTypeEnum;
(function(AssetTypeEnum2) {
  AssetTypeEnum2["Image"] = "IMAGE";
  AssetTypeEnum2["Video"] = "VIDEO";
  AssetTypeEnum2["Audio"] = "AUDIO";
  AssetTypeEnum2["Other"] = "OTHER";
})(AssetTypeEnum || (AssetTypeEnum = {}));
var AssetOrder;
(function(AssetOrder2) {
  AssetOrder2["Asc"] = "asc";
  AssetOrder2["Desc"] = "desc";
})(AssetOrder || (AssetOrder = {}));
var Error2;
(function(Error3) {
  Error3["Duplicate"] = "duplicate";
  Error3["NoPermission"] = "no_permission";
  Error3["NotFound"] = "not_found";
  Error3["Unknown"] = "unknown";
})(Error2 || (Error2 = {}));
var Permission;
(function(Permission2) {
  Permission2["All"] = "all";
  Permission2["ActivityCreate"] = "activity.create";
  Permission2["ActivityRead"] = "activity.read";
  Permission2["ActivityUpdate"] = "activity.update";
  Permission2["ActivityDelete"] = "activity.delete";
  Permission2["ActivityStatistics"] = "activity.statistics";
  Permission2["ApiKeyCreate"] = "apiKey.create";
  Permission2["ApiKeyRead"] = "apiKey.read";
  Permission2["ApiKeyUpdate"] = "apiKey.update";
  Permission2["ApiKeyDelete"] = "apiKey.delete";
  Permission2["AssetRead"] = "asset.read";
  Permission2["AssetUpdate"] = "asset.update";
  Permission2["AssetDelete"] = "asset.delete";
  Permission2["AssetShare"] = "asset.share";
  Permission2["AssetView"] = "asset.view";
  Permission2["AssetDownload"] = "asset.download";
  Permission2["AssetUpload"] = "asset.upload";
  Permission2["AlbumCreate"] = "album.create";
  Permission2["AlbumRead"] = "album.read";
  Permission2["AlbumUpdate"] = "album.update";
  Permission2["AlbumDelete"] = "album.delete";
  Permission2["AlbumStatistics"] = "album.statistics";
  Permission2["AlbumAddAsset"] = "album.addAsset";
  Permission2["AlbumRemoveAsset"] = "album.removeAsset";
  Permission2["AlbumShare"] = "album.share";
  Permission2["AlbumDownload"] = "album.download";
  Permission2["AuthDeviceDelete"] = "authDevice.delete";
  Permission2["ArchiveRead"] = "archive.read";
  Permission2["FaceCreate"] = "face.create";
  Permission2["FaceRead"] = "face.read";
  Permission2["FaceUpdate"] = "face.update";
  Permission2["FaceDelete"] = "face.delete";
  Permission2["LibraryCreate"] = "library.create";
  Permission2["LibraryRead"] = "library.read";
  Permission2["LibraryUpdate"] = "library.update";
  Permission2["LibraryDelete"] = "library.delete";
  Permission2["LibraryStatistics"] = "library.statistics";
  Permission2["TimelineRead"] = "timeline.read";
  Permission2["TimelineDownload"] = "timeline.download";
  Permission2["MemoryCreate"] = "memory.create";
  Permission2["MemoryRead"] = "memory.read";
  Permission2["MemoryUpdate"] = "memory.update";
  Permission2["MemoryDelete"] = "memory.delete";
  Permission2["PartnerCreate"] = "partner.create";
  Permission2["PartnerRead"] = "partner.read";
  Permission2["PartnerUpdate"] = "partner.update";
  Permission2["PartnerDelete"] = "partner.delete";
  Permission2["PersonCreate"] = "person.create";
  Permission2["PersonRead"] = "person.read";
  Permission2["PersonUpdate"] = "person.update";
  Permission2["PersonDelete"] = "person.delete";
  Permission2["PersonStatistics"] = "person.statistics";
  Permission2["PersonMerge"] = "person.merge";
  Permission2["PersonReassign"] = "person.reassign";
  Permission2["SessionRead"] = "session.read";
  Permission2["SessionUpdate"] = "session.update";
  Permission2["SessionDelete"] = "session.delete";
  Permission2["SharedLinkCreate"] = "sharedLink.create";
  Permission2["SharedLinkRead"] = "sharedLink.read";
  Permission2["SharedLinkUpdate"] = "sharedLink.update";
  Permission2["SharedLinkDelete"] = "sharedLink.delete";
  Permission2["StackCreate"] = "stack.create";
  Permission2["StackRead"] = "stack.read";
  Permission2["StackUpdate"] = "stack.update";
  Permission2["StackDelete"] = "stack.delete";
  Permission2["SystemConfigRead"] = "systemConfig.read";
  Permission2["SystemConfigUpdate"] = "systemConfig.update";
  Permission2["SystemMetadataRead"] = "systemMetadata.read";
  Permission2["SystemMetadataUpdate"] = "systemMetadata.update";
  Permission2["TagCreate"] = "tag.create";
  Permission2["TagRead"] = "tag.read";
  Permission2["TagUpdate"] = "tag.update";
  Permission2["TagDelete"] = "tag.delete";
  Permission2["TagAsset"] = "tag.asset";
  Permission2["AdminUserCreate"] = "admin.user.create";
  Permission2["AdminUserRead"] = "admin.user.read";
  Permission2["AdminUserUpdate"] = "admin.user.update";
  Permission2["AdminUserDelete"] = "admin.user.delete";
})(Permission || (Permission = {}));
var AssetMediaStatus;
(function(AssetMediaStatus2) {
  AssetMediaStatus2["Created"] = "created";
  AssetMediaStatus2["Replaced"] = "replaced";
  AssetMediaStatus2["Duplicate"] = "duplicate";
})(AssetMediaStatus || (AssetMediaStatus = {}));
var Action;
(function(Action2) {
  Action2["Accept"] = "accept";
  Action2["Reject"] = "reject";
})(Action || (Action = {}));
var Reason;
(function(Reason2) {
  Reason2["Duplicate"] = "duplicate";
  Reason2["UnsupportedFormat"] = "unsupported-format";
})(Reason || (Reason = {}));
var AssetJobName;
(function(AssetJobName2) {
  AssetJobName2["RefreshFaces"] = "refresh-faces";
  AssetJobName2["RefreshMetadata"] = "refresh-metadata";
  AssetJobName2["RegenerateThumbnail"] = "regenerate-thumbnail";
  AssetJobName2["TranscodeVideo"] = "transcode-video";
})(AssetJobName || (AssetJobName = {}));
var AssetMediaSize;
(function(AssetMediaSize2) {
  AssetMediaSize2["Fullsize"] = "fullsize";
  AssetMediaSize2["Preview"] = "preview";
  AssetMediaSize2["Thumbnail"] = "thumbnail";
})(AssetMediaSize || (AssetMediaSize = {}));
var ManualJobName;
(function(ManualJobName2) {
  ManualJobName2["PersonCleanup"] = "person-cleanup";
  ManualJobName2["TagCleanup"] = "tag-cleanup";
  ManualJobName2["UserCleanup"] = "user-cleanup";
  ManualJobName2["MemoryCleanup"] = "memory-cleanup";
  ManualJobName2["MemoryCreate"] = "memory-create";
  ManualJobName2["BackupDatabase"] = "backup-database";
})(ManualJobName || (ManualJobName = {}));
var JobName;
(function(JobName2) {
  JobName2["ThumbnailGeneration"] = "thumbnailGeneration";
  JobName2["MetadataExtraction"] = "metadataExtraction";
  JobName2["VideoConversion"] = "videoConversion";
  JobName2["FaceDetection"] = "faceDetection";
  JobName2["FacialRecognition"] = "facialRecognition";
  JobName2["SmartSearch"] = "smartSearch";
  JobName2["DuplicateDetection"] = "duplicateDetection";
  JobName2["BackgroundTask"] = "backgroundTask";
  JobName2["StorageTemplateMigration"] = "storageTemplateMigration";
  JobName2["Migration"] = "migration";
  JobName2["Search"] = "search";
  JobName2["Sidecar"] = "sidecar";
  JobName2["Library"] = "library";
  JobName2["Notifications"] = "notifications";
  JobName2["BackupDatabase"] = "backupDatabase";
})(JobName || (JobName = {}));
var JobCommand;
(function(JobCommand2) {
  JobCommand2["Start"] = "start";
  JobCommand2["Pause"] = "pause";
  JobCommand2["Resume"] = "resume";
  JobCommand2["Empty"] = "empty";
  JobCommand2["ClearFailed"] = "clear-failed";
})(JobCommand || (JobCommand = {}));
var MemoryType;
(function(MemoryType2) {
  MemoryType2["OnThisDay"] = "on_this_day";
})(MemoryType || (MemoryType = {}));
var PartnerDirection;
(function(PartnerDirection2) {
  PartnerDirection2["SharedBy"] = "shared-by";
  PartnerDirection2["SharedWith"] = "shared-with";
})(PartnerDirection || (PartnerDirection = {}));
var PathEntityType;
(function(PathEntityType2) {
  PathEntityType2["Asset"] = "asset";
  PathEntityType2["Person"] = "person";
  PathEntityType2["User"] = "user";
})(PathEntityType || (PathEntityType = {}));
var PathType;
(function(PathType2) {
  PathType2["Original"] = "original";
  PathType2["Fullsize"] = "fullsize";
  PathType2["Preview"] = "preview";
  PathType2["Thumbnail"] = "thumbnail";
  PathType2["EncodedVideo"] = "encoded_video";
  PathType2["Sidecar"] = "sidecar";
  PathType2["Face"] = "face";
  PathType2["Profile"] = "profile";
})(PathType || (PathType = {}));
var SearchSuggestionType;
(function(SearchSuggestionType2) {
  SearchSuggestionType2["Country"] = "country";
  SearchSuggestionType2["State"] = "state";
  SearchSuggestionType2["City"] = "city";
  SearchSuggestionType2["CameraMake"] = "camera-make";
  SearchSuggestionType2["CameraModel"] = "camera-model";
})(SearchSuggestionType || (SearchSuggestionType = {}));
var SharedLinkType;
(function(SharedLinkType2) {
  SharedLinkType2["Album"] = "ALBUM";
  SharedLinkType2["Individual"] = "INDIVIDUAL";
})(SharedLinkType || (SharedLinkType = {}));
var Error22;
(function(Error23) {
  Error23["Duplicate"] = "duplicate";
  Error23["NoPermission"] = "no_permission";
  Error23["NotFound"] = "not_found";
})(Error22 || (Error22 = {}));
var SyncEntityType;
(function(SyncEntityType2) {
  SyncEntityType2["UserV1"] = "UserV1";
  SyncEntityType2["UserDeleteV1"] = "UserDeleteV1";
  SyncEntityType2["PartnerV1"] = "PartnerV1";
  SyncEntityType2["PartnerDeleteV1"] = "PartnerDeleteV1";
  SyncEntityType2["AssetV1"] = "AssetV1";
  SyncEntityType2["AssetDeleteV1"] = "AssetDeleteV1";
  SyncEntityType2["AssetExifV1"] = "AssetExifV1";
  SyncEntityType2["PartnerAssetV1"] = "PartnerAssetV1";
  SyncEntityType2["PartnerAssetDeleteV1"] = "PartnerAssetDeleteV1";
  SyncEntityType2["PartnerAssetExifV1"] = "PartnerAssetExifV1";
})(SyncEntityType || (SyncEntityType = {}));
var SyncRequestType;
(function(SyncRequestType2) {
  SyncRequestType2["UsersV1"] = "UsersV1";
  SyncRequestType2["PartnersV1"] = "PartnersV1";
  SyncRequestType2["AssetsV1"] = "AssetsV1";
  SyncRequestType2["AssetExifsV1"] = "AssetExifsV1";
  SyncRequestType2["PartnerAssetsV1"] = "PartnerAssetsV1";
  SyncRequestType2["PartnerAssetExifsV1"] = "PartnerAssetExifsV1";
})(SyncRequestType || (SyncRequestType = {}));
var TranscodeHWAccel;
(function(TranscodeHWAccel2) {
  TranscodeHWAccel2["Nvenc"] = "nvenc";
  TranscodeHWAccel2["Qsv"] = "qsv";
  TranscodeHWAccel2["Vaapi"] = "vaapi";
  TranscodeHWAccel2["Rkmpp"] = "rkmpp";
  TranscodeHWAccel2["Disabled"] = "disabled";
})(TranscodeHWAccel || (TranscodeHWAccel = {}));
var AudioCodec;
(function(AudioCodec2) {
  AudioCodec2["Mp3"] = "mp3";
  AudioCodec2["Aac"] = "aac";
  AudioCodec2["Libopus"] = "libopus";
  AudioCodec2["PcmS16Le"] = "pcm_s16le";
})(AudioCodec || (AudioCodec = {}));
var VideoContainer;
(function(VideoContainer2) {
  VideoContainer2["Mov"] = "mov";
  VideoContainer2["Mp4"] = "mp4";
  VideoContainer2["Ogg"] = "ogg";
  VideoContainer2["Webm"] = "webm";
})(VideoContainer || (VideoContainer = {}));
var VideoCodec;
(function(VideoCodec2) {
  VideoCodec2["H264"] = "h264";
  VideoCodec2["Hevc"] = "hevc";
  VideoCodec2["Vp9"] = "vp9";
  VideoCodec2["Av1"] = "av1";
})(VideoCodec || (VideoCodec = {}));
var CQMode;
(function(CQMode2) {
  CQMode2["Auto"] = "auto";
  CQMode2["Cqp"] = "cqp";
  CQMode2["Icq"] = "icq";
})(CQMode || (CQMode = {}));
var ToneMapping;
(function(ToneMapping2) {
  ToneMapping2["Hable"] = "hable";
  ToneMapping2["Mobius"] = "mobius";
  ToneMapping2["Reinhard"] = "reinhard";
  ToneMapping2["Disabled"] = "disabled";
})(ToneMapping || (ToneMapping = {}));
var TranscodePolicy;
(function(TranscodePolicy2) {
  TranscodePolicy2["All"] = "all";
  TranscodePolicy2["Optimal"] = "optimal";
  TranscodePolicy2["Bitrate"] = "bitrate";
  TranscodePolicy2["Required"] = "required";
  TranscodePolicy2["Disabled"] = "disabled";
})(TranscodePolicy || (TranscodePolicy = {}));
var Colorspace;
(function(Colorspace2) {
  Colorspace2["Srgb"] = "srgb";
  Colorspace2["P3"] = "p3";
})(Colorspace || (Colorspace = {}));
var ImageFormat;
(function(ImageFormat2) {
  ImageFormat2["Jpeg"] = "jpeg";
  ImageFormat2["Webp"] = "webp";
})(ImageFormat || (ImageFormat = {}));
var LogLevel;
(function(LogLevel2) {
  LogLevel2["Verbose"] = "verbose";
  LogLevel2["Debug"] = "debug";
  LogLevel2["Log"] = "log";
  LogLevel2["Warn"] = "warn";
  LogLevel2["Error"] = "error";
  LogLevel2["Fatal"] = "fatal";
})(LogLevel || (LogLevel = {}));
var TimeBucketSize;
(function(TimeBucketSize2) {
  TimeBucketSize2["Day"] = "DAY";
  TimeBucketSize2["Month"] = "MONTH";
})(TimeBucketSize || (TimeBucketSize = {}));

// node_modules/@immich/sdk/build/index.js
var init = ({ baseUrl, apiKey }) => {
  setBaseUrl(baseUrl);
  setApiKey(apiKey);
};
var setBaseUrl = (baseUrl) => {
  defaults.baseUrl = baseUrl;
};
var setApiKey = (apiKey) => {
  defaults.headers = defaults.headers || {};
  defaults.headers["x-api-key"] = apiKey;
};

// src/main.ts
import { parseArgs } from "node:util";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";

// src/lib/log.ts
var DEBUG_LOG = false;
var setDebug = (debug) => {
  DEBUG_LOG = debug;
};
var log = console.log.bind(console);
var debug = (...args) => {
  if (DEBUG_LOG)
    log(...args);
};
var dir = (unk) => {
  if (DEBUG_LOG)
    console.dir(unk, { depth: 100 });
};

// src/lib/tags.ts
var tagMap = new Map;
async function getOrCreateTag(tagName) {
  let targetTagId = tagMap.get(tagName);
  if (targetTagId)
    return targetTagId;
  log("pulling all tags..");
  const existingTags = await getAllTags();
  targetTagId = existingTags.find((tag) => tag.name === tagName)?.id;
  if (!targetTagId) {
    log("creating tag", tagName);
    const tagResponse = await createTag({ tagCreateDto: { name: tagName } });
    targetTagId = tagResponse.id;
  }
  tagMap.set(tagName, targetTagId);
  return targetTagId;
}
async function tagAs(assets, tagName) {
  if (!assets.size)
    return;
  const targetTagId = await getOrCreateTag(tagName);
  log("got tag", tagName, "with id", targetTagId);
  log("tagging", assets.size, "assets with", tagName);
  const tagResponses = await tagAssets({ id: targetTagId, bulkIdsDto: { ids: Array.from(assets) } });
  for (const tagResponse of tagResponses) {
    const { id, success, error } = tagResponse;
    log(`tagged ${id} - success: ${success}`);
    if (error)
      console.error(error);
  }
}

// src/cmd/stacks.ts
async function getAllAssetsInAlbum(albumId, withStacked) {
  const buckets = await getTimeBuckets({
    albumId,
    order: AssetOrder.Desc,
    size: TimeBucketSize.Month,
    withStacked
  });
  log("got", buckets.length, "buckets");
  const assets = (await Promise.all(buckets.map(async (curr) => {
    const bucket = await getTimeBucket({
      albumId,
      size: TimeBucketSize.Month,
      order: AssetOrder.Desc,
      timeBucket: curr.timeBucket,
      withStacked
    });
    debug("got", bucket.length, "items in bucket named", curr.timeBucket);
    debug("expected", curr.count, "items");
    if (bucket.length !== curr.count)
      throw new Error("unexpected number of items in bucket");
    return bucket;
  }))).flat();
  return assets;
}
async function createEditedStacks(params) {
  const { albumId, MAX_WRITE_OPS = Number.MAX_SAFE_INTEGER, tag } = params;
  const assets = await getAllAssetsInAlbum(albumId, true);
  const nameMap = new Map;
  const dupes = [];
  for (const asset of assets) {
    const { originalFileName } = asset;
    if (nameMap.has(originalFileName))
      dupes.push(originalFileName);
    else
      nameMap.set(originalFileName, asset);
  }
  for (const dupe of dupes)
    nameMap.delete(dupe);
  if (dupes.length) {
    console.error(`dupes in assets originalFileNames: ${dupes}`);
  }
  let found = 0;
  let notFound = 0;
  let alreadyStacked = 0;
  let created = 0;
  const changed = new Set;
  try {
    for (const asset of assets) {
      if (asset.originalFileName.includes("-edited")) {
        debug(`
found:`, asset.originalFileName);
        found++;
        if (asset.stack) {
          debug("already in stack");
          alreadyStacked++;
          continue;
        }
        const uneditedName = asset.originalFileName.replace("-edited", "");
        const uneditedAsset = nameMap.get(uneditedName);
        if (!uneditedAsset) {
          if (dupes.includes(uneditedName))
            console.error(uneditedName, "was found twice, skipping");
          else
            console.error("couldnt find unedited asset", uneditedName, ". Maybe it got trashed");
          notFound++;
          continue;
        }
        debug("unedited:", uneditedAsset.originalFileName);
        if (created < MAX_WRITE_OPS) {
          const s = await createStack({ stackCreateDto: { assetIds: [asset.id, uneditedAsset.id] } });
          created++;
          log("created stack with primaryAssetId:", s.primaryAssetId);
          changed.add(asset.id);
          changed.add(uneditedAsset.id);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  log("found", found, "edited assets");
  log(alreadyStacked, "already in a stack");
  log(notFound, "without an unedited version");
  if (changed.size && tag) {
    await tagAs(changed, tag);
  }
}

// node_modules/luxon/src/errors.js
class LuxonError extends Error {
}

class InvalidDateTimeError extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
}

class InvalidIntervalError extends LuxonError {
  constructor(reason) {
    super(`Invalid Interval: ${reason.toMessage()}`);
  }
}

class InvalidDurationError extends LuxonError {
  constructor(reason) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
}

class ConflictingSpecificationError extends LuxonError {
}

class InvalidUnitError extends LuxonError {
  constructor(unit) {
    super(`Invalid unit ${unit}`);
  }
}

class InvalidArgumentError extends LuxonError {
}

class ZoneIsAbstractError extends LuxonError {
  constructor() {
    super("Zone is an abstract class");
  }
}

// node_modules/luxon/src/impl/formats.js
var n = "numeric";
var s = "short";
var l4 = "long";
var DATE_SHORT = {
  year: n,
  month: n,
  day: n
};
var DATE_MED = {
  year: n,
  month: s,
  day: n
};
var DATE_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s
};
var DATE_FULL = {
  year: n,
  month: l4,
  day: n
};
var DATE_HUGE = {
  year: n,
  month: l4,
  day: n,
  weekday: l4
};
var TIME_SIMPLE = {
  hour: n,
  minute: n
};
var TIME_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n
};
var TIME_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
var TIME_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l4
};
var TIME_24_SIMPLE = {
  hour: n,
  minute: n,
  hourCycle: "h23"
};
var TIME_24_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23"
};
var TIME_24_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: s
};
var TIME_24_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: l4
};
var DATETIME_SHORT = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n
};
var DATETIME_SHORT_WITH_SECONDS = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
  second: n
};
var DATETIME_MED = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n
};
var DATETIME_MED_WITH_SECONDS = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
  second: n
};
var DATETIME_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s,
  hour: n,
  minute: n
};
var DATETIME_FULL = {
  year: n,
  month: l4,
  day: n,
  hour: n,
  minute: n,
  timeZoneName: s
};
var DATETIME_FULL_WITH_SECONDS = {
  year: n,
  month: l4,
  day: n,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
var DATETIME_HUGE = {
  year: n,
  month: l4,
  day: n,
  weekday: l4,
  hour: n,
  minute: n,
  timeZoneName: l4
};
var DATETIME_HUGE_WITH_SECONDS = {
  year: n,
  month: l4,
  day: n,
  weekday: l4,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l4
};

// node_modules/luxon/src/zone.js
class Zone {
  get type() {
    throw new ZoneIsAbstractError;
  }
  get name() {
    throw new ZoneIsAbstractError;
  }
  get ianaName() {
    return this.name;
  }
  get isUniversal() {
    throw new ZoneIsAbstractError;
  }
  offsetName(ts, opts) {
    throw new ZoneIsAbstractError;
  }
  formatOffset(ts, format) {
    throw new ZoneIsAbstractError;
  }
  offset(ts) {
    throw new ZoneIsAbstractError;
  }
  equals(otherZone) {
    throw new ZoneIsAbstractError;
  }
  get isValid() {
    throw new ZoneIsAbstractError;
  }
}

// node_modules/luxon/src/zones/systemZone.js
var singleton = null;

class SystemZone extends Zone {
  static get instance() {
    if (singleton === null) {
      singleton = new SystemZone;
    }
    return singleton;
  }
  get type() {
    return "system";
  }
  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  get isUniversal() {
    return false;
  }
  offsetName(ts, { format, locale }) {
    return parseZoneInfo(ts, format, locale);
  }
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }
  equals(otherZone) {
    return otherZone.type === "system";
  }
  get isValid() {
    return true;
  }
}

// node_modules/luxon/src/zones/IANAZone.js
var dtfCache = new Map;
function makeDTF(zoneName) {
  let dtf = dtfCache.get(zoneName);
  if (dtf === undefined) {
    dtf = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: zoneName,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      era: "short"
    });
    dtfCache.set(zoneName, dtf);
  }
  return dtf;
}
var typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  era: 3,
  hour: 4,
  minute: 5,
  second: 6
};
function hackyOffset(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""), parsed = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(formatted), [, fMonth, fDay, fYear, fadOrBc, fHour, fMinute, fSecond] = parsed;
  return [fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond];
}
function partsOffset(dtf, date) {
  const formatted = dtf.formatToParts(date);
  const filled = [];
  for (let i = 0;i < formatted.length; i++) {
    const { type, value } = formatted[i];
    const pos = typeToPos[type];
    if (type === "era") {
      filled[pos] = value;
    } else if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}
var ianaZoneCache = new Map;

class IANAZone extends Zone {
  static create(name) {
    let zone = ianaZoneCache.get(name);
    if (zone === undefined) {
      ianaZoneCache.set(name, zone = new IANAZone(name));
    }
    return zone;
  }
  static resetCache() {
    ianaZoneCache.clear();
    dtfCache.clear();
  }
  static isValidSpecifier(s2) {
    return this.isValidZone(s2);
  }
  static isValidZone(zone) {
    if (!zone) {
      return false;
    }
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
      return true;
    } catch (e) {
      return false;
    }
  }
  constructor(name) {
    super();
    this.zoneName = name;
    this.valid = IANAZone.isValidZone(name);
  }
  get type() {
    return "iana";
  }
  get name() {
    return this.zoneName;
  }
  get isUniversal() {
    return false;
  }
  offsetName(ts, { format, locale }) {
    return parseZoneInfo(ts, format, locale, this.name);
  }
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  offset(ts) {
    if (!this.valid)
      return NaN;
    const date = new Date(ts);
    if (isNaN(date))
      return NaN;
    const dtf = makeDTF(this.name);
    let [year, month, day, adOrBc, hour, minute, second] = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date);
    if (adOrBc === "BC") {
      year = -Math.abs(year) + 1;
    }
    const adjustedHour = hour === 24 ? 0 : hour;
    const asUTC = objToLocalTS({
      year,
      month,
      day,
      hour: adjustedHour,
      minute,
      second,
      millisecond: 0
    });
    let asTS = +date;
    const over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  }
  equals(otherZone) {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }
  get isValid() {
    return this.valid;
  }
}

// node_modules/luxon/src/impl/locale.js
var intlLFCache = {};
function getCachedLF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlLFCache[key];
  if (!dtf) {
    dtf = new Intl.ListFormat(locString, opts);
    intlLFCache[key] = dtf;
  }
  return dtf;
}
var intlDTCache = new Map;
function getCachedDTF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache.get(key);
  if (dtf === undefined) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache.set(key, dtf);
  }
  return dtf;
}
var intlNumCache = new Map;
function getCachedINF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let inf = intlNumCache.get(key);
  if (inf === undefined) {
    inf = new Intl.NumberFormat(locString, opts);
    intlNumCache.set(key, inf);
  }
  return inf;
}
var intlRelCache = new Map;
function getCachedRTF(locString, opts = {}) {
  const { base, ...cacheKeyOpts } = opts;
  const key = JSON.stringify([locString, cacheKeyOpts]);
  let inf = intlRelCache.get(key);
  if (inf === undefined) {
    inf = new Intl.RelativeTimeFormat(locString, opts);
    intlRelCache.set(key, inf);
  }
  return inf;
}
var sysLocaleCache = null;
function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else {
    sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
    return sysLocaleCache;
  }
}
var intlResolvedOptionsCache = new Map;
function getCachedIntResolvedOptions(locString) {
  let opts = intlResolvedOptionsCache.get(locString);
  if (opts === undefined) {
    opts = new Intl.DateTimeFormat(locString).resolvedOptions();
    intlResolvedOptionsCache.set(locString, opts);
  }
  return opts;
}
var weekInfoCache = new Map;
function getCachedWeekInfo(locString) {
  let data = weekInfoCache.get(locString);
  if (!data) {
    const locale = new Intl.Locale(locString);
    data = "getWeekInfo" in locale ? locale.getWeekInfo() : locale.weekInfo;
    if (!("minimalDays" in data)) {
      data = { ...fallbackWeekSettings, ...data };
    }
    weekInfoCache.set(locString, data);
  }
  return data;
}
function parseLocaleString(localeStr) {
  const xIndex = localeStr.indexOf("-x-");
  if (xIndex !== -1) {
    localeStr = localeStr.substring(0, xIndex);
  }
  const uIndex = localeStr.indexOf("-u-");
  if (uIndex === -1) {
    return [localeStr];
  } else {
    let options;
    let selectedStr;
    try {
      options = getCachedDTF(localeStr).resolvedOptions();
      selectedStr = localeStr;
    } catch (e) {
      const smaller = localeStr.substring(0, uIndex);
      options = getCachedDTF(smaller).resolvedOptions();
      selectedStr = smaller;
    }
    const { numberingSystem, calendar } = options;
    return [selectedStr, numberingSystem, calendar];
  }
}
function intlConfigString(localeStr, numberingSystem, outputCalendar) {
  if (outputCalendar || numberingSystem) {
    if (!localeStr.includes("-u-")) {
      localeStr += "-u";
    }
    if (outputCalendar) {
      localeStr += `-ca-${outputCalendar}`;
    }
    if (numberingSystem) {
      localeStr += `-nu-${numberingSystem}`;
    }
    return localeStr;
  } else {
    return localeStr;
  }
}
function mapMonths(f2) {
  const ms = [];
  for (let i = 1;i <= 12; i++) {
    const dt = DateTime.utc(2009, i, 1);
    ms.push(f2(dt));
  }
  return ms;
}
function mapWeekdays(f2) {
  const ms = [];
  for (let i = 1;i <= 7; i++) {
    const dt = DateTime.utc(2016, 11, 13 + i);
    ms.push(f2(dt));
  }
  return ms;
}
function listStuff(loc, length, englishFn, intlFn) {
  const mode = loc.listingMode();
  if (mode === "error") {
    return null;
  } else if (mode === "en") {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}
function supportsFastNumbers(loc) {
  if (loc.numberingSystem && loc.numberingSystem !== "latn") {
    return false;
  } else {
    return loc.numberingSystem === "latn" || !loc.locale || loc.locale.startsWith("en") || getCachedIntResolvedOptions(loc.locale).numberingSystem === "latn";
  }
}

class PolyNumberFormatter {
  constructor(intl, forceSimple, opts) {
    this.padTo = opts.padTo || 0;
    this.floor = opts.floor || false;
    const { padTo, floor, ...otherOpts } = opts;
    if (!forceSimple || Object.keys(otherOpts).length > 0) {
      const intlOpts = { useGrouping: false, ...opts };
      if (opts.padTo > 0)
        intlOpts.minimumIntegerDigits = opts.padTo;
      this.inf = getCachedINF(intl, intlOpts);
    }
  }
  format(i) {
    if (this.inf) {
      const fixed = this.floor ? Math.floor(i) : i;
      return this.inf.format(fixed);
    } else {
      const fixed = this.floor ? Math.floor(i) : roundTo(i, 3);
      return padStart(fixed, this.padTo);
    }
  }
}

class PolyDateFormatter {
  constructor(dt, intl, opts) {
    this.opts = opts;
    this.originalZone = undefined;
    let z = undefined;
    if (this.opts.timeZone) {
      this.dt = dt;
    } else if (dt.zone.type === "fixed") {
      const gmtOffset = -1 * (dt.offset / 60);
      const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
      if (dt.offset !== 0 && IANAZone.create(offsetZ).valid) {
        z = offsetZ;
        this.dt = dt;
      } else {
        z = "UTC";
        this.dt = dt.offset === 0 ? dt : dt.setZone("UTC").plus({ minutes: dt.offset });
        this.originalZone = dt.zone;
      }
    } else if (dt.zone.type === "system") {
      this.dt = dt;
    } else if (dt.zone.type === "iana") {
      this.dt = dt;
      z = dt.zone.name;
    } else {
      z = "UTC";
      this.dt = dt.setZone("UTC").plus({ minutes: dt.offset });
      this.originalZone = dt.zone;
    }
    const intlOpts = { ...this.opts };
    intlOpts.timeZone = intlOpts.timeZone || z;
    this.dtf = getCachedDTF(intl, intlOpts);
  }
  format() {
    if (this.originalZone) {
      return this.formatToParts().map(({ value }) => value).join("");
    }
    return this.dtf.format(this.dt.toJSDate());
  }
  formatToParts() {
    const parts = this.dtf.formatToParts(this.dt.toJSDate());
    if (this.originalZone) {
      return parts.map((part) => {
        if (part.type === "timeZoneName") {
          const offsetName = this.originalZone.offsetName(this.dt.ts, {
            locale: this.dt.locale,
            format: this.opts.timeZoneName
          });
          return {
            ...part,
            value: offsetName
          };
        } else {
          return part;
        }
      });
    }
    return parts;
  }
  resolvedOptions() {
    return this.dtf.resolvedOptions();
  }
}

class PolyRelFormatter {
  constructor(intl, isEnglish, opts) {
    this.opts = { style: "long", ...opts };
    if (!isEnglish && hasRelative()) {
      this.rtf = getCachedRTF(intl, opts);
    }
  }
  format(count, unit) {
    if (this.rtf) {
      return this.rtf.format(count, unit);
    } else {
      return formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
    }
  }
  formatToParts(count, unit) {
    if (this.rtf) {
      return this.rtf.formatToParts(count, unit);
    } else {
      return [];
    }
  }
}
var fallbackWeekSettings = {
  firstDay: 1,
  minimalDays: 4,
  weekend: [6, 7]
};

class Locale {
  static fromOpts(opts) {
    return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.weekSettings, opts.defaultToEN);
  }
  static create(locale, numberingSystem, outputCalendar, weekSettings, defaultToEN = false) {
    const specifiedLocale = locale || Settings.defaultLocale;
    const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
    const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
    const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    const weekSettingsR = validateWeekSettings(weekSettings) || Settings.defaultWeekSettings;
    return new Locale(localeR, numberingSystemR, outputCalendarR, weekSettingsR, specifiedLocale);
  }
  static resetCache() {
    sysLocaleCache = null;
    intlDTCache.clear();
    intlNumCache.clear();
    intlRelCache.clear();
    intlResolvedOptionsCache.clear();
    weekInfoCache.clear();
  }
  static fromObject({ locale, numberingSystem, outputCalendar, weekSettings } = {}) {
    return Locale.create(locale, numberingSystem, outputCalendar, weekSettings);
  }
  constructor(locale, numbering, outputCalendar, weekSettings, specifiedLocale) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);
    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.weekSettings = weekSettings;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
    this.weekdaysCache = { format: {}, standalone: {} };
    this.monthsCache = { format: {}, standalone: {} };
    this.meridiemCache = null;
    this.eraCache = {};
    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }
  get fastNumbers() {
    if (this.fastNumbersCached == null) {
      this.fastNumbersCached = supportsFastNumbers(this);
    }
    return this.fastNumbersCached;
  }
  listingMode() {
    const isActuallyEn = this.isEnglish();
    const hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
    return isActuallyEn && hasNoWeirdness ? "en" : "intl";
  }
  clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(alts.locale || this.specifiedLocale, alts.numberingSystem || this.numberingSystem, alts.outputCalendar || this.outputCalendar, validateWeekSettings(alts.weekSettings) || this.weekSettings, alts.defaultToEN || false);
    }
  }
  redefaultToEN(alts = {}) {
    return this.clone({ ...alts, defaultToEN: true });
  }
  redefaultToSystem(alts = {}) {
    return this.clone({ ...alts, defaultToEN: false });
  }
  months(length, format = false) {
    return listStuff(this, length, months, () => {
      const intl = format ? { month: length, day: "numeric" } : { month: length }, formatStr = format ? "format" : "standalone";
      if (!this.monthsCache[formatStr][length]) {
        this.monthsCache[formatStr][length] = mapMonths((dt) => this.extract(dt, intl, "month"));
      }
      return this.monthsCache[formatStr][length];
    });
  }
  weekdays(length, format = false) {
    return listStuff(this, length, weekdays, () => {
      const intl = format ? { weekday: length, year: "numeric", month: "long", day: "numeric" } : { weekday: length }, formatStr = format ? "format" : "standalone";
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays((dt) => this.extract(dt, intl, "weekday"));
      }
      return this.weekdaysCache[formatStr][length];
    });
  }
  meridiems() {
    return listStuff(this, undefined, () => meridiems, () => {
      if (!this.meridiemCache) {
        const intl = { hour: "numeric", hourCycle: "h12" };
        this.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map((dt) => this.extract(dt, intl, "dayperiod"));
      }
      return this.meridiemCache;
    });
  }
  eras(length) {
    return listStuff(this, length, eras, () => {
      const intl = { era: length };
      if (!this.eraCache[length]) {
        this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map((dt) => this.extract(dt, intl, "era"));
      }
      return this.eraCache[length];
    });
  }
  extract(dt, intlOpts, field) {
    const df = this.dtFormatter(dt, intlOpts), results = df.formatToParts(), matching = results.find((m2) => m2.type.toLowerCase() === field);
    return matching ? matching.value : null;
  }
  numberFormatter(opts = {}) {
    return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
  }
  dtFormatter(dt, intlOpts = {}) {
    return new PolyDateFormatter(dt, this.intl, intlOpts);
  }
  relFormatter(opts = {}) {
    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  }
  listFormatter(opts = {}) {
    return getCachedLF(this.intl, opts);
  }
  isEnglish() {
    return this.locale === "en" || this.locale.toLowerCase() === "en-us" || getCachedIntResolvedOptions(this.intl).locale.startsWith("en-us");
  }
  getWeekSettings() {
    if (this.weekSettings) {
      return this.weekSettings;
    } else if (!hasLocaleWeekInfo()) {
      return fallbackWeekSettings;
    } else {
      return getCachedWeekInfo(this.locale);
    }
  }
  getStartOfWeek() {
    return this.getWeekSettings().firstDay;
  }
  getMinDaysInFirstWeek() {
    return this.getWeekSettings().minimalDays;
  }
  getWeekendDays() {
    return this.getWeekSettings().weekend;
  }
  equals(other) {
    return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
  }
  toString() {
    return `Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`;
  }
}

// node_modules/luxon/src/zones/fixedOffsetZone.js
var singleton2 = null;

class FixedOffsetZone extends Zone {
  static get utcInstance() {
    if (singleton2 === null) {
      singleton2 = new FixedOffsetZone(0);
    }
    return singleton2;
  }
  static instance(offset) {
    return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
  }
  static parseSpecifier(s2) {
    if (s2) {
      const r = s2.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (r) {
        return new FixedOffsetZone(signedOffset(r[1], r[2]));
      }
    }
    return null;
  }
  constructor(offset) {
    super();
    this.fixed = offset;
  }
  get type() {
    return "fixed";
  }
  get name() {
    return this.fixed === 0 ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
  }
  get ianaName() {
    if (this.fixed === 0) {
      return "Etc/UTC";
    } else {
      return `Etc/GMT${formatOffset(-this.fixed, "narrow")}`;
    }
  }
  offsetName() {
    return this.name;
  }
  formatOffset(ts, format) {
    return formatOffset(this.fixed, format);
  }
  get isUniversal() {
    return true;
  }
  offset() {
    return this.fixed;
  }
  equals(otherZone) {
    return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
  }
  get isValid() {
    return true;
  }
}

// node_modules/luxon/src/zones/invalidZone.js
class InvalidZone extends Zone {
  constructor(zoneName) {
    super();
    this.zoneName = zoneName;
  }
  get type() {
    return "invalid";
  }
  get name() {
    return this.zoneName;
  }
  get isUniversal() {
    return false;
  }
  offsetName() {
    return null;
  }
  formatOffset() {
    return "";
  }
  offset() {
    return NaN;
  }
  equals() {
    return false;
  }
  get isValid() {
    return false;
  }
}

// node_modules/luxon/src/impl/zoneUtil.js
function normalizeZone(input, defaultZone) {
  let offset;
  if (isUndefined(input) || input === null) {
    return defaultZone;
  } else if (input instanceof Zone) {
    return input;
  } else if (isString(input)) {
    const lowered = input.toLowerCase();
    if (lowered === "default")
      return defaultZone;
    else if (lowered === "local" || lowered === "system")
      return SystemZone.instance;
    else if (lowered === "utc" || lowered === "gmt")
      return FixedOffsetZone.utcInstance;
    else
      return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input);
  } else if (isNumber(input)) {
    return FixedOffsetZone.instance(input);
  } else if (typeof input === "object" && "offset" in input && typeof input.offset === "function") {
    return input;
  } else {
    return new InvalidZone(input);
  }
}

// node_modules/luxon/src/impl/digits.js
var numberingSystems = {
  arab: "[٠-٩]",
  arabext: "[۰-۹]",
  bali: "[᭐-᭙]",
  beng: "[০-৯]",
  deva: "[०-९]",
  fullwide: "[０-９]",
  gujr: "[૦-૯]",
  hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
  khmr: "[០-៩]",
  knda: "[೦-೯]",
  laoo: "[໐-໙]",
  limb: "[᥆-᥏]",
  mlym: "[൦-൯]",
  mong: "[᠐-᠙]",
  mymr: "[၀-၉]",
  orya: "[୦-୯]",
  tamldec: "[௦-௯]",
  telu: "[౦-౯]",
  thai: "[๐-๙]",
  tibt: "[༠-༩]",
  latn: "\\d"
};
var numberingSystemsUTF16 = {
  arab: [1632, 1641],
  arabext: [1776, 1785],
  bali: [6992, 7001],
  beng: [2534, 2543],
  deva: [2406, 2415],
  fullwide: [65296, 65303],
  gujr: [2790, 2799],
  khmr: [6112, 6121],
  knda: [3302, 3311],
  laoo: [3792, 3801],
  limb: [6470, 6479],
  mlym: [3430, 3439],
  mong: [6160, 6169],
  mymr: [4160, 4169],
  orya: [2918, 2927],
  tamldec: [3046, 3055],
  telu: [3174, 3183],
  thai: [3664, 3673],
  tibt: [3872, 3881]
};
var hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
function parseDigits(str) {
  let value = parseInt(str, 10);
  if (isNaN(value)) {
    value = "";
    for (let i = 0;i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (str[i].search(numberingSystems.hanidec) !== -1) {
        value += hanidecChars.indexOf(str[i]);
      } else {
        for (const key in numberingSystemsUTF16) {
          const [min, max] = numberingSystemsUTF16[key];
          if (code >= min && code <= max) {
            value += code - min;
          }
        }
      }
    }
    return parseInt(value, 10);
  } else {
    return value;
  }
}
var digitRegexCache = new Map;
function resetDigitRegexCache() {
  digitRegexCache.clear();
}
function digitRegex({ numberingSystem }, append = "") {
  const ns = numberingSystem || "latn";
  let appendCache = digitRegexCache.get(ns);
  if (appendCache === undefined) {
    appendCache = new Map;
    digitRegexCache.set(ns, appendCache);
  }
  let regex = appendCache.get(append);
  if (regex === undefined) {
    regex = new RegExp(`${numberingSystems[ns]}${append}`);
    appendCache.set(append, regex);
  }
  return regex;
}

// node_modules/luxon/src/settings.js
var now = () => Date.now();
var defaultZone = "system";
var defaultLocale = null;
var defaultNumberingSystem = null;
var defaultOutputCalendar = null;
var twoDigitCutoffYear = 60;
var throwOnInvalid;
var defaultWeekSettings = null;

class Settings {
  static get now() {
    return now;
  }
  static set now(n2) {
    now = n2;
  }
  static set defaultZone(zone) {
    defaultZone = zone;
  }
  static get defaultZone() {
    return normalizeZone(defaultZone, SystemZone.instance);
  }
  static get defaultLocale() {
    return defaultLocale;
  }
  static set defaultLocale(locale) {
    defaultLocale = locale;
  }
  static get defaultNumberingSystem() {
    return defaultNumberingSystem;
  }
  static set defaultNumberingSystem(numberingSystem) {
    defaultNumberingSystem = numberingSystem;
  }
  static get defaultOutputCalendar() {
    return defaultOutputCalendar;
  }
  static set defaultOutputCalendar(outputCalendar) {
    defaultOutputCalendar = outputCalendar;
  }
  static get defaultWeekSettings() {
    return defaultWeekSettings;
  }
  static set defaultWeekSettings(weekSettings) {
    defaultWeekSettings = validateWeekSettings(weekSettings);
  }
  static get twoDigitCutoffYear() {
    return twoDigitCutoffYear;
  }
  static set twoDigitCutoffYear(cutoffYear) {
    twoDigitCutoffYear = cutoffYear % 100;
  }
  static get throwOnInvalid() {
    return throwOnInvalid;
  }
  static set throwOnInvalid(t2) {
    throwOnInvalid = t2;
  }
  static resetCaches() {
    Locale.resetCache();
    IANAZone.resetCache();
    DateTime.resetCache();
    resetDigitRegexCache();
  }
}

// node_modules/luxon/src/impl/invalid.js
class Invalid {
  constructor(reason, explanation) {
    this.reason = reason;
    this.explanation = explanation;
  }
  toMessage() {
    if (this.explanation) {
      return `${this.reason}: ${this.explanation}`;
    } else {
      return this.reason;
    }
  }
}

// node_modules/luxon/src/impl/conversions.js
var nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
var leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
function unitOutOfRange(unit, value) {
  return new Invalid("unit out of range", `you specified ${value} (of type ${typeof value}) as a ${unit}, which is invalid`);
}
function dayOfWeek(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  if (year < 100 && year >= 0) {
    d.setUTCFullYear(d.getUTCFullYear() - 1900);
  }
  const js = d.getUTCDay();
  return js === 0 ? 7 : js;
}
function computeOrdinal(year, month, day) {
  return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
}
function uncomputeOrdinal(year, ordinal) {
  const table = isLeapYear(year) ? leapLadder : nonLeapLadder, month0 = table.findIndex((i) => i < ordinal), day = ordinal - table[month0];
  return { month: month0 + 1, day };
}
function isoWeekdayToLocal(isoWeekday, startOfWeek) {
  return (isoWeekday - startOfWeek + 7) % 7 + 1;
}
function gregorianToWeek(gregObj, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const { year, month, day } = gregObj, ordinal = computeOrdinal(year, month, day), weekday = isoWeekdayToLocal(dayOfWeek(year, month, day), startOfWeek);
  let weekNumber = Math.floor((ordinal - weekday + 14 - minDaysInFirstWeek) / 7), weekYear;
  if (weekNumber < 1) {
    weekYear = year - 1;
    weekNumber = weeksInWeekYear(weekYear, minDaysInFirstWeek, startOfWeek);
  } else if (weekNumber > weeksInWeekYear(year, minDaysInFirstWeek, startOfWeek)) {
    weekYear = year + 1;
    weekNumber = 1;
  } else {
    weekYear = year;
  }
  return { weekYear, weekNumber, weekday, ...timeObject(gregObj) };
}
function weekToGregorian(weekData, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const { weekYear, weekNumber, weekday } = weekData, weekdayOfJan4 = isoWeekdayToLocal(dayOfWeek(weekYear, 1, minDaysInFirstWeek), startOfWeek), yearInDays = daysInYear(weekYear);
  let ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 7 + minDaysInFirstWeek, year;
  if (ordinal < 1) {
    year = weekYear - 1;
    ordinal += daysInYear(year);
  } else if (ordinal > yearInDays) {
    year = weekYear + 1;
    ordinal -= daysInYear(weekYear);
  } else {
    year = weekYear;
  }
  const { month, day } = uncomputeOrdinal(year, ordinal);
  return { year, month, day, ...timeObject(weekData) };
}
function gregorianToOrdinal(gregData) {
  const { year, month, day } = gregData;
  const ordinal = computeOrdinal(year, month, day);
  return { year, ordinal, ...timeObject(gregData) };
}
function ordinalToGregorian(ordinalData) {
  const { year, ordinal } = ordinalData;
  const { month, day } = uncomputeOrdinal(year, ordinal);
  return { year, month, day, ...timeObject(ordinalData) };
}
function usesLocalWeekValues(obj, loc) {
  const hasLocaleWeekData = !isUndefined(obj.localWeekday) || !isUndefined(obj.localWeekNumber) || !isUndefined(obj.localWeekYear);
  if (hasLocaleWeekData) {
    const hasIsoWeekData = !isUndefined(obj.weekday) || !isUndefined(obj.weekNumber) || !isUndefined(obj.weekYear);
    if (hasIsoWeekData) {
      throw new ConflictingSpecificationError("Cannot mix locale-based week fields with ISO-based week fields");
    }
    if (!isUndefined(obj.localWeekday))
      obj.weekday = obj.localWeekday;
    if (!isUndefined(obj.localWeekNumber))
      obj.weekNumber = obj.localWeekNumber;
    if (!isUndefined(obj.localWeekYear))
      obj.weekYear = obj.localWeekYear;
    delete obj.localWeekday;
    delete obj.localWeekNumber;
    delete obj.localWeekYear;
    return {
      minDaysInFirstWeek: loc.getMinDaysInFirstWeek(),
      startOfWeek: loc.getStartOfWeek()
    };
  } else {
    return { minDaysInFirstWeek: 4, startOfWeek: 1 };
  }
}
function hasInvalidWeekData(obj, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const validYear = isInteger(obj.weekYear), validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear, minDaysInFirstWeek, startOfWeek)), validWeekday = integerBetween(obj.weekday, 1, 7);
  if (!validYear) {
    return unitOutOfRange("weekYear", obj.weekYear);
  } else if (!validWeek) {
    return unitOutOfRange("week", obj.weekNumber);
  } else if (!validWeekday) {
    return unitOutOfRange("weekday", obj.weekday);
  } else
    return false;
}
function hasInvalidOrdinalData(obj) {
  const validYear = isInteger(obj.year), validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));
  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validOrdinal) {
    return unitOutOfRange("ordinal", obj.ordinal);
  } else
    return false;
}
function hasInvalidGregorianData(obj) {
  const validYear = isInteger(obj.year), validMonth = integerBetween(obj.month, 1, 12), validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));
  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validMonth) {
    return unitOutOfRange("month", obj.month);
  } else if (!validDay) {
    return unitOutOfRange("day", obj.day);
  } else
    return false;
}
function hasInvalidTimeData(obj) {
  const { hour, minute, second, millisecond } = obj;
  const validHour = integerBetween(hour, 0, 23) || hour === 24 && minute === 0 && second === 0 && millisecond === 0, validMinute = integerBetween(minute, 0, 59), validSecond = integerBetween(second, 0, 59), validMillisecond = integerBetween(millisecond, 0, 999);
  if (!validHour) {
    return unitOutOfRange("hour", hour);
  } else if (!validMinute) {
    return unitOutOfRange("minute", minute);
  } else if (!validSecond) {
    return unitOutOfRange("second", second);
  } else if (!validMillisecond) {
    return unitOutOfRange("millisecond", millisecond);
  } else
    return false;
}

// node_modules/luxon/src/impl/util.js
function isUndefined(o2) {
  return typeof o2 === "undefined";
}
function isNumber(o2) {
  return typeof o2 === "number";
}
function isInteger(o2) {
  return typeof o2 === "number" && o2 % 1 === 0;
}
function isString(o2) {
  return typeof o2 === "string";
}
function isDate(o2) {
  return Object.prototype.toString.call(o2) === "[object Date]";
}
function hasRelative() {
  try {
    return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
  } catch (e) {
    return false;
  }
}
function hasLocaleWeekInfo() {
  try {
    return typeof Intl !== "undefined" && !!Intl.Locale && (("weekInfo" in Intl.Locale.prototype) || ("getWeekInfo" in Intl.Locale.prototype));
  } catch (e) {
    return false;
  }
}
function maybeArray(thing) {
  return Array.isArray(thing) ? thing : [thing];
}
function bestBy(arr, by, compare) {
  if (arr.length === 0) {
    return;
  }
  return arr.reduce((best, next) => {
    const pair = [by(next), next];
    if (!best) {
      return pair;
    } else if (compare(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
}
function pick(obj, keys) {
  return keys.reduce((a2, k2) => {
    a2[k2] = obj[k2];
    return a2;
  }, {});
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function validateWeekSettings(settings) {
  if (settings == null) {
    return null;
  } else if (typeof settings !== "object") {
    throw new InvalidArgumentError("Week settings must be an object");
  } else {
    if (!integerBetween(settings.firstDay, 1, 7) || !integerBetween(settings.minimalDays, 1, 7) || !Array.isArray(settings.weekend) || settings.weekend.some((v) => !integerBetween(v, 1, 7))) {
      throw new InvalidArgumentError("Invalid week settings");
    }
    return {
      firstDay: settings.firstDay,
      minimalDays: settings.minimalDays,
      weekend: Array.from(settings.weekend)
    };
  }
}
function integerBetween(thing, bottom, top) {
  return isInteger(thing) && thing >= bottom && thing <= top;
}
function floorMod(x, n2) {
  return x - n2 * Math.floor(x / n2);
}
function padStart(input, n2 = 2) {
  const isNeg = input < 0;
  let padded;
  if (isNeg) {
    padded = "-" + ("" + -input).padStart(n2, "0");
  } else {
    padded = ("" + input).padStart(n2, "0");
  }
  return padded;
}
function parseInteger(string) {
  if (isUndefined(string) || string === null || string === "") {
    return;
  } else {
    return parseInt(string, 10);
  }
}
function parseFloating(string) {
  if (isUndefined(string) || string === null || string === "") {
    return;
  } else {
    return parseFloat(string);
  }
}
function parseMillis(fraction) {
  if (isUndefined(fraction) || fraction === null || fraction === "") {
    return;
  } else {
    const f2 = parseFloat("0." + fraction) * 1000;
    return Math.floor(f2);
  }
}
function roundTo(number, digits, towardZero = false) {
  const factor = 10 ** digits, rounder = towardZero ? Math.trunc : Math.round;
  return rounder(number * factor) / factor;
}
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}
function daysInMonth(year, month) {
  const modMonth = floorMod(month - 1, 12) + 1, modYear = year + (month - modMonth) / 12;
  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
  }
}
function objToLocalTS(obj) {
  let d = Date.UTC(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second, obj.millisecond);
  if (obj.year < 100 && obj.year >= 0) {
    d = new Date(d);
    d.setUTCFullYear(obj.year, obj.month - 1, obj.day);
  }
  return +d;
}
function firstWeekOffset(year, minDaysInFirstWeek, startOfWeek) {
  const fwdlw = isoWeekdayToLocal(dayOfWeek(year, 1, minDaysInFirstWeek), startOfWeek);
  return -fwdlw + minDaysInFirstWeek - 1;
}
function weeksInWeekYear(weekYear, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const weekOffset = firstWeekOffset(weekYear, minDaysInFirstWeek, startOfWeek);
  const weekOffsetNext = firstWeekOffset(weekYear + 1, minDaysInFirstWeek, startOfWeek);
  return (daysInYear(weekYear) - weekOffset + weekOffsetNext) / 7;
}
function untruncateYear(year) {
  if (year > 99) {
    return year;
  } else
    return year > Settings.twoDigitCutoffYear ? 1900 + year : 2000 + year;
}
function parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
  const date = new Date(ts), intlOpts = {
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  };
  if (timeZone) {
    intlOpts.timeZone = timeZone;
  }
  const modified = { timeZoneName: offsetFormat, ...intlOpts };
  const parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find((m2) => m2.type.toLowerCase() === "timezonename");
  return parsed ? parsed.value : null;
}
function signedOffset(offHourStr, offMinuteStr) {
  let offHour = parseInt(offHourStr, 10);
  if (Number.isNaN(offHour)) {
    offHour = 0;
  }
  const offMin = parseInt(offMinuteStr, 10) || 0, offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
}
function asNumber(value) {
  const numericValue = Number(value);
  if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue))
    throw new InvalidArgumentError(`Invalid unit value ${value}`);
  return numericValue;
}
function normalizeObject(obj, normalizer) {
  const normalized = {};
  for (const u in obj) {
    if (hasOwnProperty(obj, u)) {
      const v = obj[u];
      if (v === undefined || v === null)
        continue;
      normalized[normalizer(u)] = asNumber(v);
    }
  }
  return normalized;
}
function formatOffset(offset, format) {
  const hours = Math.trunc(Math.abs(offset / 60)), minutes = Math.trunc(Math.abs(offset % 60)), sign = offset >= 0 ? "+" : "-";
  switch (format) {
    case "short":
      return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
    case "narrow":
      return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
    case "techie":
      return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
    default:
      throw new RangeError(`Value format ${format} is out of range for property format`);
  }
}
function timeObject(obj) {
  return pick(obj, ["hour", "minute", "second", "millisecond"]);
}

// node_modules/luxon/src/impl/english.js
var monthsLong = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
var monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
function months(length) {
  switch (length) {
    case "narrow":
      return [...monthsNarrow];
    case "short":
      return [...monthsShort];
    case "long":
      return [...monthsLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    case "2-digit":
      return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    default:
      return null;
  }
}
var weekdaysLong = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];
var weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];
function weekdays(length) {
  switch (length) {
    case "narrow":
      return [...weekdaysNarrow];
    case "short":
      return [...weekdaysShort];
    case "long":
      return [...weekdaysLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7"];
    default:
      return null;
  }
}
var meridiems = ["AM", "PM"];
var erasLong = ["Before Christ", "Anno Domini"];
var erasShort = ["BC", "AD"];
var erasNarrow = ["B", "A"];
function eras(length) {
  switch (length) {
    case "narrow":
      return [...erasNarrow];
    case "short":
      return [...erasShort];
    case "long":
      return [...erasLong];
    default:
      return null;
  }
}
function meridiemForDateTime(dt) {
  return meridiems[dt.hour < 12 ? 0 : 1];
}
function weekdayForDateTime(dt, length) {
  return weekdays(length)[dt.weekday - 1];
}
function monthForDateTime(dt, length) {
  return months(length)[dt.month - 1];
}
function eraForDateTime(dt, length) {
  return eras(length)[dt.year < 0 ? 0 : 1];
}
function formatRelativeTime(unit, count, numeric = "always", narrow = false) {
  const units = {
    years: ["year", "yr."],
    quarters: ["quarter", "qtr."],
    months: ["month", "mo."],
    weeks: ["week", "wk."],
    days: ["day", "day", "days"],
    hours: ["hour", "hr."],
    minutes: ["minute", "min."],
    seconds: ["second", "sec."]
  };
  const lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;
  if (numeric === "auto" && lastable) {
    const isDay = unit === "days";
    switch (count) {
      case 1:
        return isDay ? "tomorrow" : `next ${units[unit][0]}`;
      case -1:
        return isDay ? "yesterday" : `last ${units[unit][0]}`;
      case 0:
        return isDay ? "today" : `this ${units[unit][0]}`;
      default:
    }
  }
  const isInPast = Object.is(count, -0) || count < 0, fmtValue = Math.abs(count), singular = fmtValue === 1, lilUnits = units[unit], fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
  return isInPast ? `${fmtValue} ${fmtUnit} ago` : `in ${fmtValue} ${fmtUnit}`;
}

// node_modules/luxon/src/impl/formatter.js
function stringifyTokens(splits, tokenToString) {
  let s2 = "";
  for (const token of splits) {
    if (token.literal) {
      s2 += token.val;
    } else {
      s2 += tokenToString(token.val);
    }
  }
  return s2;
}
var macroTokenToFormatOpts = {
  D: DATE_SHORT,
  DD: DATE_MED,
  DDD: DATE_FULL,
  DDDD: DATE_HUGE,
  t: TIME_SIMPLE,
  tt: TIME_WITH_SECONDS,
  ttt: TIME_WITH_SHORT_OFFSET,
  tttt: TIME_WITH_LONG_OFFSET,
  T: TIME_24_SIMPLE,
  TT: TIME_24_WITH_SECONDS,
  TTT: TIME_24_WITH_SHORT_OFFSET,
  TTTT: TIME_24_WITH_LONG_OFFSET,
  f: DATETIME_SHORT,
  ff: DATETIME_MED,
  fff: DATETIME_FULL,
  ffff: DATETIME_HUGE,
  F: DATETIME_SHORT_WITH_SECONDS,
  FF: DATETIME_MED_WITH_SECONDS,
  FFF: DATETIME_FULL_WITH_SECONDS,
  FFFF: DATETIME_HUGE_WITH_SECONDS
};

class Formatter {
  static create(locale, opts = {}) {
    return new Formatter(locale, opts);
  }
  static parseFormat(fmt) {
    let current = null, currentFull = "", bracketed = false;
    const splits = [];
    for (let i = 0;i < fmt.length; i++) {
      const c = fmt.charAt(i);
      if (c === "'") {
        if (currentFull.length > 0) {
          splits.push({ literal: bracketed || /^\s+$/.test(currentFull), val: currentFull });
        }
        current = null;
        currentFull = "";
        bracketed = !bracketed;
      } else if (bracketed) {
        currentFull += c;
      } else if (c === current) {
        currentFull += c;
      } else {
        if (currentFull.length > 0) {
          splits.push({ literal: /^\s+$/.test(currentFull), val: currentFull });
        }
        currentFull = c;
        current = c;
      }
    }
    if (currentFull.length > 0) {
      splits.push({ literal: bracketed || /^\s+$/.test(currentFull), val: currentFull });
    }
    return splits;
  }
  static macroTokenToFormatOpts(token) {
    return macroTokenToFormatOpts[token];
  }
  constructor(locale, formatOpts) {
    this.opts = formatOpts;
    this.loc = locale;
    this.systemLoc = null;
  }
  formatWithSystemDefault(dt, opts) {
    if (this.systemLoc === null) {
      this.systemLoc = this.loc.redefaultToSystem();
    }
    const df = this.systemLoc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.format();
  }
  dtFormatter(dt, opts = {}) {
    return this.loc.dtFormatter(dt, { ...this.opts, ...opts });
  }
  formatDateTime(dt, opts) {
    return this.dtFormatter(dt, opts).format();
  }
  formatDateTimeParts(dt, opts) {
    return this.dtFormatter(dt, opts).formatToParts();
  }
  formatInterval(interval, opts) {
    const df = this.dtFormatter(interval.start, opts);
    return df.dtf.formatRange(interval.start.toJSDate(), interval.end.toJSDate());
  }
  resolvedOptions(dt, opts) {
    return this.dtFormatter(dt, opts).resolvedOptions();
  }
  num(n2, p = 0) {
    if (this.opts.forceSimple) {
      return padStart(n2, p);
    }
    const opts = { ...this.opts };
    if (p > 0) {
      opts.padTo = p;
    }
    return this.loc.numberFormatter(opts).format(n2);
  }
  formatDateTimeFromString(dt, fmt) {
    const knownEnglish = this.loc.listingMode() === "en", useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory", string = (opts, extract) => this.loc.extract(dt, opts, extract), formatOffset2 = (opts) => {
      if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
        return "Z";
      }
      return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
    }, meridiem = () => knownEnglish ? meridiemForDateTime(dt) : string({ hour: "numeric", hourCycle: "h12" }, "dayperiod"), month = (length, standalone) => knownEnglish ? monthForDateTime(dt, length) : string(standalone ? { month: length } : { month: length, day: "numeric" }, "month"), weekday = (length, standalone) => knownEnglish ? weekdayForDateTime(dt, length) : string(standalone ? { weekday: length } : { weekday: length, month: "long", day: "numeric" }, "weekday"), maybeMacro = (token) => {
      const formatOpts = Formatter.macroTokenToFormatOpts(token);
      if (formatOpts) {
        return this.formatWithSystemDefault(dt, formatOpts);
      } else {
        return token;
      }
    }, era = (length) => knownEnglish ? eraForDateTime(dt, length) : string({ era: length }, "era"), tokenToString = (token) => {
      switch (token) {
        case "S":
          return this.num(dt.millisecond);
        case "u":
        case "SSS":
          return this.num(dt.millisecond, 3);
        case "s":
          return this.num(dt.second);
        case "ss":
          return this.num(dt.second, 2);
        case "uu":
          return this.num(Math.floor(dt.millisecond / 10), 2);
        case "uuu":
          return this.num(Math.floor(dt.millisecond / 100));
        case "m":
          return this.num(dt.minute);
        case "mm":
          return this.num(dt.minute, 2);
        case "h":
          return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);
        case "hh":
          return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);
        case "H":
          return this.num(dt.hour);
        case "HH":
          return this.num(dt.hour, 2);
        case "Z":
          return formatOffset2({ format: "narrow", allowZ: this.opts.allowZ });
        case "ZZ":
          return formatOffset2({ format: "short", allowZ: this.opts.allowZ });
        case "ZZZ":
          return formatOffset2({ format: "techie", allowZ: this.opts.allowZ });
        case "ZZZZ":
          return dt.zone.offsetName(dt.ts, { format: "short", locale: this.loc.locale });
        case "ZZZZZ":
          return dt.zone.offsetName(dt.ts, { format: "long", locale: this.loc.locale });
        case "z":
          return dt.zoneName;
        case "a":
          return meridiem();
        case "d":
          return useDateTimeFormatter ? string({ day: "numeric" }, "day") : this.num(dt.day);
        case "dd":
          return useDateTimeFormatter ? string({ day: "2-digit" }, "day") : this.num(dt.day, 2);
        case "c":
          return this.num(dt.weekday);
        case "ccc":
          return weekday("short", true);
        case "cccc":
          return weekday("long", true);
        case "ccccc":
          return weekday("narrow", true);
        case "E":
          return this.num(dt.weekday);
        case "EEE":
          return weekday("short", false);
        case "EEEE":
          return weekday("long", false);
        case "EEEEE":
          return weekday("narrow", false);
        case "L":
          return useDateTimeFormatter ? string({ month: "numeric", day: "numeric" }, "month") : this.num(dt.month);
        case "LL":
          return useDateTimeFormatter ? string({ month: "2-digit", day: "numeric" }, "month") : this.num(dt.month, 2);
        case "LLL":
          return month("short", true);
        case "LLLL":
          return month("long", true);
        case "LLLLL":
          return month("narrow", true);
        case "M":
          return useDateTimeFormatter ? string({ month: "numeric" }, "month") : this.num(dt.month);
        case "MM":
          return useDateTimeFormatter ? string({ month: "2-digit" }, "month") : this.num(dt.month, 2);
        case "MMM":
          return month("short", false);
        case "MMMM":
          return month("long", false);
        case "MMMMM":
          return month("narrow", false);
        case "y":
          return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt.year);
        case "yy":
          return useDateTimeFormatter ? string({ year: "2-digit" }, "year") : this.num(dt.year.toString().slice(-2), 2);
        case "yyyy":
          return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt.year, 4);
        case "yyyyyy":
          return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt.year, 6);
        case "G":
          return era("short");
        case "GG":
          return era("long");
        case "GGGGG":
          return era("narrow");
        case "kk":
          return this.num(dt.weekYear.toString().slice(-2), 2);
        case "kkkk":
          return this.num(dt.weekYear, 4);
        case "W":
          return this.num(dt.weekNumber);
        case "WW":
          return this.num(dt.weekNumber, 2);
        case "n":
          return this.num(dt.localWeekNumber);
        case "nn":
          return this.num(dt.localWeekNumber, 2);
        case "ii":
          return this.num(dt.localWeekYear.toString().slice(-2), 2);
        case "iiii":
          return this.num(dt.localWeekYear, 4);
        case "o":
          return this.num(dt.ordinal);
        case "ooo":
          return this.num(dt.ordinal, 3);
        case "q":
          return this.num(dt.quarter);
        case "qq":
          return this.num(dt.quarter, 2);
        case "X":
          return this.num(Math.floor(dt.ts / 1000));
        case "x":
          return this.num(dt.ts);
        default:
          return maybeMacro(token);
      }
    };
    return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
  }
  formatDurationFromString(dur, fmt) {
    const tokenToField = (token) => {
      switch (token[0]) {
        case "S":
          return "millisecond";
        case "s":
          return "second";
        case "m":
          return "minute";
        case "h":
          return "hour";
        case "d":
          return "day";
        case "w":
          return "week";
        case "M":
          return "month";
        case "y":
          return "year";
        default:
          return null;
      }
    }, tokenToString = (lildur) => (token) => {
      const mapped = tokenToField(token);
      if (mapped) {
        return this.num(lildur.get(mapped), token.length);
      } else {
        return token;
      }
    }, tokens = Formatter.parseFormat(fmt), realTokens = tokens.reduce((found, { literal, val }) => literal ? found : found.concat(val), []), collapsed = dur.shiftTo(...realTokens.map(tokenToField).filter((t2) => t2));
    return stringifyTokens(tokens, tokenToString(collapsed));
  }
}

// node_modules/luxon/src/impl/regexParser.js
var ianaRegex = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
function combineRegexes(...regexes) {
  const full = regexes.reduce((f2, r) => f2 + r.source, "");
  return RegExp(`^${full}$`);
}
function combineExtractors(...extractors) {
  return (m2) => extractors.reduce(([mergedVals, mergedZone, cursor], ex) => {
    const [val, zone, next] = ex(m2, cursor);
    return [{ ...mergedVals, ...val }, zone || mergedZone, next];
  }, [{}, null, 1]).slice(0, 2);
}
function parse(s2, ...patterns) {
  if (s2 == null) {
    return [null, null];
  }
  for (const [regex, extractor] of patterns) {
    const m2 = regex.exec(s2);
    if (m2) {
      return extractor(m2);
    }
  }
  return [null, null];
}
function simpleParse(...keys) {
  return (match, cursor) => {
    const ret = {};
    let i;
    for (i = 0;i < keys.length; i++) {
      ret[keys[i]] = parseInteger(match[cursor + i]);
    }
    return [ret, null, cursor + i];
  };
}
var offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/;
var isoExtendedZone = `(?:${offsetRegex.source}?(?:\\[(${ianaRegex.source})\\])?)?`;
var isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
var isoTimeRegex = RegExp(`${isoTimeBaseRegex.source}${isoExtendedZone}`);
var isoTimeExtensionRegex = RegExp(`(?:T${isoTimeRegex.source})?`);
var isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
var isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
var isoOrdinalRegex = /(\d{4})-?(\d{3})/;
var extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay");
var extractISOOrdinalData = simpleParse("year", "ordinal");
var sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/;
var sqlTimeRegex = RegExp(`${isoTimeBaseRegex.source} ?(?:${offsetRegex.source}|(${ianaRegex.source}))?`);
var sqlTimeExtensionRegex = RegExp(`(?: ${sqlTimeRegex.source})?`);
function int(match, pos, fallback) {
  const m2 = match[pos];
  return isUndefined(m2) ? fallback : parseInteger(m2);
}
function extractISOYmd(match, cursor) {
  const item = {
    year: int(match, cursor),
    month: int(match, cursor + 1, 1),
    day: int(match, cursor + 2, 1)
  };
  return [item, null, cursor + 3];
}
function extractISOTime(match, cursor) {
  const item = {
    hours: int(match, cursor, 0),
    minutes: int(match, cursor + 1, 0),
    seconds: int(match, cursor + 2, 0),
    milliseconds: parseMillis(match[cursor + 3])
  };
  return [item, null, cursor + 4];
}
function extractISOOffset(match, cursor) {
  const local = !match[cursor] && !match[cursor + 1], fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]), zone = local ? null : FixedOffsetZone.instance(fullOffset);
  return [{}, zone, cursor + 3];
}
function extractIANAZone(match, cursor) {
  const zone = match[cursor] ? IANAZone.create(match[cursor]) : null;
  return [{}, zone, cursor + 1];
}
var isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);
var isoDuration = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
function extractISODuration(match) {
  const [s2, yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] = match;
  const hasNegativePrefix = s2[0] === "-";
  const negativeSeconds = secondStr && secondStr[0] === "-";
  const maybeNegate = (num, force = false) => num !== undefined && (force || num && hasNegativePrefix) ? -num : num;
  return [
    {
      years: maybeNegate(parseFloating(yearStr)),
      months: maybeNegate(parseFloating(monthStr)),
      weeks: maybeNegate(parseFloating(weekStr)),
      days: maybeNegate(parseFloating(dayStr)),
      hours: maybeNegate(parseFloating(hourStr)),
      minutes: maybeNegate(parseFloating(minuteStr)),
      seconds: maybeNegate(parseFloating(secondStr), secondStr === "-0"),
      milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds)
    }
  ];
}
var obsOffsets = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};
function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
  const result = {
    year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
    month: monthsShort.indexOf(monthStr) + 1,
    day: parseInteger(dayStr),
    hour: parseInteger(hourStr),
    minute: parseInteger(minuteStr)
  };
  if (secondStr)
    result.second = parseInteger(secondStr);
  if (weekdayStr) {
    result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
  }
  return result;
}
var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
function extractRFC2822(match) {
  const [
    ,
    weekdayStr,
    dayStr,
    monthStr,
    yearStr,
    hourStr,
    minuteStr,
    secondStr,
    obsOffset,
    milOffset,
    offHourStr,
    offMinuteStr
  ] = match, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  let offset;
  if (obsOffset) {
    offset = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset = 0;
  } else {
    offset = signedOffset(offHourStr, offMinuteStr);
  }
  return [result, new FixedOffsetZone(offset)];
}
function preprocessRFC2822(s2) {
  return s2.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
}
var rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/;
var rfc850 = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/;
var ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
function extractRFC1123Or850(match) {
  const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}
function extractASCII(match) {
  const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}
var isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
var isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
var isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
var isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
var extractISOYmdTimeAndOffset = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset, extractIANAZone);
var extractISOWeekTimeAndOffset = combineExtractors(extractISOWeekData, extractISOTime, extractISOOffset, extractIANAZone);
var extractISOOrdinalDateAndTime = combineExtractors(extractISOOrdinalData, extractISOTime, extractISOOffset, extractIANAZone);
var extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
function parseISODate(s2) {
  return parse(s2, [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset], [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime], [isoTimeCombinedRegex, extractISOTimeAndOffset]);
}
function parseRFC2822Date(s2) {
  return parse(preprocessRFC2822(s2), [rfc2822, extractRFC2822]);
}
function parseHTTPDate(s2) {
  return parse(s2, [rfc1123, extractRFC1123Or850], [rfc850, extractRFC1123Or850], [ascii, extractASCII]);
}
function parseISODuration(s2) {
  return parse(s2, [isoDuration, extractISODuration]);
}
var extractISOTimeOnly = combineExtractors(extractISOTime);
function parseISOTimeOnly(s2) {
  return parse(s2, [isoTimeOnly, extractISOTimeOnly]);
}
var sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
var sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
var extractISOTimeOffsetAndIANAZone = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
function parseSQL(s2) {
  return parse(s2, [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]);
}

// node_modules/luxon/src/duration.js
var INVALID = "Invalid Duration";
var lowOrderMatrix = {
  weeks: {
    days: 7,
    hours: 7 * 24,
    minutes: 7 * 24 * 60,
    seconds: 7 * 24 * 60 * 60,
    milliseconds: 7 * 24 * 60 * 60 * 1000
  },
  days: {
    hours: 24,
    minutes: 24 * 60,
    seconds: 24 * 60 * 60,
    milliseconds: 24 * 60 * 60 * 1000
  },
  hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1000 },
  minutes: { seconds: 60, milliseconds: 60 * 1000 },
  seconds: { milliseconds: 1000 }
};
var casualMatrix = {
  years: {
    quarters: 4,
    months: 12,
    weeks: 52,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1000
  },
  quarters: {
    months: 3,
    weeks: 13,
    days: 91,
    hours: 91 * 24,
    minutes: 91 * 24 * 60,
    seconds: 91 * 24 * 60 * 60,
    milliseconds: 91 * 24 * 60 * 60 * 1000
  },
  months: {
    weeks: 4,
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1000
  },
  ...lowOrderMatrix
};
var daysInYearAccurate = 146097 / 400;
var daysInMonthAccurate = 146097 / 4800;
var accurateMatrix = {
  years: {
    quarters: 4,
    months: 12,
    weeks: daysInYearAccurate / 7,
    days: daysInYearAccurate,
    hours: daysInYearAccurate * 24,
    minutes: daysInYearAccurate * 24 * 60,
    seconds: daysInYearAccurate * 24 * 60 * 60,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000
  },
  quarters: {
    months: 3,
    weeks: daysInYearAccurate / 28,
    days: daysInYearAccurate / 4,
    hours: daysInYearAccurate * 24 / 4,
    minutes: daysInYearAccurate * 24 * 60 / 4,
    seconds: daysInYearAccurate * 24 * 60 * 60 / 4,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000 / 4
  },
  months: {
    weeks: daysInMonthAccurate / 7,
    days: daysInMonthAccurate,
    hours: daysInMonthAccurate * 24,
    minutes: daysInMonthAccurate * 24 * 60,
    seconds: daysInMonthAccurate * 24 * 60 * 60,
    milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000
  },
  ...lowOrderMatrix
};
var orderedUnits = [
  "years",
  "quarters",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds"
];
var reverseUnits = orderedUnits.slice(0).reverse();
function clone(dur, alts, clear = false) {
  const conf = {
    values: clear ? alts.values : { ...dur.values, ...alts.values || {} },
    loc: dur.loc.clone(alts.loc),
    conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy,
    matrix: alts.matrix || dur.matrix
  };
  return new Duration(conf);
}
function durationToMillis(matrix, vals) {
  let sum = vals.milliseconds ?? 0;
  for (const unit of reverseUnits.slice(1)) {
    if (vals[unit]) {
      sum += vals[unit] * matrix[unit]["milliseconds"];
    }
  }
  return sum;
}
function normalizeValues(matrix, vals) {
  const factor = durationToMillis(matrix, vals) < 0 ? -1 : 1;
  orderedUnits.reduceRight((previous, current) => {
    if (!isUndefined(vals[current])) {
      if (previous) {
        const previousVal = vals[previous] * factor;
        const conv = matrix[current][previous];
        const rollUp = Math.floor(previousVal / conv);
        vals[current] += rollUp * factor;
        vals[previous] -= rollUp * conv * factor;
      }
      return current;
    } else {
      return previous;
    }
  }, null);
  orderedUnits.reduce((previous, current) => {
    if (!isUndefined(vals[current])) {
      if (previous) {
        const fraction = vals[previous] % 1;
        vals[previous] -= fraction;
        vals[current] += fraction * matrix[previous][current];
      }
      return current;
    } else {
      return previous;
    }
  }, null);
}
function removeZeroes(vals) {
  const newVals = {};
  for (const [key, value] of Object.entries(vals)) {
    if (value !== 0) {
      newVals[key] = value;
    }
  }
  return newVals;
}

class Duration {
  constructor(config) {
    const accurate = config.conversionAccuracy === "longterm" || false;
    let matrix = accurate ? accurateMatrix : casualMatrix;
    if (config.matrix) {
      matrix = config.matrix;
    }
    this.values = config.values;
    this.loc = config.loc || Locale.create();
    this.conversionAccuracy = accurate ? "longterm" : "casual";
    this.invalid = config.invalid || null;
    this.matrix = matrix;
    this.isLuxonDuration = true;
  }
  static fromMillis(count, opts) {
    return Duration.fromObject({ milliseconds: count }, opts);
  }
  static fromObject(obj, opts = {}) {
    if (obj == null || typeof obj !== "object") {
      throw new InvalidArgumentError(`Duration.fromObject: argument expected to be an object, got ${obj === null ? "null" : typeof obj}`);
    }
    return new Duration({
      values: normalizeObject(obj, Duration.normalizeUnit),
      loc: Locale.fromObject(opts),
      conversionAccuracy: opts.conversionAccuracy,
      matrix: opts.matrix
    });
  }
  static fromDurationLike(durationLike) {
    if (isNumber(durationLike)) {
      return Duration.fromMillis(durationLike);
    } else if (Duration.isDuration(durationLike)) {
      return durationLike;
    } else if (typeof durationLike === "object") {
      return Duration.fromObject(durationLike);
    } else {
      throw new InvalidArgumentError(`Unknown duration argument ${durationLike} of type ${typeof durationLike}`);
    }
  }
  static fromISO(text, opts) {
    const [parsed] = parseISODuration(text);
    if (parsed) {
      return Duration.fromObject(parsed, opts);
    } else {
      return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }
  static fromISOTime(text, opts) {
    const [parsed] = parseISOTimeOnly(text);
    if (parsed) {
      return Duration.fromObject(parsed, opts);
    } else {
      return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings.throwOnInvalid) {
      throw new InvalidDurationError(invalid);
    } else {
      return new Duration({ invalid });
    }
  }
  static normalizeUnit(unit) {
    const normalized = {
      year: "years",
      years: "years",
      quarter: "quarters",
      quarters: "quarters",
      month: "months",
      months: "months",
      week: "weeks",
      weeks: "weeks",
      day: "days",
      days: "days",
      hour: "hours",
      hours: "hours",
      minute: "minutes",
      minutes: "minutes",
      second: "seconds",
      seconds: "seconds",
      millisecond: "milliseconds",
      milliseconds: "milliseconds"
    }[unit ? unit.toLowerCase() : unit];
    if (!normalized)
      throw new InvalidUnitError(unit);
    return normalized;
  }
  static isDuration(o2) {
    return o2 && o2.isLuxonDuration || false;
  }
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  toFormat(fmt, opts = {}) {
    const fmtOpts = {
      ...opts,
      floor: opts.round !== false && opts.floor !== false
    };
    return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID;
  }
  toHuman(opts = {}) {
    if (!this.isValid)
      return INVALID;
    const l5 = orderedUnits.map((unit) => {
      const val = this.values[unit];
      if (isUndefined(val)) {
        return null;
      }
      return this.loc.numberFormatter({ style: "unit", unitDisplay: "long", ...opts, unit: unit.slice(0, -1) }).format(val);
    }).filter((n2) => n2);
    return this.loc.listFormatter({ type: "conjunction", style: opts.listStyle || "narrow", ...opts }).format(l5);
  }
  toObject() {
    if (!this.isValid)
      return {};
    return { ...this.values };
  }
  toISO() {
    if (!this.isValid)
      return null;
    let s2 = "P";
    if (this.years !== 0)
      s2 += this.years + "Y";
    if (this.months !== 0 || this.quarters !== 0)
      s2 += this.months + this.quarters * 3 + "M";
    if (this.weeks !== 0)
      s2 += this.weeks + "W";
    if (this.days !== 0)
      s2 += this.days + "D";
    if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0)
      s2 += "T";
    if (this.hours !== 0)
      s2 += this.hours + "H";
    if (this.minutes !== 0)
      s2 += this.minutes + "M";
    if (this.seconds !== 0 || this.milliseconds !== 0)
      s2 += roundTo(this.seconds + this.milliseconds / 1000, 3) + "S";
    if (s2 === "P")
      s2 += "T0S";
    return s2;
  }
  toISOTime(opts = {}) {
    if (!this.isValid)
      return null;
    const millis = this.toMillis();
    if (millis < 0 || millis >= 86400000)
      return null;
    opts = {
      suppressMilliseconds: false,
      suppressSeconds: false,
      includePrefix: false,
      format: "extended",
      ...opts,
      includeOffset: false
    };
    const dateTime = DateTime.fromMillis(millis, { zone: "UTC" });
    return dateTime.toISOTime(opts);
  }
  toJSON() {
    return this.toISO();
  }
  toString() {
    return this.toISO();
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `Duration { values: ${JSON.stringify(this.values)} }`;
    } else {
      return `Duration { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  toMillis() {
    if (!this.isValid)
      return NaN;
    return durationToMillis(this.matrix, this.values);
  }
  valueOf() {
    return this.toMillis();
  }
  plus(duration) {
    if (!this.isValid)
      return this;
    const dur = Duration.fromDurationLike(duration), result = {};
    for (const k2 of orderedUnits) {
      if (hasOwnProperty(dur.values, k2) || hasOwnProperty(this.values, k2)) {
        result[k2] = dur.get(k2) + this.get(k2);
      }
    }
    return clone(this, { values: result }, true);
  }
  minus(duration) {
    if (!this.isValid)
      return this;
    const dur = Duration.fromDurationLike(duration);
    return this.plus(dur.negate());
  }
  mapUnits(fn) {
    if (!this.isValid)
      return this;
    const result = {};
    for (const k2 of Object.keys(this.values)) {
      result[k2] = asNumber(fn(this.values[k2], k2));
    }
    return clone(this, { values: result }, true);
  }
  get(unit) {
    return this[Duration.normalizeUnit(unit)];
  }
  set(values) {
    if (!this.isValid)
      return this;
    const mixed = { ...this.values, ...normalizeObject(values, Duration.normalizeUnit) };
    return clone(this, { values: mixed });
  }
  reconfigure({ locale, numberingSystem, conversionAccuracy, matrix } = {}) {
    const loc = this.loc.clone({ locale, numberingSystem });
    const opts = { loc, matrix, conversionAccuracy };
    return clone(this, opts);
  }
  as(unit) {
    return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
  }
  normalize() {
    if (!this.isValid)
      return this;
    const vals = this.toObject();
    normalizeValues(this.matrix, vals);
    return clone(this, { values: vals }, true);
  }
  rescale() {
    if (!this.isValid)
      return this;
    const vals = removeZeroes(this.normalize().shiftToAll().toObject());
    return clone(this, { values: vals }, true);
  }
  shiftTo(...units) {
    if (!this.isValid)
      return this;
    if (units.length === 0) {
      return this;
    }
    units = units.map((u) => Duration.normalizeUnit(u));
    const built = {}, accumulated = {}, vals = this.toObject();
    let lastUnit;
    for (const k2 of orderedUnits) {
      if (units.indexOf(k2) >= 0) {
        lastUnit = k2;
        let own = 0;
        for (const ak in accumulated) {
          own += this.matrix[ak][k2] * accumulated[ak];
          accumulated[ak] = 0;
        }
        if (isNumber(vals[k2])) {
          own += vals[k2];
        }
        const i = Math.trunc(own);
        built[k2] = i;
        accumulated[k2] = (own * 1000 - i * 1000) / 1000;
      } else if (isNumber(vals[k2])) {
        accumulated[k2] = vals[k2];
      }
    }
    for (const key in accumulated) {
      if (accumulated[key] !== 0) {
        built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
      }
    }
    normalizeValues(this.matrix, built);
    return clone(this, { values: built }, true);
  }
  shiftToAll() {
    if (!this.isValid)
      return this;
    return this.shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds");
  }
  negate() {
    if (!this.isValid)
      return this;
    const negated = {};
    for (const k2 of Object.keys(this.values)) {
      negated[k2] = this.values[k2] === 0 ? 0 : -this.values[k2];
    }
    return clone(this, { values: negated }, true);
  }
  get years() {
    return this.isValid ? this.values.years || 0 : NaN;
  }
  get quarters() {
    return this.isValid ? this.values.quarters || 0 : NaN;
  }
  get months() {
    return this.isValid ? this.values.months || 0 : NaN;
  }
  get weeks() {
    return this.isValid ? this.values.weeks || 0 : NaN;
  }
  get days() {
    return this.isValid ? this.values.days || 0 : NaN;
  }
  get hours() {
    return this.isValid ? this.values.hours || 0 : NaN;
  }
  get minutes() {
    return this.isValid ? this.values.minutes || 0 : NaN;
  }
  get seconds() {
    return this.isValid ? this.values.seconds || 0 : NaN;
  }
  get milliseconds() {
    return this.isValid ? this.values.milliseconds || 0 : NaN;
  }
  get isValid() {
    return this.invalid === null;
  }
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }
    if (!this.loc.equals(other.loc)) {
      return false;
    }
    function eq(v1, v2) {
      if (v1 === undefined || v1 === 0)
        return v2 === undefined || v2 === 0;
      return v1 === v2;
    }
    for (const u of orderedUnits) {
      if (!eq(this.values[u], other.values[u])) {
        return false;
      }
    }
    return true;
  }
}

// node_modules/luxon/src/interval.js
var INVALID2 = "Invalid Interval";
function validateStartEnd(start, end) {
  if (!start || !start.isValid) {
    return Interval.invalid("missing or invalid start");
  } else if (!end || !end.isValid) {
    return Interval.invalid("missing or invalid end");
  } else if (end < start) {
    return Interval.invalid("end before start", `The end of an interval must be after its start, but you had start=${start.toISO()} and end=${end.toISO()}`);
  } else {
    return null;
  }
}

class Interval {
  constructor(config) {
    this.s = config.start;
    this.e = config.end;
    this.invalid = config.invalid || null;
    this.isLuxonInterval = true;
  }
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings.throwOnInvalid) {
      throw new InvalidIntervalError(invalid);
    } else {
      return new Interval({ invalid });
    }
  }
  static fromDateTimes(start, end) {
    const builtStart = friendlyDateTime(start), builtEnd = friendlyDateTime(end);
    const validateError = validateStartEnd(builtStart, builtEnd);
    if (validateError == null) {
      return new Interval({
        start: builtStart,
        end: builtEnd
      });
    } else {
      return validateError;
    }
  }
  static after(start, duration) {
    const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(start);
    return Interval.fromDateTimes(dt, dt.plus(dur));
  }
  static before(end, duration) {
    const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(end);
    return Interval.fromDateTimes(dt.minus(dur), dt);
  }
  static fromISO(text, opts) {
    const [s2, e] = (text || "").split("/", 2);
    if (s2 && e) {
      let start, startIsValid;
      try {
        start = DateTime.fromISO(s2, opts);
        startIsValid = start.isValid;
      } catch (e2) {
        startIsValid = false;
      }
      let end, endIsValid;
      try {
        end = DateTime.fromISO(e, opts);
        endIsValid = end.isValid;
      } catch (e2) {
        endIsValid = false;
      }
      if (startIsValid && endIsValid) {
        return Interval.fromDateTimes(start, end);
      }
      if (startIsValid) {
        const dur = Duration.fromISO(e, opts);
        if (dur.isValid) {
          return Interval.after(start, dur);
        }
      } else if (endIsValid) {
        const dur = Duration.fromISO(s2, opts);
        if (dur.isValid) {
          return Interval.before(end, dur);
        }
      }
    }
    return Interval.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
  }
  static isInterval(o2) {
    return o2 && o2.isLuxonInterval || false;
  }
  get start() {
    return this.isValid ? this.s : null;
  }
  get end() {
    return this.isValid ? this.e : null;
  }
  get lastDateTime() {
    return this.isValid ? this.e ? this.e.minus(1) : null : null;
  }
  get isValid() {
    return this.invalidReason === null;
  }
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  length(unit = "milliseconds") {
    return this.isValid ? this.toDuration(...[unit]).get(unit) : NaN;
  }
  count(unit = "milliseconds", opts) {
    if (!this.isValid)
      return NaN;
    const start = this.start.startOf(unit, opts);
    let end;
    if (opts?.useLocaleWeeks) {
      end = this.end.reconfigure({ locale: start.locale });
    } else {
      end = this.end;
    }
    end = end.startOf(unit, opts);
    return Math.floor(end.diff(start, unit).get(unit)) + (end.valueOf() !== this.end.valueOf());
  }
  hasSame(unit) {
    return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
  }
  isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }
  isAfter(dateTime) {
    if (!this.isValid)
      return false;
    return this.s > dateTime;
  }
  isBefore(dateTime) {
    if (!this.isValid)
      return false;
    return this.e <= dateTime;
  }
  contains(dateTime) {
    if (!this.isValid)
      return false;
    return this.s <= dateTime && this.e > dateTime;
  }
  set({ start, end } = {}) {
    if (!this.isValid)
      return this;
    return Interval.fromDateTimes(start || this.s, end || this.e);
  }
  splitAt(...dateTimes) {
    if (!this.isValid)
      return [];
    const sorted = dateTimes.map(friendlyDateTime).filter((d) => this.contains(d)).sort((a2, b) => a2.toMillis() - b.toMillis()), results = [];
    let { s: s2 } = this, i = 0;
    while (s2 < this.e) {
      const added = sorted[i] || this.e, next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s2, next));
      s2 = next;
      i += 1;
    }
    return results;
  }
  splitBy(duration) {
    const dur = Duration.fromDurationLike(duration);
    if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
      return [];
    }
    let { s: s2 } = this, idx = 1, next;
    const results = [];
    while (s2 < this.e) {
      const added = this.start.plus(dur.mapUnits((x) => x * idx));
      next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s2, next));
      s2 = next;
      idx += 1;
    }
    return results;
  }
  divideEqually(numberOfParts) {
    if (!this.isValid)
      return [];
    return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
  }
  overlaps(other) {
    return this.e > other.s && this.s < other.e;
  }
  abutsStart(other) {
    if (!this.isValid)
      return false;
    return +this.e === +other.s;
  }
  abutsEnd(other) {
    if (!this.isValid)
      return false;
    return +other.e === +this.s;
  }
  engulfs(other) {
    if (!this.isValid)
      return false;
    return this.s <= other.s && this.e >= other.e;
  }
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }
    return this.s.equals(other.s) && this.e.equals(other.e);
  }
  intersection(other) {
    if (!this.isValid)
      return this;
    const s2 = this.s > other.s ? this.s : other.s, e = this.e < other.e ? this.e : other.e;
    if (s2 >= e) {
      return null;
    } else {
      return Interval.fromDateTimes(s2, e);
    }
  }
  union(other) {
    if (!this.isValid)
      return this;
    const s2 = this.s < other.s ? this.s : other.s, e = this.e > other.e ? this.e : other.e;
    return Interval.fromDateTimes(s2, e);
  }
  static merge(intervals) {
    const [found, final] = intervals.sort((a2, b) => a2.s - b.s).reduce(([sofar, current], item) => {
      if (!current) {
        return [sofar, item];
      } else if (current.overlaps(item) || current.abutsStart(item)) {
        return [sofar, current.union(item)];
      } else {
        return [sofar.concat([current]), item];
      }
    }, [[], null]);
    if (final) {
      found.push(final);
    }
    return found;
  }
  static xor(intervals) {
    let start = null, currentCount = 0;
    const results = [], ends = intervals.map((i) => [
      { time: i.s, type: "s" },
      { time: i.e, type: "e" }
    ]), flattened = Array.prototype.concat(...ends), arr = flattened.sort((a2, b) => a2.time - b.time);
    for (const i of arr) {
      currentCount += i.type === "s" ? 1 : -1;
      if (currentCount === 1) {
        start = i.time;
      } else {
        if (start && +start !== +i.time) {
          results.push(Interval.fromDateTimes(start, i.time));
        }
        start = null;
      }
    }
    return Interval.merge(results);
  }
  difference(...intervals) {
    return Interval.xor([this].concat(intervals)).map((i) => this.intersection(i)).filter((i) => i && !i.isEmpty());
  }
  toString() {
    if (!this.isValid)
      return INVALID2;
    return `[${this.s.toISO()} – ${this.e.toISO()})`;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `Interval { start: ${this.s.toISO()}, end: ${this.e.toISO()} }`;
    } else {
      return `Interval { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
    return this.isValid ? Formatter.create(this.s.loc.clone(opts), formatOpts).formatInterval(this) : INVALID2;
  }
  toISO(opts) {
    if (!this.isValid)
      return INVALID2;
    return `${this.s.toISO(opts)}/${this.e.toISO(opts)}`;
  }
  toISODate() {
    if (!this.isValid)
      return INVALID2;
    return `${this.s.toISODate()}/${this.e.toISODate()}`;
  }
  toISOTime(opts) {
    if (!this.isValid)
      return INVALID2;
    return `${this.s.toISOTime(opts)}/${this.e.toISOTime(opts)}`;
  }
  toFormat(dateFormat, { separator = " – " } = {}) {
    if (!this.isValid)
      return INVALID2;
    return `${this.s.toFormat(dateFormat)}${separator}${this.e.toFormat(dateFormat)}`;
  }
  toDuration(unit, opts) {
    if (!this.isValid) {
      return Duration.invalid(this.invalidReason);
    }
    return this.e.diff(this.s, unit, opts);
  }
  mapEndpoints(mapFn) {
    return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
  }
}

// node_modules/luxon/src/info.js
class Info {
  static hasDST(zone = Settings.defaultZone) {
    const proto = DateTime.now().setZone(zone).set({ month: 12 });
    return !zone.isUniversal && proto.offset !== proto.set({ month: 6 }).offset;
  }
  static isValidIANAZone(zone) {
    return IANAZone.isValidZone(zone);
  }
  static normalizeZone(input) {
    return normalizeZone(input, Settings.defaultZone);
  }
  static getStartOfWeek({ locale = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale)).getStartOfWeek();
  }
  static getMinimumDaysInFirstWeek({ locale = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale)).getMinDaysInFirstWeek();
  }
  static getWeekendWeekdays({ locale = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale)).getWeekendDays().slice();
  }
  static months(length = "long", { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length);
  }
  static monthsFormat(length = "long", { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length, true);
  }
  static weekdays(length = "long", { locale = null, numberingSystem = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length);
  }
  static weekdaysFormat(length = "long", { locale = null, numberingSystem = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length, true);
  }
  static meridiems({ locale = null } = {}) {
    return Locale.create(locale).meridiems();
  }
  static eras(length = "short", { locale = null } = {}) {
    return Locale.create(locale, null, "gregory").eras(length);
  }
  static features() {
    return { relative: hasRelative(), localeWeek: hasLocaleWeekInfo() };
  }
}

// node_modules/luxon/src/impl/diff.js
function dayDiff(earlier, later) {
  const utcDayStart = (dt) => dt.toUTC(0, { keepLocalTime: true }).startOf("day").valueOf(), ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(Duration.fromMillis(ms).as("days"));
}
function highOrderDiffs(cursor, later, units) {
  const differs = [
    ["years", (a2, b) => b.year - a2.year],
    ["quarters", (a2, b) => b.quarter - a2.quarter + (b.year - a2.year) * 4],
    ["months", (a2, b) => b.month - a2.month + (b.year - a2.year) * 12],
    [
      "weeks",
      (a2, b) => {
        const days = dayDiff(a2, b);
        return (days - days % 7) / 7;
      }
    ],
    ["days", dayDiff]
  ];
  const results = {};
  const earlier = cursor;
  let lowestOrder, highWater;
  for (const [unit, differ] of differs) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;
      results[unit] = differ(cursor, later);
      highWater = earlier.plus(results);
      if (highWater > later) {
        results[unit]--;
        cursor = earlier.plus(results);
        if (cursor > later) {
          highWater = cursor;
          results[unit]--;
          cursor = earlier.plus(results);
        }
      } else {
        cursor = highWater;
      }
    }
  }
  return [cursor, results, highWater, lowestOrder];
}
function diff_default(earlier, later, units, opts) {
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);
  const remainingMillis = later - cursor;
  const lowerOrderUnits = units.filter((u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0);
  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      highWater = cursor.plus({ [lowestOrder]: 1 });
    }
    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
    }
  }
  const duration = Duration.fromObject(results, opts);
  if (lowerOrderUnits.length > 0) {
    return Duration.fromMillis(remainingMillis, opts).shiftTo(...lowerOrderUnits).plus(duration);
  } else {
    return duration;
  }
}

// node_modules/luxon/src/impl/tokenParser.js
var MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";
function intUnit(regex, post = (i) => i) {
  return { regex, deser: ([s2]) => post(parseDigits(s2)) };
}
var NBSP = String.fromCharCode(160);
var spaceOrNBSP = `[ ${NBSP}]`;
var spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");
function fixListRegex(s2) {
  return s2.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
}
function stripInsensitivities(s2) {
  return s2.replace(/\./g, "").replace(spaceOrNBSPRegExp, " ").toLowerCase();
}
function oneOf(strings, startIndex) {
  if (strings === null) {
    return null;
  } else {
    return {
      regex: RegExp(strings.map(fixListRegex).join("|")),
      deser: ([s2]) => strings.findIndex((i) => stripInsensitivities(s2) === stripInsensitivities(i)) + startIndex
    };
  }
}
function offset(regex, groups) {
  return { regex, deser: ([, h, m2]) => signedOffset(h, m2), groups };
}
function simple(regex) {
  return { regex, deser: ([s2]) => s2 };
}
function escapeToken(value) {
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function unitForToken(token, loc) {
  const one = digitRegex(loc), two = digitRegex(loc, "{2}"), three = digitRegex(loc, "{3}"), four = digitRegex(loc, "{4}"), six = digitRegex(loc, "{6}"), oneOrTwo = digitRegex(loc, "{1,2}"), oneToThree = digitRegex(loc, "{1,3}"), oneToSix = digitRegex(loc, "{1,6}"), oneToNine = digitRegex(loc, "{1,9}"), twoToFour = digitRegex(loc, "{2,4}"), fourToSix = digitRegex(loc, "{4,6}"), literal = (t2) => ({ regex: RegExp(escapeToken(t2.val)), deser: ([s2]) => s2, literal: true }), unitate = (t2) => {
    if (token.literal) {
      return literal(t2);
    }
    switch (t2.val) {
      case "G":
        return oneOf(loc.eras("short"), 0);
      case "GG":
        return oneOf(loc.eras("long"), 0);
      case "y":
        return intUnit(oneToSix);
      case "yy":
        return intUnit(twoToFour, untruncateYear);
      case "yyyy":
        return intUnit(four);
      case "yyyyy":
        return intUnit(fourToSix);
      case "yyyyyy":
        return intUnit(six);
      case "M":
        return intUnit(oneOrTwo);
      case "MM":
        return intUnit(two);
      case "MMM":
        return oneOf(loc.months("short", true), 1);
      case "MMMM":
        return oneOf(loc.months("long", true), 1);
      case "L":
        return intUnit(oneOrTwo);
      case "LL":
        return intUnit(two);
      case "LLL":
        return oneOf(loc.months("short", false), 1);
      case "LLLL":
        return oneOf(loc.months("long", false), 1);
      case "d":
        return intUnit(oneOrTwo);
      case "dd":
        return intUnit(two);
      case "o":
        return intUnit(oneToThree);
      case "ooo":
        return intUnit(three);
      case "HH":
        return intUnit(two);
      case "H":
        return intUnit(oneOrTwo);
      case "hh":
        return intUnit(two);
      case "h":
        return intUnit(oneOrTwo);
      case "mm":
        return intUnit(two);
      case "m":
        return intUnit(oneOrTwo);
      case "q":
        return intUnit(oneOrTwo);
      case "qq":
        return intUnit(two);
      case "s":
        return intUnit(oneOrTwo);
      case "ss":
        return intUnit(two);
      case "S":
        return intUnit(oneToThree);
      case "SSS":
        return intUnit(three);
      case "u":
        return simple(oneToNine);
      case "uu":
        return simple(oneOrTwo);
      case "uuu":
        return intUnit(one);
      case "a":
        return oneOf(loc.meridiems(), 0);
      case "kkkk":
        return intUnit(four);
      case "kk":
        return intUnit(twoToFour, untruncateYear);
      case "W":
        return intUnit(oneOrTwo);
      case "WW":
        return intUnit(two);
      case "E":
      case "c":
        return intUnit(one);
      case "EEE":
        return oneOf(loc.weekdays("short", false), 1);
      case "EEEE":
        return oneOf(loc.weekdays("long", false), 1);
      case "ccc":
        return oneOf(loc.weekdays("short", true), 1);
      case "cccc":
        return oneOf(loc.weekdays("long", true), 1);
      case "Z":
      case "ZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);
      case "ZZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);
      case "z":
        return simple(/[a-z_+-/]{1,256}?/i);
      case " ":
        return simple(/[^\S\n\r]/);
      default:
        return literal(t2);
    }
  };
  const unit = unitate(token) || {
    invalidReason: MISSING_FTP
  };
  unit.token = token;
  return unit;
}
var partTypeStyleToTokenVal = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy"
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM"
  },
  day: {
    numeric: "d",
    "2-digit": "dd"
  },
  weekday: {
    short: "EEE",
    long: "EEEE"
  },
  dayperiod: "a",
  dayPeriod: "a",
  hour12: {
    numeric: "h",
    "2-digit": "hh"
  },
  hour24: {
    numeric: "H",
    "2-digit": "HH"
  },
  minute: {
    numeric: "m",
    "2-digit": "mm"
  },
  second: {
    numeric: "s",
    "2-digit": "ss"
  },
  timeZoneName: {
    long: "ZZZZZ",
    short: "ZZZ"
  }
};
function tokenForPart(part, formatOpts, resolvedOpts) {
  const { type, value } = part;
  if (type === "literal") {
    const isSpace = /^\s+$/.test(value);
    return {
      literal: !isSpace,
      val: isSpace ? " " : value
    };
  }
  const style = formatOpts[type];
  let actualType = type;
  if (type === "hour") {
    if (formatOpts.hour12 != null) {
      actualType = formatOpts.hour12 ? "hour12" : "hour24";
    } else if (formatOpts.hourCycle != null) {
      if (formatOpts.hourCycle === "h11" || formatOpts.hourCycle === "h12") {
        actualType = "hour12";
      } else {
        actualType = "hour24";
      }
    } else {
      actualType = resolvedOpts.hour12 ? "hour12" : "hour24";
    }
  }
  let val = partTypeStyleToTokenVal[actualType];
  if (typeof val === "object") {
    val = val[style];
  }
  if (val) {
    return {
      literal: false,
      val
    };
  }
  return;
}
function buildRegex(units) {
  const re = units.map((u) => u.regex).reduce((f2, r) => `${f2}(${r.source})`, "");
  return [`^${re}$`, units];
}
function match(input, regex, handlers) {
  const matches = input.match(regex);
  if (matches) {
    const all = {};
    let matchIndex = 1;
    for (const i in handlers) {
      if (hasOwnProperty(handlers, i)) {
        const h = handlers[i], groups = h.groups ? h.groups + 1 : 1;
        if (!h.literal && h.token) {
          all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
        }
        matchIndex += groups;
      }
    }
    return [matches, all];
  } else {
    return [matches, {}];
  }
}
function dateTimeFromMatches(matches) {
  const toField = (token) => {
    switch (token) {
      case "S":
        return "millisecond";
      case "s":
        return "second";
      case "m":
        return "minute";
      case "h":
      case "H":
        return "hour";
      case "d":
        return "day";
      case "o":
        return "ordinal";
      case "L":
      case "M":
        return "month";
      case "y":
        return "year";
      case "E":
      case "c":
        return "weekday";
      case "W":
        return "weekNumber";
      case "k":
        return "weekYear";
      case "q":
        return "quarter";
      default:
        return null;
    }
  };
  let zone = null;
  let specificOffset;
  if (!isUndefined(matches.z)) {
    zone = IANAZone.create(matches.z);
  }
  if (!isUndefined(matches.Z)) {
    if (!zone) {
      zone = new FixedOffsetZone(matches.Z);
    }
    specificOffset = matches.Z;
  }
  if (!isUndefined(matches.q)) {
    matches.M = (matches.q - 1) * 3 + 1;
  }
  if (!isUndefined(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h += 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }
  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }
  if (!isUndefined(matches.u)) {
    matches.S = parseMillis(matches.u);
  }
  const vals = Object.keys(matches).reduce((r, k2) => {
    const f2 = toField(k2);
    if (f2) {
      r[f2] = matches[k2];
    }
    return r;
  }, {});
  return [vals, zone, specificOffset];
}
var dummyDateTimeCache = null;
function getDummyDateTime() {
  if (!dummyDateTimeCache) {
    dummyDateTimeCache = DateTime.fromMillis(1555555555555);
  }
  return dummyDateTimeCache;
}
function maybeExpandMacroToken(token, locale) {
  if (token.literal) {
    return token;
  }
  const formatOpts = Formatter.macroTokenToFormatOpts(token.val);
  const tokens = formatOptsToTokens(formatOpts, locale);
  if (tokens == null || tokens.includes(undefined)) {
    return token;
  }
  return tokens;
}
function expandMacroTokens(tokens, locale) {
  return Array.prototype.concat(...tokens.map((t2) => maybeExpandMacroToken(t2, locale)));
}

class TokenParser {
  constructor(locale, format) {
    this.locale = locale;
    this.format = format;
    this.tokens = expandMacroTokens(Formatter.parseFormat(format), locale);
    this.units = this.tokens.map((t2) => unitForToken(t2, locale));
    this.disqualifyingUnit = this.units.find((t2) => t2.invalidReason);
    if (!this.disqualifyingUnit) {
      const [regexString, handlers] = buildRegex(this.units);
      this.regex = RegExp(regexString, "i");
      this.handlers = handlers;
    }
  }
  explainFromTokens(input) {
    if (!this.isValid) {
      return { input, tokens: this.tokens, invalidReason: this.invalidReason };
    } else {
      const [rawMatches, matches] = match(input, this.regex, this.handlers), [result, zone, specificOffset] = matches ? dateTimeFromMatches(matches) : [null, null, undefined];
      if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
        throw new ConflictingSpecificationError("Can't include meridiem when specifying 24-hour format");
      }
      return {
        input,
        tokens: this.tokens,
        regex: this.regex,
        rawMatches,
        matches,
        result,
        zone,
        specificOffset
      };
    }
  }
  get isValid() {
    return !this.disqualifyingUnit;
  }
  get invalidReason() {
    return this.disqualifyingUnit ? this.disqualifyingUnit.invalidReason : null;
  }
}
function explainFromTokens(locale, input, format) {
  const parser = new TokenParser(locale, format);
  return parser.explainFromTokens(input);
}
function parseFromTokens(locale, input, format) {
  const { result, zone, specificOffset, invalidReason } = explainFromTokens(locale, input, format);
  return [result, zone, specificOffset, invalidReason];
}
function formatOptsToTokens(formatOpts, locale) {
  if (!formatOpts) {
    return null;
  }
  const formatter = Formatter.create(locale, formatOpts);
  const df = formatter.dtFormatter(getDummyDateTime());
  const parts = df.formatToParts();
  const resolvedOpts = df.resolvedOptions();
  return parts.map((p) => tokenForPart(p, formatOpts, resolvedOpts));
}

// node_modules/luxon/src/datetime.js
var INVALID3 = "Invalid DateTime";
var MAX_DATE = 8640000000000000;
function unsupportedZone(zone) {
  return new Invalid("unsupported zone", `the zone "${zone.name}" is not supported`);
}
function possiblyCachedWeekData(dt) {
  if (dt.weekData === null) {
    dt.weekData = gregorianToWeek(dt.c);
  }
  return dt.weekData;
}
function possiblyCachedLocalWeekData(dt) {
  if (dt.localWeekData === null) {
    dt.localWeekData = gregorianToWeek(dt.c, dt.loc.getMinDaysInFirstWeek(), dt.loc.getStartOfWeek());
  }
  return dt.localWeekData;
}
function clone2(inst, alts) {
  const current = {
    ts: inst.ts,
    zone: inst.zone,
    c: inst.c,
    o: inst.o,
    loc: inst.loc,
    invalid: inst.invalid
  };
  return new DateTime({ ...current, ...alts, old: current });
}
function fixOffset(localTS, o2, tz) {
  let utcGuess = localTS - o2 * 60 * 1000;
  const o22 = tz.offset(utcGuess);
  if (o2 === o22) {
    return [utcGuess, o2];
  }
  utcGuess -= (o22 - o2) * 60 * 1000;
  const o3 = tz.offset(utcGuess);
  if (o22 === o3) {
    return [utcGuess, o22];
  }
  return [localTS - Math.min(o22, o3) * 60 * 1000, Math.max(o22, o3)];
}
function tsToObj(ts, offset2) {
  ts += offset2 * 60 * 1000;
  const d = new Date(ts);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    millisecond: d.getUTCMilliseconds()
  };
}
function objToTS(obj, offset2, zone) {
  return fixOffset(objToLocalTS(obj), offset2, zone);
}
function adjustTime(inst, dur) {
  const oPre = inst.o, year = inst.c.year + Math.trunc(dur.years), month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3, c = {
    ...inst.c,
    year,
    month,
    day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + Math.trunc(dur.weeks) * 7
  }, millisToAdd = Duration.fromObject({
    years: dur.years - Math.trunc(dur.years),
    quarters: dur.quarters - Math.trunc(dur.quarters),
    months: dur.months - Math.trunc(dur.months),
    weeks: dur.weeks - Math.trunc(dur.weeks),
    days: dur.days - Math.trunc(dur.days),
    hours: dur.hours,
    minutes: dur.minutes,
    seconds: dur.seconds,
    milliseconds: dur.milliseconds
  }).as("milliseconds"), localTS = objToLocalTS(c);
  let [ts, o2] = fixOffset(localTS, oPre, inst.zone);
  if (millisToAdd !== 0) {
    ts += millisToAdd;
    o2 = inst.zone.offset(ts);
  }
  return { ts, o: o2 };
}
function parseDataToDateTime(parsed, parsedZone, opts, format, text, specificOffset) {
  const { setZone, zone } = opts;
  if (parsed && Object.keys(parsed).length !== 0 || parsedZone) {
    const interpretationZone = parsedZone || zone, inst = DateTime.fromObject(parsed, {
      ...opts,
      zone: interpretationZone,
      specificOffset
    });
    return setZone ? inst : inst.setZone(zone);
  } else {
    return DateTime.invalid(new Invalid("unparsable", `the input "${text}" can't be parsed as ${format}`));
  }
}
function toTechFormat(dt, format, allowZ = true) {
  return dt.isValid ? Formatter.create(Locale.create("en-US"), {
    allowZ,
    forceSimple: true
  }).formatDateTimeFromString(dt, format) : null;
}
function toISODate(o2, extended) {
  const longFormat = o2.c.year > 9999 || o2.c.year < 0;
  let c = "";
  if (longFormat && o2.c.year >= 0)
    c += "+";
  c += padStart(o2.c.year, longFormat ? 6 : 4);
  if (extended) {
    c += "-";
    c += padStart(o2.c.month);
    c += "-";
    c += padStart(o2.c.day);
  } else {
    c += padStart(o2.c.month);
    c += padStart(o2.c.day);
  }
  return c;
}
function toISOTime(o2, extended, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone) {
  let c = padStart(o2.c.hour);
  if (extended) {
    c += ":";
    c += padStart(o2.c.minute);
    if (o2.c.millisecond !== 0 || o2.c.second !== 0 || !suppressSeconds) {
      c += ":";
    }
  } else {
    c += padStart(o2.c.minute);
  }
  if (o2.c.millisecond !== 0 || o2.c.second !== 0 || !suppressSeconds) {
    c += padStart(o2.c.second);
    if (o2.c.millisecond !== 0 || !suppressMilliseconds) {
      c += ".";
      c += padStart(o2.c.millisecond, 3);
    }
  }
  if (includeOffset) {
    if (o2.isOffsetFixed && o2.offset === 0 && !extendedZone) {
      c += "Z";
    } else if (o2.o < 0) {
      c += "-";
      c += padStart(Math.trunc(-o2.o / 60));
      c += ":";
      c += padStart(Math.trunc(-o2.o % 60));
    } else {
      c += "+";
      c += padStart(Math.trunc(o2.o / 60));
      c += ":";
      c += padStart(Math.trunc(o2.o % 60));
    }
  }
  if (extendedZone) {
    c += "[" + o2.zone.ianaName + "]";
  }
  return c;
}
var defaultUnitValues = {
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
};
var defaultWeekUnitValues = {
  weekNumber: 1,
  weekday: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
};
var defaultOrdinalUnitValues = {
  ordinal: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
};
var orderedUnits2 = ["year", "month", "day", "hour", "minute", "second", "millisecond"];
var orderedWeekUnits = [
  "weekYear",
  "weekNumber",
  "weekday",
  "hour",
  "minute",
  "second",
  "millisecond"
];
var orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"];
function normalizeUnit(unit) {
  const normalized = {
    year: "year",
    years: "year",
    month: "month",
    months: "month",
    day: "day",
    days: "day",
    hour: "hour",
    hours: "hour",
    minute: "minute",
    minutes: "minute",
    quarter: "quarter",
    quarters: "quarter",
    second: "second",
    seconds: "second",
    millisecond: "millisecond",
    milliseconds: "millisecond",
    weekday: "weekday",
    weekdays: "weekday",
    weeknumber: "weekNumber",
    weeksnumber: "weekNumber",
    weeknumbers: "weekNumber",
    weekyear: "weekYear",
    weekyears: "weekYear",
    ordinal: "ordinal"
  }[unit.toLowerCase()];
  if (!normalized)
    throw new InvalidUnitError(unit);
  return normalized;
}
function normalizeUnitWithLocalWeeks(unit) {
  switch (unit.toLowerCase()) {
    case "localweekday":
    case "localweekdays":
      return "localWeekday";
    case "localweeknumber":
    case "localweeknumbers":
      return "localWeekNumber";
    case "localweekyear":
    case "localweekyears":
      return "localWeekYear";
    default:
      return normalizeUnit(unit);
  }
}
function guessOffsetForZone(zone) {
  if (zoneOffsetTs === undefined) {
    zoneOffsetTs = Settings.now();
  }
  if (zone.type !== "iana") {
    return zone.offset(zoneOffsetTs);
  }
  const zoneName = zone.name;
  let offsetGuess = zoneOffsetGuessCache.get(zoneName);
  if (offsetGuess === undefined) {
    offsetGuess = zone.offset(zoneOffsetTs);
    zoneOffsetGuessCache.set(zoneName, offsetGuess);
  }
  return offsetGuess;
}
function quickDT(obj, opts) {
  const zone = normalizeZone(opts.zone, Settings.defaultZone);
  if (!zone.isValid) {
    return DateTime.invalid(unsupportedZone(zone));
  }
  const loc = Locale.fromObject(opts);
  let ts, o2;
  if (!isUndefined(obj.year)) {
    for (const u of orderedUnits2) {
      if (isUndefined(obj[u])) {
        obj[u] = defaultUnitValues[u];
      }
    }
    const invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);
    if (invalid) {
      return DateTime.invalid(invalid);
    }
    const offsetProvis = guessOffsetForZone(zone);
    [ts, o2] = objToTS(obj, offsetProvis, zone);
  } else {
    ts = Settings.now();
  }
  return new DateTime({ ts, zone, loc, o: o2 });
}
function diffRelative(start, end, opts) {
  const round = isUndefined(opts.round) ? true : opts.round, format = (c, unit) => {
    c = roundTo(c, round || opts.calendary ? 0 : 2, true);
    const formatter = end.loc.clone(opts).relFormatter(opts);
    return formatter.format(c, unit);
  }, differ = (unit) => {
    if (opts.calendary) {
      if (!end.hasSame(start, unit)) {
        return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
      } else
        return 0;
    } else {
      return end.diff(start, unit).get(unit);
    }
  };
  if (opts.unit) {
    return format(differ(opts.unit), opts.unit);
  }
  for (const unit of opts.units) {
    const count = differ(unit);
    if (Math.abs(count) >= 1) {
      return format(count, unit);
    }
  }
  return format(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
}
function lastOpts(argList) {
  let opts = {}, args;
  if (argList.length > 0 && typeof argList[argList.length - 1] === "object") {
    opts = argList[argList.length - 1];
    args = Array.from(argList).slice(0, argList.length - 1);
  } else {
    args = Array.from(argList);
  }
  return [opts, args];
}
var zoneOffsetTs;
var zoneOffsetGuessCache = new Map;

class DateTime {
  constructor(config) {
    const zone = config.zone || Settings.defaultZone;
    let invalid = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
    this.ts = isUndefined(config.ts) ? Settings.now() : config.ts;
    let c = null, o2 = null;
    if (!invalid) {
      const unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);
      if (unchanged) {
        [c, o2] = [config.old.c, config.old.o];
      } else {
        const ot = isNumber(config.o) && !config.old ? config.o : zone.offset(this.ts);
        c = tsToObj(this.ts, ot);
        invalid = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
        c = invalid ? null : c;
        o2 = invalid ? null : ot;
      }
    }
    this._zone = zone;
    this.loc = config.loc || Locale.create();
    this.invalid = invalid;
    this.weekData = null;
    this.localWeekData = null;
    this.c = c;
    this.o = o2;
    this.isLuxonDateTime = true;
  }
  static now() {
    return new DateTime({});
  }
  static local() {
    const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
    return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
  }
  static utc() {
    const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
    opts.zone = FixedOffsetZone.utcInstance;
    return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
  }
  static fromJSDate(date, options = {}) {
    const ts = isDate(date) ? date.valueOf() : NaN;
    if (Number.isNaN(ts)) {
      return DateTime.invalid("invalid input");
    }
    const zoneToUse = normalizeZone(options.zone, Settings.defaultZone);
    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }
    return new DateTime({
      ts,
      zone: zoneToUse,
      loc: Locale.fromObject(options)
    });
  }
  static fromMillis(milliseconds, options = {}) {
    if (!isNumber(milliseconds)) {
      throw new InvalidArgumentError(`fromMillis requires a numerical input, but received a ${typeof milliseconds} with value ${milliseconds}`);
    } else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) {
      return DateTime.invalid("Timestamp out of range");
    } else {
      return new DateTime({
        ts: milliseconds,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  static fromSeconds(seconds, options = {}) {
    if (!isNumber(seconds)) {
      throw new InvalidArgumentError("fromSeconds requires a numerical input");
    } else {
      return new DateTime({
        ts: seconds * 1000,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  static fromObject(obj, opts = {}) {
    obj = obj || {};
    const zoneToUse = normalizeZone(opts.zone, Settings.defaultZone);
    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }
    const loc = Locale.fromObject(opts);
    const normalized = normalizeObject(obj, normalizeUnitWithLocalWeeks);
    const { minDaysInFirstWeek, startOfWeek } = usesLocalWeekValues(normalized, loc);
    const tsNow = Settings.now(), offsetProvis = !isUndefined(opts.specificOffset) ? opts.specificOffset : zoneToUse.offset(tsNow), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
    }
    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }
    const useWeekData = definiteWeekDef || normalized.weekday && !containsGregor;
    let units, defaultValues, objNow = tsToObj(tsNow, offsetProvis);
    if (useWeekData) {
      units = orderedWeekUnits;
      defaultValues = defaultWeekUnitValues;
      objNow = gregorianToWeek(objNow, minDaysInFirstWeek, startOfWeek);
    } else if (containsOrdinal) {
      units = orderedOrdinalUnits;
      defaultValues = defaultOrdinalUnitValues;
      objNow = gregorianToOrdinal(objNow);
    } else {
      units = orderedUnits2;
      defaultValues = defaultUnitValues;
    }
    let foundFirst = false;
    for (const u of units) {
      const v = normalized[u];
      if (!isUndefined(v)) {
        foundFirst = true;
      } else if (foundFirst) {
        normalized[u] = defaultValues[u];
      } else {
        normalized[u] = objNow[u];
      }
    }
    const higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized), invalid = higherOrderInvalid || hasInvalidTimeData(normalized);
    if (invalid) {
      return DateTime.invalid(invalid);
    }
    const gregorian = useWeekData ? weekToGregorian(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? ordinalToGregorian(normalized) : normalized, [tsFinal, offsetFinal] = objToTS(gregorian, offsetProvis, zoneToUse), inst = new DateTime({
      ts: tsFinal,
      zone: zoneToUse,
      o: offsetFinal,
      loc
    });
    if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
      return DateTime.invalid("mismatched weekday", `you can't specify both a weekday of ${normalized.weekday} and a date of ${inst.toISO()}`);
    }
    if (!inst.isValid) {
      return DateTime.invalid(inst.invalid);
    }
    return inst;
  }
  static fromISO(text, opts = {}) {
    const [vals, parsedZone] = parseISODate(text);
    return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
  }
  static fromRFC2822(text, opts = {}) {
    const [vals, parsedZone] = parseRFC2822Date(text);
    return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
  }
  static fromHTTP(text, opts = {}) {
    const [vals, parsedZone] = parseHTTPDate(text);
    return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
  }
  static fromFormat(text, fmt, opts = {}) {
    if (isUndefined(text) || isUndefined(fmt)) {
      throw new InvalidArgumentError("fromFormat requires an input string and a format");
    }
    const { locale = null, numberingSystem = null } = opts, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    }), [vals, parsedZone, specificOffset, invalid] = parseFromTokens(localeToUse, text, fmt);
    if (invalid) {
      return DateTime.invalid(invalid);
    } else {
      return parseDataToDateTime(vals, parsedZone, opts, `format ${fmt}`, text, specificOffset);
    }
  }
  static fromString(text, fmt, opts = {}) {
    return DateTime.fromFormat(text, fmt, opts);
  }
  static fromSQL(text, opts = {}) {
    const [vals, parsedZone] = parseSQL(text);
    return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
  }
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings.throwOnInvalid) {
      throw new InvalidDateTimeError(invalid);
    } else {
      return new DateTime({ invalid });
    }
  }
  static isDateTime(o2) {
    return o2 && o2.isLuxonDateTime || false;
  }
  static parseFormatForOpts(formatOpts, localeOpts = {}) {
    const tokenList = formatOptsToTokens(formatOpts, Locale.fromObject(localeOpts));
    return !tokenList ? null : tokenList.map((t2) => t2 ? t2.val : null).join("");
  }
  static expandFormat(fmt, localeOpts = {}) {
    const expanded = expandMacroTokens(Formatter.parseFormat(fmt), Locale.fromObject(localeOpts));
    return expanded.map((t2) => t2.val).join("");
  }
  static resetCache() {
    zoneOffsetTs = undefined;
    zoneOffsetGuessCache.clear();
  }
  get(unit) {
    return this[unit];
  }
  get isValid() {
    return this.invalid === null;
  }
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  get outputCalendar() {
    return this.isValid ? this.loc.outputCalendar : null;
  }
  get zone() {
    return this._zone;
  }
  get zoneName() {
    return this.isValid ? this.zone.name : null;
  }
  get year() {
    return this.isValid ? this.c.year : NaN;
  }
  get quarter() {
    return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
  }
  get month() {
    return this.isValid ? this.c.month : NaN;
  }
  get day() {
    return this.isValid ? this.c.day : NaN;
  }
  get hour() {
    return this.isValid ? this.c.hour : NaN;
  }
  get minute() {
    return this.isValid ? this.c.minute : NaN;
  }
  get second() {
    return this.isValid ? this.c.second : NaN;
  }
  get millisecond() {
    return this.isValid ? this.c.millisecond : NaN;
  }
  get weekYear() {
    return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
  }
  get weekNumber() {
    return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
  }
  get weekday() {
    return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
  }
  get isWeekend() {
    return this.isValid && this.loc.getWeekendDays().includes(this.weekday);
  }
  get localWeekday() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekday : NaN;
  }
  get localWeekNumber() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekNumber : NaN;
  }
  get localWeekYear() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekYear : NaN;
  }
  get ordinal() {
    return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
  }
  get monthShort() {
    return this.isValid ? Info.months("short", { locObj: this.loc })[this.month - 1] : null;
  }
  get monthLong() {
    return this.isValid ? Info.months("long", { locObj: this.loc })[this.month - 1] : null;
  }
  get weekdayShort() {
    return this.isValid ? Info.weekdays("short", { locObj: this.loc })[this.weekday - 1] : null;
  }
  get weekdayLong() {
    return this.isValid ? Info.weekdays("long", { locObj: this.loc })[this.weekday - 1] : null;
  }
  get offset() {
    return this.isValid ? +this.o : NaN;
  }
  get offsetNameShort() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "short",
        locale: this.locale
      });
    } else {
      return null;
    }
  }
  get offsetNameLong() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "long",
        locale: this.locale
      });
    } else {
      return null;
    }
  }
  get isOffsetFixed() {
    return this.isValid ? this.zone.isUniversal : null;
  }
  get isInDST() {
    if (this.isOffsetFixed) {
      return false;
    } else {
      return this.offset > this.set({ month: 1, day: 1 }).offset || this.offset > this.set({ month: 5 }).offset;
    }
  }
  getPossibleOffsets() {
    if (!this.isValid || this.isOffsetFixed) {
      return [this];
    }
    const dayMs = 86400000;
    const minuteMs = 60000;
    const localTS = objToLocalTS(this.c);
    const oEarlier = this.zone.offset(localTS - dayMs);
    const oLater = this.zone.offset(localTS + dayMs);
    const o1 = this.zone.offset(localTS - oEarlier * minuteMs);
    const o2 = this.zone.offset(localTS - oLater * minuteMs);
    if (o1 === o2) {
      return [this];
    }
    const ts1 = localTS - o1 * minuteMs;
    const ts2 = localTS - o2 * minuteMs;
    const c1 = tsToObj(ts1, o1);
    const c2 = tsToObj(ts2, o2);
    if (c1.hour === c2.hour && c1.minute === c2.minute && c1.second === c2.second && c1.millisecond === c2.millisecond) {
      return [clone2(this, { ts: ts1 }), clone2(this, { ts: ts2 })];
    }
    return [this];
  }
  get isInLeapYear() {
    return isLeapYear(this.year);
  }
  get daysInMonth() {
    return daysInMonth(this.year, this.month);
  }
  get daysInYear() {
    return this.isValid ? daysInYear(this.year) : NaN;
  }
  get weeksInWeekYear() {
    return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
  }
  get weeksInLocalWeekYear() {
    return this.isValid ? weeksInWeekYear(this.localWeekYear, this.loc.getMinDaysInFirstWeek(), this.loc.getStartOfWeek()) : NaN;
  }
  resolvedLocaleOptions(opts = {}) {
    const { locale, numberingSystem, calendar } = Formatter.create(this.loc.clone(opts), opts).resolvedOptions(this);
    return { locale, numberingSystem, outputCalendar: calendar };
  }
  toUTC(offset2 = 0, opts = {}) {
    return this.setZone(FixedOffsetZone.instance(offset2), opts);
  }
  toLocal() {
    return this.setZone(Settings.defaultZone);
  }
  setZone(zone, { keepLocalTime = false, keepCalendarTime = false } = {}) {
    zone = normalizeZone(zone, Settings.defaultZone);
    if (zone.equals(this.zone)) {
      return this;
    } else if (!zone.isValid) {
      return DateTime.invalid(unsupportedZone(zone));
    } else {
      let newTS = this.ts;
      if (keepLocalTime || keepCalendarTime) {
        const offsetGuess = zone.offset(this.ts);
        const asObj = this.toObject();
        [newTS] = objToTS(asObj, offsetGuess, zone);
      }
      return clone2(this, { ts: newTS, zone });
    }
  }
  reconfigure({ locale, numberingSystem, outputCalendar } = {}) {
    const loc = this.loc.clone({ locale, numberingSystem, outputCalendar });
    return clone2(this, { loc });
  }
  setLocale(locale) {
    return this.reconfigure({ locale });
  }
  set(values) {
    if (!this.isValid)
      return this;
    const normalized = normalizeObject(values, normalizeUnitWithLocalWeeks);
    const { minDaysInFirstWeek, startOfWeek } = usesLocalWeekValues(normalized, this.loc);
    const settingWeekStuff = !isUndefined(normalized.weekYear) || !isUndefined(normalized.weekNumber) || !isUndefined(normalized.weekday), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
    }
    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }
    let mixed;
    if (settingWeekStuff) {
      mixed = weekToGregorian({ ...gregorianToWeek(this.c, minDaysInFirstWeek, startOfWeek), ...normalized }, minDaysInFirstWeek, startOfWeek);
    } else if (!isUndefined(normalized.ordinal)) {
      mixed = ordinalToGregorian({ ...gregorianToOrdinal(this.c), ...normalized });
    } else {
      mixed = { ...this.toObject(), ...normalized };
      if (isUndefined(normalized.day)) {
        mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
      }
    }
    const [ts, o2] = objToTS(mixed, this.o, this.zone);
    return clone2(this, { ts, o: o2 });
  }
  plus(duration) {
    if (!this.isValid)
      return this;
    const dur = Duration.fromDurationLike(duration);
    return clone2(this, adjustTime(this, dur));
  }
  minus(duration) {
    if (!this.isValid)
      return this;
    const dur = Duration.fromDurationLike(duration).negate();
    return clone2(this, adjustTime(this, dur));
  }
  startOf(unit, { useLocaleWeeks = false } = {}) {
    if (!this.isValid)
      return this;
    const o2 = {}, normalizedUnit = Duration.normalizeUnit(unit);
    switch (normalizedUnit) {
      case "years":
        o2.month = 1;
      case "quarters":
      case "months":
        o2.day = 1;
      case "weeks":
      case "days":
        o2.hour = 0;
      case "hours":
        o2.minute = 0;
      case "minutes":
        o2.second = 0;
      case "seconds":
        o2.millisecond = 0;
        break;
      case "milliseconds":
        break;
    }
    if (normalizedUnit === "weeks") {
      if (useLocaleWeeks) {
        const startOfWeek = this.loc.getStartOfWeek();
        const { weekday } = this;
        if (weekday < startOfWeek) {
          o2.weekNumber = this.weekNumber - 1;
        }
        o2.weekday = startOfWeek;
      } else {
        o2.weekday = 1;
      }
    }
    if (normalizedUnit === "quarters") {
      const q2 = Math.ceil(this.month / 3);
      o2.month = (q2 - 1) * 3 + 1;
    }
    return this.set(o2);
  }
  endOf(unit, opts) {
    return this.isValid ? this.plus({ [unit]: 1 }).startOf(unit, opts).minus(1) : this;
  }
  toFormat(fmt, opts = {}) {
    return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : INVALID3;
  }
  toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
    return this.isValid ? Formatter.create(this.loc.clone(opts), formatOpts).formatDateTime(this) : INVALID3;
  }
  toLocaleParts(opts = {}) {
    return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
  }
  toISO({
    format = "extended",
    suppressSeconds = false,
    suppressMilliseconds = false,
    includeOffset = true,
    extendedZone = false
  } = {}) {
    if (!this.isValid) {
      return null;
    }
    const ext = format === "extended";
    let c = toISODate(this, ext);
    c += "T";
    c += toISOTime(this, ext, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
    return c;
  }
  toISODate({ format = "extended" } = {}) {
    if (!this.isValid) {
      return null;
    }
    return toISODate(this, format === "extended");
  }
  toISOWeekDate() {
    return toTechFormat(this, "kkkk-'W'WW-c");
  }
  toISOTime({
    suppressMilliseconds = false,
    suppressSeconds = false,
    includeOffset = true,
    includePrefix = false,
    extendedZone = false,
    format = "extended"
  } = {}) {
    if (!this.isValid) {
      return null;
    }
    let c = includePrefix ? "T" : "";
    return c + toISOTime(this, format === "extended", suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
  }
  toRFC2822() {
    return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
  }
  toHTTP() {
    return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
  }
  toSQLDate() {
    if (!this.isValid) {
      return null;
    }
    return toISODate(this, true);
  }
  toSQLTime({ includeOffset = true, includeZone = false, includeOffsetSpace = true } = {}) {
    let fmt = "HH:mm:ss.SSS";
    if (includeZone || includeOffset) {
      if (includeOffsetSpace) {
        fmt += " ";
      }
      if (includeZone) {
        fmt += "z";
      } else if (includeOffset) {
        fmt += "ZZ";
      }
    }
    return toTechFormat(this, fmt, true);
  }
  toSQL(opts = {}) {
    if (!this.isValid) {
      return null;
    }
    return `${this.toSQLDate()} ${this.toSQLTime(opts)}`;
  }
  toString() {
    return this.isValid ? this.toISO() : INVALID3;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `DateTime { ts: ${this.toISO()}, zone: ${this.zone.name}, locale: ${this.locale} }`;
    } else {
      return `DateTime { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  valueOf() {
    return this.toMillis();
  }
  toMillis() {
    return this.isValid ? this.ts : NaN;
  }
  toSeconds() {
    return this.isValid ? this.ts / 1000 : NaN;
  }
  toUnixInteger() {
    return this.isValid ? Math.floor(this.ts / 1000) : NaN;
  }
  toJSON() {
    return this.toISO();
  }
  toBSON() {
    return this.toJSDate();
  }
  toObject(opts = {}) {
    if (!this.isValid)
      return {};
    const base = { ...this.c };
    if (opts.includeConfig) {
      base.outputCalendar = this.outputCalendar;
      base.numberingSystem = this.loc.numberingSystem;
      base.locale = this.loc.locale;
    }
    return base;
  }
  toJSDate() {
    return new Date(this.isValid ? this.ts : NaN);
  }
  diff(otherDateTime, unit = "milliseconds", opts = {}) {
    if (!this.isValid || !otherDateTime.isValid) {
      return Duration.invalid("created by diffing an invalid DateTime");
    }
    const durOpts = { locale: this.locale, numberingSystem: this.numberingSystem, ...opts };
    const units = maybeArray(unit).map(Duration.normalizeUnit), otherIsLater = otherDateTime.valueOf() > this.valueOf(), earlier = otherIsLater ? this : otherDateTime, later = otherIsLater ? otherDateTime : this, diffed = diff_default(earlier, later, units, durOpts);
    return otherIsLater ? diffed.negate() : diffed;
  }
  diffNow(unit = "milliseconds", opts = {}) {
    return this.diff(DateTime.now(), unit, opts);
  }
  until(otherDateTime) {
    return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
  }
  hasSame(otherDateTime, unit, opts) {
    if (!this.isValid)
      return false;
    const inputMs = otherDateTime.valueOf();
    const adjustedToZone = this.setZone(otherDateTime.zone, { keepLocalTime: true });
    return adjustedToZone.startOf(unit, opts) <= inputMs && inputMs <= adjustedToZone.endOf(unit, opts);
  }
  equals(other) {
    return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
  }
  toRelative(options = {}) {
    if (!this.isValid)
      return null;
    const base = options.base || DateTime.fromObject({}, { zone: this.zone }), padding = options.padding ? this < base ? -options.padding : options.padding : 0;
    let units = ["years", "months", "days", "hours", "minutes", "seconds"];
    let unit = options.unit;
    if (Array.isArray(options.unit)) {
      units = options.unit;
      unit = undefined;
    }
    return diffRelative(base, this.plus(padding), {
      ...options,
      numeric: "always",
      units,
      unit
    });
  }
  toRelativeCalendar(options = {}) {
    if (!this.isValid)
      return null;
    return diffRelative(options.base || DateTime.fromObject({}, { zone: this.zone }), this, {
      ...options,
      numeric: "auto",
      units: ["years", "months", "days"],
      calendary: true
    });
  }
  static min(...dateTimes) {
    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("min requires all arguments be DateTimes");
    }
    return bestBy(dateTimes, (i) => i.valueOf(), Math.min);
  }
  static max(...dateTimes) {
    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("max requires all arguments be DateTimes");
    }
    return bestBy(dateTimes, (i) => i.valueOf(), Math.max);
  }
  static fromFormatExplain(text, fmt, options = {}) {
    const { locale = null, numberingSystem = null } = options, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    return explainFromTokens(localeToUse, text, fmt);
  }
  static fromStringExplain(text, fmt, options = {}) {
    return DateTime.fromFormatExplain(text, fmt, options);
  }
  static buildFormatParser(fmt, options = {}) {
    const { locale = null, numberingSystem = null } = options, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    return new TokenParser(localeToUse, fmt);
  }
  static fromFormatParser(text, formatParser, opts = {}) {
    if (isUndefined(text) || isUndefined(formatParser)) {
      throw new InvalidArgumentError("fromFormatParser requires an input string and a format parser");
    }
    const { locale = null, numberingSystem = null } = opts, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    if (!localeToUse.equals(formatParser.locale)) {
      throw new InvalidArgumentError(`fromFormatParser called with a locale of ${localeToUse}, ` + `but the format parser was created for ${formatParser.locale}`);
    }
    const { result, zone, specificOffset, invalidReason } = formatParser.explainFromTokens(text);
    if (invalidReason) {
      return DateTime.invalid(invalidReason);
    } else {
      return parseDataToDateTime(result, zone, opts, `format ${formatParser.format}`, text, specificOffset);
    }
  }
  static get DATE_SHORT() {
    return DATE_SHORT;
  }
  static get DATE_MED() {
    return DATE_MED;
  }
  static get DATE_MED_WITH_WEEKDAY() {
    return DATE_MED_WITH_WEEKDAY;
  }
  static get DATE_FULL() {
    return DATE_FULL;
  }
  static get DATE_HUGE() {
    return DATE_HUGE;
  }
  static get TIME_SIMPLE() {
    return TIME_SIMPLE;
  }
  static get TIME_WITH_SECONDS() {
    return TIME_WITH_SECONDS;
  }
  static get TIME_WITH_SHORT_OFFSET() {
    return TIME_WITH_SHORT_OFFSET;
  }
  static get TIME_WITH_LONG_OFFSET() {
    return TIME_WITH_LONG_OFFSET;
  }
  static get TIME_24_SIMPLE() {
    return TIME_24_SIMPLE;
  }
  static get TIME_24_WITH_SECONDS() {
    return TIME_24_WITH_SECONDS;
  }
  static get TIME_24_WITH_SHORT_OFFSET() {
    return TIME_24_WITH_SHORT_OFFSET;
  }
  static get TIME_24_WITH_LONG_OFFSET() {
    return TIME_24_WITH_LONG_OFFSET;
  }
  static get DATETIME_SHORT() {
    return DATETIME_SHORT;
  }
  static get DATETIME_SHORT_WITH_SECONDS() {
    return DATETIME_SHORT_WITH_SECONDS;
  }
  static get DATETIME_MED() {
    return DATETIME_MED;
  }
  static get DATETIME_MED_WITH_SECONDS() {
    return DATETIME_MED_WITH_SECONDS;
  }
  static get DATETIME_MED_WITH_WEEKDAY() {
    return DATETIME_MED_WITH_WEEKDAY;
  }
  static get DATETIME_FULL() {
    return DATETIME_FULL;
  }
  static get DATETIME_FULL_WITH_SECONDS() {
    return DATETIME_FULL_WITH_SECONDS;
  }
  static get DATETIME_HUGE() {
    return DATETIME_HUGE;
  }
  static get DATETIME_HUGE_WITH_SECONDS() {
    return DATETIME_HUGE_WITH_SECONDS;
  }
}
function friendlyDateTime(dateTimeish) {
  if (DateTime.isDateTime(dateTimeish)) {
    return dateTimeish;
  } else if (dateTimeish && dateTimeish.valueOf && isNumber(dateTimeish.valueOf())) {
    return DateTime.fromJSDate(dateTimeish);
  } else if (dateTimeish && typeof dateTimeish === "object") {
    return DateTime.fromObject(dateTimeish);
  } else {
    throw new InvalidArgumentError(`Unknown datetime argument: ${dateTimeish}, of type ${typeof dateTimeish}`);
  }
}

// src/lib/filenames.ts
function getSidecarFilenames(filename) {
  const exts = /\.(jpg|jpeg|png|gif|mp4|m4v|mov)$/i;
  const match2 = exts.exec(filename);
  if (!match2)
    throw new Error(`unknown extension in filename ${filename}`);
  const fileExt = match2[0];
  const fnNoExt = filename.slice(0, fileExt.length * -1);
  const dupeRegex = /(.*)(\(\d{1,2}\))$/;
  const matches = fnNoExt.match(dupeRegex);
  let fnNoDupe = fnNoExt;
  let dupe = "";
  if (matches) {
    if (matches.length !== 3 || !matches[1] || !matches[2])
      throw new Error(`unexpected dupe match for: ${filename}`);
    fnNoDupe = matches[1];
    dupe = matches[2];
  }
  const uneditedFilename = fnNoDupe.replace(/-edited$/, "");
  const maxFilenameLength = 46;
  const baseSidecar = `${uneditedFilename}${fileExt}.supplemental-metadata`.slice(0, maxFilenameLength);
  const sidecars = [`${baseSidecar}${dupe}.json`];
  if (dupe) {
    sidecars.push(`${`${uneditedFilename}${dupe}${fileExt}.supplemental-metadata`.slice(0, maxFilenameLength)}.json`, `${baseSidecar}.json`);
  } else if (filename.length === 50) {
    sidecars.push(`${`${uneditedFilename}${fileExt}.supplemental-metadata`.slice(0, maxFilenameLength - 1)}.json`);
  }
  return sidecars;
}
function dateFromFilename(filename) {
  const whatsapp = /^IMG-(\d{4}\d{2}\d{2})-WA\d{4}\.[a-zA-Z0-9]{3,4}$/i;
  const matches = filename.match(whatsapp);
  debug("whatsapp filename regex match:", matches);
  if (!matches || !matches[1])
    throw new Error(`${filename} not able to be matched in dateFromFilename`);
  const dt = DateTime.fromISO(matches[1], { zone: "UTC" }).set({ hour: 12 });
  debug("filename parsed into DateTime:", dt);
  if (!dt.isValid)
    throw new Error(`failed to parse date from: ${matches[1]}`);
  return dt;
}

// src/cmd/dates.ts
import { join } from "node:path";
async function findSidecar(filename, SIDECAR_FOLDER) {
  const candidates = getSidecarFilenames(filename).map((path) => join(SIDECAR_FOLDER, path));
  for (const candidate of candidates) {
    const f2 = Bun.file(candidate);
    const exists = await f2.exists();
    console.log(candidate, exists ? "exists" : "doesnt exist");
    if (exists)
      return f2;
  }
  throw new Error(`sidecar not found for ${filename}`);
}
async function getTimeFromSidecar(filename, SIDECAR_FOLDER, useCreationTime) {
  const f2 = await findSidecar(filename, SIDECAR_FOLDER);
  const sidecar = await f2.json();
  dir(sidecar);
  const timeField = useCreationTime ? "creationTime" : "photoTakenTime";
  const unixTimestamp = sidecar[timeField].timestamp;
  if (!unixTimestamp)
    throw new Error("no timestamp in sidecar");
  return unixTimestamp;
}
function unixTimeToLuxon(unixTime, EXPECTED_YEAR) {
  const unixTimeAsNum = Number.parseInt(unixTime, 10);
  if (Number.isNaN(unixTimeAsNum))
    throw new Error(`${unixTime} is NaN`);
  const dt = DateTime.fromSeconds(unixTimeAsNum, { zone: "UTC" });
  const isoString = dt.toISO();
  if (!dt.isValid || !isoString.endsWith("Z") || EXPECTED_YEAR && !isoString.startsWith(EXPECTED_YEAR))
    throw new Error(`timestamp conversion failed with ${unixTime}: ${dt}`);
  return dt;
}
async function addTimeToAsset(dt, assetId) {
  const isoString = dt.toISO({});
  log("as ISO:", isoString);
  log("assigning to asset:", assetId);
  const r = await updateAsset({
    id: assetId,
    updateAssetDto: { dateTimeOriginal: isoString }
  });
  debug(r);
  if (!r.exifInfo || !r.exifInfo.dateTimeOriginal)
    throw new Error("no exifInfo on asset");
  log("exifInfo.dateTimeOriginal:", r.exifInfo.dateTimeOriginal);
  const rdt = DateTime.fromISO(r.exifInfo.dateTimeOriginal);
  log("as luxon obj:", rdt);
  debug(+dt, "===", +rdt);
  const setTimeSuccessful = +dt === +rdt;
  if (!setTimeSuccessful)
    throw new Error("time on returned asset was different than what we set it to");
}
async function getBucket(albumId, TARGET_BUCKET) {
  const bucketSize = /^\d{4}-\d{2}-\d{2}/.test(TARGET_BUCKET) ? TimeBucketSize.Day : TimeBucketSize.Month;
  const buckets = await getTimeBuckets({
    albumId,
    order: AssetOrder.Desc,
    size: bucketSize
  });
  debug(buckets);
  log("got", buckets.length, "buckets");
  const target = buckets.find((val) => val.timeBucket.startsWith(TARGET_BUCKET));
  if (!target)
    throw new Error("target bucket missing");
  const bucket = await getTimeBucket({
    albumId,
    size: bucketSize,
    order: AssetOrder.Desc,
    timeBucket: target.timeBucket
  });
  log("got", bucket.length, "items in bucket named", target.timeBucket);
  return bucket;
}
async function fixDatesFromSidecar(params) {
  const {
    albumId,
    MAX_WRITE_OPS = Number.MAX_SAFE_INTEGER,
    TARGET_BUCKET,
    SIDECAR_FOLDER,
    EXPECTED_YEAR,
    useCreationTime,
    tag
  } = params;
  const bucket = await getBucket(albumId, TARGET_BUCKET);
  const changed = new Set;
  try {
    for (let i = 0;i < MAX_WRITE_OPS && i < bucket.length; i++) {
      debug("index", i);
      const asset = bucket[i];
      if (!asset)
        throw new Error(`no asset at index ${i}`);
      log("checking", asset.originalFileName, "id", asset.id);
      const unixTimestamp = await getTimeFromSidecar(asset.originalFileName, SIDECAR_FOLDER, useCreationTime);
      log("unix timestamp from sidecar:", unixTimestamp);
      if (!asset.exifInfo?.dateTimeOriginal)
        throw new Error("expected asset to have exifInfo");
      const originalDT = DateTime.fromISO(asset.exifInfo?.dateTimeOriginal);
      const sidecarDT = unixTimeToLuxon(unixTimestamp, EXPECTED_YEAR);
      const diff = originalDT.diff(sidecarDT, "minutes").toObject();
      debug("time diff", diff);
      if (typeof diff.minutes !== "number")
        throw new Error("luxon diff failed");
      if (Math.abs(diff.minutes) <= 3) {
        log("sidecar timestamp is within 3m of the current one. Not changing.");
      } else {
        log("changing", originalDT.toISO(), "to", sidecarDT.toISO());
        await addTimeToAsset(sidecarDT, asset.id);
        changed.add(asset.id);
      }
      log("");
    }
  } catch (e) {
    console.error(e);
  }
  if (changed.size && tag) {
    await tagAs(changed, tag);
  }
}
async function fixDatesFromFilename(params) {
  const { albumId, MAX_WRITE_OPS = Number.MAX_SAFE_INTEGER, TARGET_BUCKET, EXPECTED_YEAR, tag } = params;
  const bucket = await getBucket(albumId, TARGET_BUCKET);
  const changed = new Set;
  try {
    for (const asset of bucket) {
      if (changed.size >= MAX_WRITE_OPS)
        break;
      const { originalFileName } = asset;
      log("for asset", originalFileName);
      const newDate = dateFromFilename(originalFileName);
      if (EXPECTED_YEAR && newDate.year.toString() !== EXPECTED_YEAR) {
        throw new Error(`expected filename date ${newDate} to have year ${EXPECTED_YEAR}`);
      }
      const dto = asset.exifInfo?.dateTimeOriginal;
      if (!dto)
        throw new Error("expected asset to have exifInfo");
      const oldDate = DateTime.fromISO(dto, { zone: "UTC" });
      if (!oldDate.isValid)
        throw new Error(`failed to parse asset dto date: ${dto}`);
      const diff = oldDate.diff(newDate, "minutes").toObject();
      debug("time diff", diff);
      if (typeof diff.minutes !== "number" || Number.isNaN(diff.minutes))
        throw new Error("luxon diff failed");
      if (Math.abs(diff.minutes) <= 3) {
        log("sidecar timestamp is within 3m of the current one. Not changing.");
        continue;
      }
      log("changing", oldDate.toISO(), "to", newDate.toISO());
      await addTimeToAsset(newDate, asset.id);
      changed.add(asset.id);
      log("");
    }
  } catch (e) {
    console.error(e);
  }
  if (changed.size && tag) {
    await tagAs(changed, tag);
  }
}

// src/main.ts
import { exit } from "node:process";
Settings.throwOnInvalid = true;
Settings.defaultZone = "UTC";
var helpText = `
Usage: bun start <create-stacks | dates-from-sidecar | dates-from-filename> [options] 

Commands (choose one):
  create-stacks                        Create stacks for each -edited + unedited photo pair in an album,
                                       placing edited version on the top of the stack.
  dates-from-sidecar                   Pull dates from google photos supplemental-metadata.json,
                                       and apply the photoTakenTime to the immich asset.
  dates-from-filename                  Parse date from asset filenames, and apply to the asset.

Required global options:
  -u,--api-url <url>                   Immich instance API URL, like: http://192.168.1.10:2283/api.
                                       (Also settable via env IMMICH_INSTANCE_URL)
  -k,--api-key <key>                   API key (can also be set via env IMMICH_INSTANCE_URL)
  -A,--album-name <name>               Album to pull assets from. Must provide either album-name or album-id.
  --album-id <id>                      Takes precedence over album-name. UUID.

Global options:
  -h,--help                            Display this help text.
  -n,--dry-run                         No write operations.
  -m,--max-write-ops <number>          Caps # of write (updateAsset) operations.
  --tag <tagName>                      Tag all updated assets with this tagName.
  -v,--verbose                         Turn on debug logs.

Required dates-from-* options:
  --in-time-bucket <bucketName>        Only assets in this time bucket inside the album will be processed.
                                       Like: YYYY-MM (for month bucket) or YYYY-MM-DD (for day bucket)
dates-from-* options:
  -e,--expected-year-for-fixed <year>  Expected year on fixed dates. Sanity check. Like: YYYY

Required dates-from-sidecar options:
  --sidecar-folder <path>              Folder on local system which contains Google Photos sidecar json metadata files.

dates-from-sidecar options:
  --use-creation-time                  In sidecar JSON, true to use creationTime, false (default) to use photoTakenTime. 
`;
var { values: argValues, positionals } = parseArgs({
  allowPositionals: true,
  strict: true,
  options: {
    "api-url": {
      type: "string",
      short: "u",
      default: process.env.IMMICH_INSTANCE_URL
    },
    "api-key": {
      type: "string",
      short: "k",
      default: process.env.IMMICH_API_KEY
    },
    "album-name": {
      type: "string",
      short: "A"
    },
    "album-id": {
      type: "string"
    },
    verbose: {
      type: "boolean",
      default: false,
      short: "v"
    },
    help: {
      type: "boolean",
      short: "h"
    },
    "dry-run": {
      type: "boolean",
      short: "n"
    },
    "max-write-ops": {
      type: "string",
      default: Number.MAX_SAFE_INTEGER.toString(),
      short: "m"
    },
    tag: {
      type: "string",
      argumentName: "name"
    },
    "in-time-bucket": {
      type: "string",
      default: ""
    },
    "expected-year-for-fixed": {
      type: "string",
      short: "e"
    },
    "sidecar-folder": {
      type: "string",
      default: ""
    },
    "use-creation-time": {
      type: "boolean",
      default: false
    }
  }
});
setDebug(argValues.verbose);
debug(positionals);
debug(argValues);
if (argValues.help) {
  log(helpText);
  exit(0);
}
var s2 = 0;
var ds = 0;
var df = 0;
for (const p of positionals) {
  if (p === "create-stacks")
    s2++;
  else if (p === "dates-from-sidecar")
    ds++;
  else if (p === "dates-from-filename")
    df++;
  else
    throw new Error(`unknown command ${p}`);
}
if (s2 > 1 || ds > 1 || df > 1)
  throw new Error("invalid duplicated command args");
if (s2 + ds + df > 1)
  throw new Error("Only choose one command");
if (s2 + ds + df === 0)
  throw new Error("Choose a command");
if (!argValues["api-url"])
  throw new Error("must provide an API URL");
if (!argValues["api-key"])
  throw new Error("must provide an API key");
if (!argValues["album-id"] && !argValues["album-name"])
  throw new Error("provide an album name or ID");
if (argValues["album-id"])
  assert.match(argValues["album-id"], /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/, "album-id must be a UUID");
if (ds || df) {
  assert.match(argValues["in-time-bucket"], /\d{4}-\d{2}(-\d{2})?$/, "time bucket must be an ISO date string like YYYY-MM or YYYY-MM-DD");
  if (ds) {
    if (!argValues["sidecar-folder"])
      throw new Error("must provide sidecar folder to fix dates from sidecar");
    await readdir(argValues["sidecar-folder"]);
  }
  if (argValues["expected-year-for-fixed"]) {
    assert.match(argValues["expected-year-for-fixed"], /^\d{4}$/, "expected year must be in the format YYYY");
  }
}
var MAX_WRITE_OPS = argValues["dry-run"] ? 0 : Number.parseInt(argValues["max-write-ops"], 10);
debug("max write ops", MAX_WRITE_OPS);
if (Number.isNaN(MAX_WRITE_OPS))
  throw new Error("max-write-ops is Not a Number");
init({ baseUrl: argValues["api-url"], apiKey: argValues["api-key"] });
var p = await pingServer();
if (p.res !== "pong")
  throw new Error("invalid API URL");
log("API url is valid");
var v = await validateAccessToken();
if (!v.authStatus)
  throw new Error("invalid API key");
log("API key is valid");
var albumId = argValues["album-id"];
if (!albumId) {
  const albums = await getAllAlbums({});
  const albumName = argValues["album-name"];
  const matchedAlbums = albums.filter((album) => album.albumName === albumName);
  if (!matchedAlbums.length || !matchedAlbums[0])
    throw new Error(`album ${albumName} not found`);
  if (matchedAlbums.length > 1)
    throw new Error(`multiple albums found with name ${albumName}`);
  albumId = matchedAlbums[0].id;
  log("album", albumName, "--> id", albumId);
}
if (ds) {
  await fixDatesFromSidecar({
    albumId,
    MAX_WRITE_OPS,
    TARGET_BUCKET: argValues["in-time-bucket"],
    SIDECAR_FOLDER: argValues["sidecar-folder"],
    EXPECTED_YEAR: argValues["expected-year-for-fixed"],
    useCreationTime: argValues["use-creation-time"],
    tag: argValues.tag
  });
}
if (df) {
  await fixDatesFromFilename({
    albumId,
    MAX_WRITE_OPS,
    TARGET_BUCKET: argValues["in-time-bucket"],
    EXPECTED_YEAR: argValues["expected-year-for-fixed"],
    tag: argValues.tag
  });
}
if (s2) {
  await createEditedStacks({
    albumId,
    MAX_WRITE_OPS,
    tag: argValues.tag
  });
}
