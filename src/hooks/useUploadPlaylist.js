import { useMutation } from "@tanstack/react-query";
import { uploadPlaylist } from "@/services/playlistService";

export function useUploadPlaylist(options) {
  return useMutation({
    mutationFn: uploadPlaylist,
    ...options,
  });
}
