import ltsApi from "./ltsApi";

export async function getChannels({ page = 1, limit = 50 } = {}) {
  const { data } = await ltsApi.get("/channels", { params: { page, limit } });
  return data.data;
}

export async function getChannelDates(channel, { page = 1, limit = 50 } = {}) {
  const { data } = await ltsApi.get(
    `/channels/${encodeURIComponent(channel)}/dates`,
    { params: { page, limit } }
  );
  return data.data;
}

export async function deleteDateFolder(channel, date) {
  const { data } = await ltsApi.delete(
    `/channels/${encodeURIComponent(channel)}/dates/${date}`
  );
  return data;
}
