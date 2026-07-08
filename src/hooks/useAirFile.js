import { useMutation } from "@tanstack/react-query";
import {
  convertPlaylist,
  convertPlaylistGCS,
  uploadPTK,
  syncPTKFromSheets,
  uploadXML,
  generateEasyAir,
} from "@/api/airfileapi";

export function useConvertPlaylist(options) {
  return useMutation({
    mutationFn: ({ lang, formData }) => convertPlaylist(lang, formData),
    ...options,
  });
}

export function useConvertPlaylistGCS(options) {
  return useMutation({
    mutationFn: ({ lang, formData }) => convertPlaylistGCS(lang, formData),
    ...options,
  });
}

export function useUploadPTK(options) {
  return useMutation({
    mutationFn: (formData) => uploadPTK(formData),
    ...options,
  });
}

export function useSyncPTK(options) {
  return useMutation({
    mutationFn: () => syncPTKFromSheets(),
    ...options,
  });
}

export function useUploadXML(options) {
  return useMutation({
    mutationFn: (formData) => uploadXML(formData),
    ...options,
  });
}

export function useGenerateEasyAir(options) {
  return useMutation({
    mutationFn: (houseId) => generateEasyAir(houseId),
    ...options,
  });
}
