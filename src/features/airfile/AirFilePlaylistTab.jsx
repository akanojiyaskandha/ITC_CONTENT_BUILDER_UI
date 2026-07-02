import { useState, useRef } from "react";
import {
  Play,
  StopCircle,
  FileSpreadsheet,
  X,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PLAYLIST_LANGUAGES } from "@/api/airfileapi";
import { useConvertPlaylist, useConvertPlaylistGCS } from "@/hooks/useAirFile";
import { validateFile } from "./BatchUploadZone";
import { BatchResultsList } from "./BatchResultsList";

const SESSION_TTL_MS = 30 * 60 * 1000;

function parseFileMeta(name) {
  const stem = name.replace(/\.xlsx$/i, "");
  const parts = stem.split("_");
  const date = parts.at(-1);
  const channel = parts.slice(0, -1).join("_");
  return { channel, date };
}

export function AirFilePlaylistTab() {
  const { toast } = useToast();
  const [lang, setLang] = useState("English");
  const [useGCS, setUseGCS] = useState(false);
  const [file, setFile] = useState(null); // { file: File, status, error }
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dropError, setDropError] = useState(null);
  const inputRef = useRef(null);
  const cancelRef = useRef(false);

  const { mutateAsync: convertLocal } = useConvertPlaylist();
  const { mutateAsync: convertGCS } = useConvertPlaylistGCS();

  function pickFile(rawFile) {
    const err = validateFile(rawFile, []);
    if (err) {
      setDropError(err);
      return;
    }
    setDropError(null);
    setFile({ file: rawFile, status: "queued", error: null });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (isProcessing) return;
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }

  function handleChange(e) {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
    e.target.value = "";
  }

  async function handleProcess() {
    if (!file || file.status !== "queued") return;
    cancelRef.current = false;
    setIsProcessing(true);
    setFile((prev) => ({ ...prev, status: "processing" }));

    const fd = new FormData();
    fd.append("xlsx", file.file);

    try {
      const data = await (useGCS ? convertGCS : convertLocal)({
        lang,
        formData: fd,
      });
      setFile((prev) => ({ ...prev, status: "success" }));
      setResults((prev) => [
        ...prev,
        { ...data, expiresAt: Date.now() + SESSION_TTL_MS, lang },
      ]);
      toast({ title: "Playlist processed", description: file.file.name });
    } catch (err) {
      setFile((prev) => ({ ...prev, status: "failed", error: err }));
      toast({
        title: "Processing failed",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const meta = file ? parseFileMeta(file.file.name) : null;

  const statusStyle = {
    queued: "text-zinc-400 border-zinc-700",
    processing: "text-blue-400 border-blue-500/40",
    success: "text-emerald-400 border-emerald-500/40",
    failed: "text-red-400 border-red-500/40",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* LEFT — form */}
      <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col gap-5">
        {/* Language */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            Language
          </p>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Select language"
          >
            {PLAYLIST_LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                disabled={isProcessing}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  lang === l
                    ? "bg-white text-black"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-100",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            Mode
          </p>
          <div
            className="flex gap-0.5 p-0.5 rounded-md bg-zinc-950 border border-zinc-800"
            role="group"
            aria-label="Select process mode"
          >
            {[
              { value: false, label: "Local Processing" },
              { value: true, label: "Upload to GCS" },
            ].map(({ value, label }) => (
              <button
                key={label}
                onClick={() => !isProcessing && setUseGCS(value)}
                aria-pressed={useGCS === value}
                disabled={isProcessing}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  useGCS === value
                    ? "bg-zinc-700 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone — hidden when file is selected */}
        {!file && (
          <div className="flex flex-col gap-2">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!isProcessing) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !isProcessing && inputRef.current?.click()}
              onKeyDown={(e) =>
                e.key === "Enter" && !isProcessing && inputRef.current?.click()
              }
              role="button"
              tabIndex={isProcessing ? -1 : 0}
              aria-label="Select a playlist file — drop or click to browse"
              aria-disabled={isProcessing}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-colors",
                isProcessing
                  ? "border-zinc-800 opacity-50 cursor-not-allowed"
                  : dragOver
                    ? "border-zinc-500 bg-zinc-800/50 cursor-copy"
                    : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30 cursor-pointer",
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800">
                <Upload size={18} className="text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-300">
                  Drop file here or{" "}
                  <span className="text-zinc-100 underline underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Single .xlsx — e.g. SS1_HD_LTS_25-Jun-26.xlsx
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                onChange={handleChange}
                className="sr-only"
                aria-label="Select playlist file"
              />
            </div>

            {dropError && (
              <div
                className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20"
                role="alert"
              >
                <AlertCircle size={13} className="text-red-400 shrink-0" />
                <span className="text-xs text-red-400">{dropError}</span>
              </div>
            )}
          </div>
        )}

        {/* Selected file row */}
        {file && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950">
            <FileSpreadsheet size={16} className="text-zinc-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {file.file.name}
              </p>
              <p className="text-xs text-zinc-500">
                {meta.channel} — {meta.date}
              </p>
            </div>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded border capitalize",
                statusStyle[file.status],
              )}
            >
              {file.status}
            </span>
            {!isProcessing && (
              <button
                onClick={() => {
                  setFile(null);
                  setDropError(null);
                }}
                aria-label="Remove file"
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Action */}
        {file && (
          <div className="flex items-center gap-3">
            {isProcessing ? (
              <Button
                onClick={() => {
                  cancelRef.current = true;
                }}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5"
              >
                <StopCircle size={14} />
                Cancel
              </Button>
            ) : (
              <Button
                onClick={handleProcess}
                disabled={file.status !== "queued"}
                className="bg-white text-black hover:bg-zinc-200 gap-1.5"
              >
                <Play size={14} />
                Process Playlist
              </Button>
            )}
            {!isProcessing && file.status !== "queued" && (
              <button
                onClick={() =>
                  setFile((f) => ({ ...f, status: "queued", error: null }))
                }
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT — output */}
      <div className="flex flex-col gap-4 min-h-[200px]">
        {results.length > 0 ? (
          <BatchResultsList
            results={results}
            onDismiss={(sid) =>
              setResults((r) => r.filter((x) => x.sessionId !== sid))
            }
            onClearAll={() => {
              setResults([]);
              setFile(null);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] rounded-lg border border-dashed border-zinc-800 text-zinc-600 text-sm gap-2">
            <Play size={20} className="opacity-30" />
            <span>Output will appear here after processing</span>
          </div>
        )}
      </div>
    </div>
  );
}
