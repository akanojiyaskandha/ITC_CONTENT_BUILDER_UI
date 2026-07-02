import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/services/statsService";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 30_000,
  });
}
