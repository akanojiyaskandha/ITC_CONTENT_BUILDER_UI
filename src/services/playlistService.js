import ltsApi from "./ltsApi";

export async function uploadPlaylist(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await ltsApi.post("/playlist/process", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}
