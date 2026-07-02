import { useQuery } from "@tanstack/react-query";
import { getMasterReport } from "@/services/reportsService";

export function useMasterReport(params) {
  return useQuery({
    queryKey: ["master-report", params],
    queryFn: () => getMasterReport(params),
  });
}
