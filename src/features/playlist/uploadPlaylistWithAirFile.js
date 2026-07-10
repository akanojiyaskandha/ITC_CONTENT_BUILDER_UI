import { uploadPlaylist } from "@/services/playlistService";
import {
  resolvePlaylistRoute,
  convertPlaylist,
  convertPlaylistGCS,
} from "@/api/airfileapi";
import {
  parsePlaylistFilename,
  isContingencyFile,
} from "./parsePlaylistFilename";

export async function uploadPlaylistWithAirFile(
  file,
  airFileMode,
  createAirFile = true,
) {
  const { jobId } = await uploadPlaylist(file);
  const airFilePromise = generateAirFile(file, airFileMode, createAirFile);
  return { jobId, airFilePromise };
}

export async function generateAirFile(file, airFileMode, createAirFile = true) {
  if (!createAirFile) return { status: "skipped" };
  if (isContingencyFile(file.name)) return { status: "skipped" };

  const { channelName } = parsePlaylistFilename(file.name);
  const route =
    resolvePlaylistRoute(channelName) ??
    resolvePlaylistRoute(channelName.replace(/\s+/g, "_"));

  if (!route) return { status: "unmapped", channelName };

  try {
    const formData = new FormData();
    formData.append("xlsx", file);
    const convert =
      airFileMode === "local" ? convertPlaylist : convertPlaylistGCS;
    const data = await convert(route, formData);
    return { status: "success", lang: route, ...data };
  } catch (err) {
    return {
      status: "failed",
      error: err.message ?? "Air file generation failed",
    };
  }
}
