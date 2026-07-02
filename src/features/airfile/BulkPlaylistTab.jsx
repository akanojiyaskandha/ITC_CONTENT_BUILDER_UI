import { useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Upload, Play, RotateCcw, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useBulkConversion, detectLang } from "@/hooks/useBulkConversion";
import { BulkFileItem } from "./BulkFileItem";
import { BulkSummaryCard } from "./BulkSummaryCard";

const MAX_FILES = 20;
const MAX_MB = 10;

function validate(file, existingNames) {
  if (!file.name.toLowerCase().endsWith(".xlsx")) return "Must be .xlsx";
  if (!detectLang(file.name))
    return "Cannot detect language — filename must contain: English, Hindi, Kannada, Tamil, or Telugu";
  if (file.size > MAX_MB * 1024 * 1024) return `Exceeds ${MAX_MB} MB`;
  if (existingNames.includes(file.name)) return "Already added";
  return null;
}

export function BulkPlaylistTab() {
  const { toast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  const {
    files,
    isProcessing,
    showSummary,
    elapsed,
    downloading,
    addFiles,
    removeFile,
    retryFile,
    retryAll,
    clearAll,
    startConversion,
    downloadZip,
  } = useBulkConversion();

  function handleRaw(rawFiles) {
    const existing = files.map((f) => f.file.name);
    const errs = [];
    const valid = [];

    for (const f of Array.from(rawFiles)) {
      if (files.length + valid.length >= MAX_FILES) {
        errs.push(`Max ${MAX_FILES} files reached`);
        break;
      }
      const err = validate(f, [...existing, ...valid.map((v) => v.file.name)]);
      if (err) errs.push(`${f.name}: ${err}`);
      else valid.push({ file: f, lang: detectLang(f.name) });
    }

    setErrors(errs);
    if (valid.length) addFiles(valid);
  }

  async function handleDownload() {
    try {
      await downloadZip();
      toast({ title: "Playlist_Output.zip downloaded" });
    } catch (err) {
      toast({
        title: "Download failed",
        description: err?.message,
        variant: "destructive",
      });
    }
  }

  async function handleStart() {
    await startConversion();
    const done = files.filter((f) => f.status === "completed").length;
    const failed = files.filter((f) => f.status === "failed").length;
    toast({
      title: "Batch complete",
      description:
        failed === 0
          ? `All ${done} files converted`
          : `${done} succeeded · ${failed} failed`,
      variant: failed > 0 ? "destructive" : "default",
    });
  }

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const failedCount = files.filter((f) => f.status === "failed").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isProcessing) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!isProcessing) handleRaw(e.dataTransfer.files);
        }}
        onClick={() => !isProcessing && inputRef.current?.click()}
        onKeyDown={(e) =>
          e.key === "Enter" && !isProcessing && inputRef.current?.click()
        }
        role="button"
        tabIndex={isProcessing ? -1 : 0}
        aria-label="Add playlist files for bulk conversion"
        aria-disabled={isProcessing}
        className={cn(
          "flex flex-col items-center gap-3 p-10 rounded-lg border-2 border-dashed transition-colors",
          isProcessing
            ? "opacity-50 cursor-not-allowed border-zinc-800 bg-zinc-900"
            : dragging
              ? "border-zinc-500 bg-zinc-800/50 cursor-copy"
              : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/30 cursor-pointer",
        )}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800">
          <Upload size={18} className="text-zinc-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-300">
            Drop files here or{" "}
            <span className="text-zinc-100 underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            .xlsx only · filename must contain language name · max {MAX_FILES}{" "}
            files
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          multiple
          onChange={(e) => {
            handleRaw(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
          aria-label="Select playlist files"
        />
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <ul
          className="flex flex-col gap-1 p-3 rounded-md bg-red-500/10 border border-red-500/20"
          role="alert"
        >
          {errors.map((err, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-red-400">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              {err}
            </li>
          ))}
        </ul>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ScrollArea className="max-h-80">
          <div className="flex flex-col gap-2 pr-3">
            <AnimatePresence initial={false}>
              {files.map((item) => (
                <BulkFileItem
                  key={item.id}
                  item={item}
                  onRemove={removeFile}
                  onRetry={retryFile}
                />
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {/* Action bar */}
      {files.length > 0 && !isProcessing && (
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={handleStart}
            disabled={!queuedCount}
            className="bg-white text-black hover:bg-zinc-200 gap-1.5"
          >
            <Play size={14} />
            {queuedCount > 1
              ? `Convert ${queuedCount} Files`
              : "Start Conversion"}
          </Button>
          {failedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={retryAll}
              className="border-zinc-700 text-zinc-400 hover:text-zinc-100 gap-1.5"
            >
              <RotateCcw size={13} /> Retry Failed ({failedCount})
            </Button>
          )}
          <button
            onClick={clearAll}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors ml-auto flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear All
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Converting{" "}
          {
            files.filter(
              (f) => f.status === "completed" || f.status === "failed",
            ).length
          }{" "}
          / {files.length}…
        </div>
      )}

      {/* Summary */}
      {showSummary && (
        <BulkSummaryCard
          files={files}
          elapsed={elapsed}
          onDownload={handleDownload}
          downloading={downloading}
        />
      )}
    </div>
  );
}
