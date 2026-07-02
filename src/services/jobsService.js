import ltsApi from "./ltsApi";

export async function getJob(id) {
  const { data } = await ltsApi.get(`/jobs/${id}`);
  return data.data;
}
