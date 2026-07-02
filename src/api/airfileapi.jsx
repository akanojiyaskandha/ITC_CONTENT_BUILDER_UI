import newBackend from "./airfile-instance";

export const PLAYLIST_LANGUAGES = ["English", "Hindi", "Kannada", "Tamil", "Telugu"];

const BASE = () =>
  import.meta.env.VITE_AIRFILE_API_URL ?? "http://localhost:4000/api/v1";

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

export function triggerDownload(url) {
  window.open(url, "_blank", "noopener");
}
