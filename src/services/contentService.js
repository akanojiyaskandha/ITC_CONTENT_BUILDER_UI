import ltsApi from "./ltsApi";

export async function getContent({ channel, date, folder, page = 1, limit = 50 }) {
  const { data } = await ltsApi.get("/content", {
    params: { channel, date, folder, page, limit },
  });
  return data.data;
}

export async function copyMissingContent({ contentId, channelName, playlistDate }) {
  const { data } = await ltsApi.post("/content/copy-missing", {
    contentId,
    channelName,
    playlistDate,
  });
  return data.data;
}
