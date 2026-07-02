import { useQuery } from "@tanstack/react-query";
import { getJob } from "@/services/jobsService";

const TERMINAL = ["completed", "failed"];

export function useJob(jobId) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJob(jobId),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return TERMINAL.includes(status) ? false : 4_000;
    },
  });
}
