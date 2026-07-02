import { useMutation } from "@tanstack/react-query";
import { revalidateReport } from "@/services/reportsService";

export function useRevalidateReport() {
  return useMutation({
    mutationFn: (date) => revalidateReport(date),
  });
}
