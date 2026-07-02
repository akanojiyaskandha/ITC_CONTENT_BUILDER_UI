import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMissingReport } from "@/services/reportsService";

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date) => deleteMissingReport(date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["missing-reports"] }),
  });
}
