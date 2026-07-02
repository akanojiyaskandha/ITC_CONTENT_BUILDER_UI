import { useMutation, useQueryClient } from "@tanstack/react-query";
import { copyMissingContent } from "@/services/contentService";

export function useCopyMissing(options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: copyMissingContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
    ...options,
  });
}
