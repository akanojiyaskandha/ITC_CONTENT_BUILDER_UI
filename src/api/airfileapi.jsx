import newBackend from "./airfile-instance";

export const PLAYLIST_LANGUAGES = ["English", "Hindi", "Kannada", "Tamil", "Telugu"];

// Maps a GCS channel name (from backend/'s /channels) to the newThings
// playlist route segment (/playlists/<segment>/convert) that handles it.
export const CHANNEL_TO_PLAYLIST_ROUTE = {
  SS1_HD_LTS: "English",
  SS1_HINDIHD_LTS: "Hindi",
  SS1_KANNADA_LTS: "Kannada",
  SS1_TAMILHD_LTS: "Tamil",
  SS1_TELUGUHD_LTS: "Telugu",
  SS2_HD_LTS: "EnglishSS2",
  SS2_HINDIHD_LTS: "HindiSS2",
  SS2_KANNADA_LTS: "KannadaSS2",
  SS2_TAMILHD_LTS: "TamilSS2",
  SS2_TELUGUHD_LTS: "TeluguSS2",
  SS1_SELECTHD_LTS: "SS1_SELECTHD_LTS",
  SS2_SELECTHD_LTS: "SS2_SELECTHD_LTS",
  SS_KHEL_LTS: "SS2_KHEL_LTS",
  SS3_LTS: "SS3_LTS",
};

export function resolvePlaylistRoute(channel) {
  return CHANNEL_TO_PLAYLIST_ROUTE[channel];
}

const BASE = () => import.meta.env.VITE_AIRFILE_API_URL ?? "";

export async function convertPlaylist(lang, formData) {
  const { data } = await newBackend.post(
    `/playlists/${lang}/convert`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function convertPlaylistProgress(lang, formData, onProgress) {
  const { data } = await newBackend.post(
    `/playlists/${lang}/convert`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100)),
    }
  );
  return data;
}

export async function convertPlaylistGCS(lang, formData) {
  const { data } = await newBackend.post(
    `/playlists/${lang}/convert/s3`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function uploadPTK(formData) {
  const { data } = await newBackend.post("/PTK/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function syncPTKFromSheets() {
  const { data } = await newBackend.get("/PTK/read");
  return data;
}

export async function uploadXML(formData) {
  const { data } = await newBackend.post("/xml/Upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export function getPlaylistDownloadUrl(lang, sessionId, type) {
  return `${BASE()}/playlists/${lang}/download/${type}/${sessionId}`;
}

export async function downloadPlaylistBlob(lang, sessionId, type) {
  const { data } = await newBackend.get(
    `/playlists/${lang}/download/${type}/${sessionId}`,
    { responseType: "blob" }
  );
  return data;
}

export function getPTKDownloadUrl() {
  return `${BASE()}/PTK/download`;
}

export async function generateEasyAir(houseId) {
  const { data } = await newBackend.post("/easy-air/generate", { houseId });
  return data;
}

export function getEasyAirDownloadUrl(filename) {
  return `${BASE()}/easy-air/download/${encodeURIComponent(filename)}`;
}

export function triggerDownload(url) {
  window.open(url, "_blank", "noopener");
}
