import { useMutation } from "@tanstack/react-query";
import { uploadAsrun } from "@/services/asrunService";

export function useUploadAsrun(options) {
  return useMutation({
    mutationFn: uploadAsrun,
    ...options,
  });
}
