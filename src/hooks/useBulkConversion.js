import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { convertPlaylistProgress, downloadPlaylistBlob, PLAYLIST_LANGUAGES } from "@/api/airfileapi";

export function detectLang(filename) {
  const lower = filename.toLowerCase();
  return PLAYLIST_LANGUAGES.find((l) => lower.includes(l.toLowerCase())) ?? null;
}

export function useBulkConversion() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const timerRef = useRef(null);

  function update(id, patch) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function addFiles(validItems) {
    setFiles((prev) => [
      ...prev,
      ...validItems.map(({ file, lang }) => ({
        id: uuidv4(), file, lang, status: "queued", progress: 0, result: null, error: null,
      })),
    ]);
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function retryFile(id) {
    update(id, { status: "queued", error: null, progress: 0 });
  }

  function retryAll() {
    setFiles((prev) =>
      prev.map((f) => f.status === "failed" ? { ...f, status: "queued", error: null, progress: 0 } : f)
    );
  }

  function clearAll() {
    setFiles([]);
    setShowSummary(false);
    setElapsed(0);
  }

  async function processOne(item) {
    update(item.id, { status: "uploading", progress: 0 });
    const fd = new FormData();
    fd.append("xlsx", item.file);
    try {
      const data = await convertPlaylistProgress(item.lang, fd, (pct) =>
        update(item.id, { progress: pct, status: pct < 100 ? "uploading" : "processing" })
      );
      update(item.id, { status: "completed", result: data, progress: 100 });
    } catch (err) {
      update(item.id, { status: "failed", error: err });
    }
  }

  async function startConversion() {
    const queued = files.filter((f) => f.status === "queued");
    if (!queued.length) return;
    setIsProcessing(true);
    setShowSummary(false);
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(Date.now() - t0), 1000);
    await Promise.allSettled(queued.map((item) => processOne(item)));
    clearInterval(timerRef.current);
    setElapsed(Date.now() - t0);
    setIsProcessing(false);
    setShowSummary(true);
  }

  async function downloadZip() {
    const done = files.filter((f) => f.status === "completed");
    if (!done.length) return;
    setDownloading(true);
    try {
      const zip  = new JSZip();
      const root = zip.folder("Playlist_Output");
      const airDir  = root.folder("AIR_Files");
      const xlsxDir = root.folder("Updated_Excel_Files");
      const airxDir = root.folder("AIRX_Files");

      for (const { result, lang } of done) {
        try {
          const airBlob = await downloadPlaylistBlob(lang, result.sessionId, "air");
          airDir.file(result.airFilename, airBlob);
        } catch (_) { /* skip if unavailable */ }

        try {
          const xlsxBlob = await downloadPlaylistBlob(lang, result.sessionId, "xlsx");
          xlsxDir.file(result.xlsxFilename, xlsxBlob);
        } catch (_) { /* skip if unavailable */ }

        if (result.airxCount > 0) {
          try {
            const airxBlob = await downloadPlaylistBlob(lang, result.sessionId, "airx");
            airxDir.file(`${result.channelName}_airx.zip`, airxBlob);
          } catch (_) { /* skip if unavailable */ }
        }
      }

      root.file(
        "Conversion_Report.json",
        JSON.stringify({
          totalFiles: files.length,
          success: done.length,
          failed: files.filter((f) => f.status === "failed").length,
          generatedAir: done.length,
          generatedExcel: done.length,
          generatedAirx: done.filter((f) => f.result?.airxCount > 0).length,
          completedAt: new Date().toISOString(),
        }, null, 2)
      );

      saveAs(await zip.generateAsync({ type: "blob" }), "Playlist_Output.zip");
    } finally {
      setDownloading(false);
    }
  }

  return {
    files, isProcessing, showSummary, elapsed, downloading,
    addFiles, removeFile, retryFile, retryAll, clearAll, startConversion, downloadZip,
  };
}
