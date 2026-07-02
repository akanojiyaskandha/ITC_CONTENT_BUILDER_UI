import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { FileSpreadsheet, X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/utils/formatters";

const STATUS_BADGE = {
  queued: "bg-zinc-800 text-zinc-400 border-zinc-700",
  uploading: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

const LANG_COLOR = {
  English: "bg-blue-500/10 text-blue-400",
  Hindi: "bg-orange-500/10 text-orange-400",
  Kannada: "bg-purple-500/10 text-purple-400",
  Tamil: "bg-red-500/10 text-red-400",
  Telugu: "bg-emerald-500/10 text-emerald-400",
};

export function BulkFileItem({ item, onRemove, onRetry }) {
  const { id, file, lang, status, progress, result, error } = item;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-1.5 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900"
    >
      <div className="flex items-center gap-3">
        <FileSpreadsheet size={15} className="text-zinc-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-200 truncate">
            {file.name}
          </p>
          <p className="text-xs text-zinc-600">{formatFileSize(file.size)}</p>
        </div>
        {lang && (
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
              LANG_COLOR[lang],
            )}
          >
            {lang}
          </span>
        )}
        <Badge
          className={cn(
            "text-[10px] shrink-0 capitalize",
            STATUS_BADGE[status] ?? STATUS_BADGE.queued,
          )}
        >
          {status}
        </Badge>
        {status === "failed" && (
          <button
            onClick={() => onRetry(id)}
            aria-label="Retry file"
            className="text-zinc-600 hover:text-amber-400 transition-colors shrink-0"
          >
            <RotateCcw size={13} />
          </button>
        )}
        {status === "queued" && (
          <button
            onClick={() => onRemove(id)}
            aria-label="Remove file"
            className="text-zinc-600 hover:text-zinc-300 transition-colors shrink-0"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {(status === "uploading" || status === "processing") && (
        <Progress
          value={status === "processing" ? 100 : progress}
          className="h-0.5 bg-zinc-800"
        />
      )}
      {status === "completed" && result && (
        <p className="text-[10px] text-zinc-500 font-mono pl-6">
          {result.channelName} — {result.dateOnly} · {result.lineCount} lines ·{" "}
          {result.airxCount} AIRX
        </p>
      )}
      {status === "failed" && error && (
        <p className="text-[10px] text-red-400 pl-6 truncate">
          {error?.message ?? "Conversion failed"}
        </p>
      )}
    </motion.div>
  );
}
