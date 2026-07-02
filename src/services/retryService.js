import ltsApi from "./ltsApi";

export async function retryMissingContent({ playlistDate, reportFile }) {
  const payload = {};
  if (playlistDate) payload.playlistDate = playlistDate;
  if (reportFile) payload.reportFile = reportFile;
  const { data } = await ltsApi.post("/retry-missing-content", payload);
  return data.data;
}
