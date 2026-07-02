import ltsApi from "./ltsApi";

export async function getStats() {
  const { data } = await ltsApi.get("/stats");
  return data.data;
}
