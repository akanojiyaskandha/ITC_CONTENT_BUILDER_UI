import ltsApi from "./ltsApi";

export async function uploadAsrun({ asrunFile, playlistFile }) {
  const form = new FormData();
  form.append("asrunFile", asrunFile);
  form.append("playlistFile", playlistFile);
  const { data } = await ltsApi.post("/asrun/process", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function downloadAsrunCsv(filename) {
  const base = import.meta.env.VITE_LTS_API_URL ?? "/api/v1";
  const url = `${base}/asrun/download?file=${encodeURIComponent(filename)}`;

  const res = await fetch(url);

  if (!res.ok) {
    let message = "File not found on server.";
    try {
      const json = await res.json();
      message = json.message ?? message;
    } catch {
      // response was not JSON — use default message
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}
