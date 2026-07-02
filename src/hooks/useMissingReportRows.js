import { useQuery } from "@tanstack/react-query";
import { getMissingReportRows } from "@/services/reportsService";

export function useMissingReportRows(params) {
  return useQuery({
    queryKey: ["missing-report-rows", params],
    queryFn: () => getMissingReportRows(params),
    enabled: Boolean(params?.channel && params?.date),
  });
}
