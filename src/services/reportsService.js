import ltsApi from "./ltsApi";

export async function getMissingReports() {
  const { data } = await ltsApi.get("/missing-reports");
  return data.data;
}

export async function getMissingReportRows({ channel, date, page = 1, limit = 100 }) {
  const { data } = await ltsApi.get("/missing-report", {
    params: { channel, date, page, limit },
  });
  return data.data;
}

export async function getMasterReport({ page = 1, limit = 100, date = "", search = "" } = {}) {
  const { data } = await ltsApi.get("/master-missing-report", {
    params: { page, limit, ...(date && { date }), ...(search && { search }) },
  });
  return data.data;
}

export async function downloadReport(date, type = "missing") {
  const response = await ltsApi.get(`/missing-reports/download/${date}`, {
    params: { type },
    responseType: "blob",
  });
  return response.data;
}

export async function deleteMissingReport(date) {
  const { data } = await ltsApi.delete(`/missing-reports/${date}`);
  return data;
}

export async function revalidateReport(date) {
  const { data } = await ltsApi.post(`/missing-reports/revalidate/${date}`);
  return data;
}
