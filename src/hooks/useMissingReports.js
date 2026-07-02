import { useQuery } from "@tanstack/react-query";
import { getMissingReports } from "@/services/reportsService";

export function useMissingReports() {
  return useQuery({
    queryKey: ["missing-reports"],
    queryFn: getMissingReports,
  });
}
