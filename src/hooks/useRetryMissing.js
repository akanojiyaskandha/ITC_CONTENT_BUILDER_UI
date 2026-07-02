import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retryMissingContent } from "@/services/retryService";

export function useRetryMissing(options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryMissingContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missing-reports"] });
    },
    ...options,
  });
}
