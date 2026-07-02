import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileSpreadsheet,
  X,
  Clock,
  Loader2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  queued: {
    icon: Clock,
    cls: "text-zinc-500",
    badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
  processing: {
    icon: Loader2,
    cls: "text-amber-400 animate-spin",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  failed: {
    icon: XCircle,
    cls: "text-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

function parseFilename(name) {
  const base = name.replace(/\.xlsx$/i, "");
  const m = base.match(/^(.+?)_(\d{2}-[A-Za-z]{3}-\d{2})$/);
  return m ? { channel: m[1], date: m[2] } : { channel: base, date: null };
}

export function BatchFileQueue({ queue, onRemove, onRetry }) {
  const total = queue.length;
  const done = queue.filter(
    (f) => f.status === "success" || f.status === "failed",
  ).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const visible = queue.filter((f) => f.status !== "success");

  if (!total) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          Queue — {done}/{total} processed
        </p>
        <span className="text-xs text-zinc-600">{pct}%</span>
      </div>
      <Progress value={pct} className="h-1 bg-zinc-800" />

      <AnimatePresence initial={false}>
        {visible.map((item) => {
          const { channel, date } = parseFilename(item.file.name);
          const {
            icon: Icon,
            cls,
            badge,
          } = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.queued;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 mt-1"
            >
              <FileSpreadsheet size={15} className="text-zinc-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">
                  {item.file.name}
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  {channel}
                  {date ? ` — ${date}` : ""}
                </p>
                {item.status === "failed" && (
                  <p className="text-xs text-red-400 truncate mt-0.5">
                    {item.error?.message ?? "Processing failed"}
                  </p>
                )}
              </div>
              <Badge className={cn("text-[10px] shrink-0 capitalize", badge)}>
                {item.status}
              </Badge>
              <Icon size={14} className={cn("shrink-0", cls)} />
              {item.status === "queued" && (
                <button
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors shrink-0"
                >
                  <X size={13} />
                </button>
              )}
              {item.status === "failed" && onRetry && (
                <button
                  onClick={() => onRetry(item.id)}
                  aria-label={`Retry ${item.file.name}`}
                  className="text-zinc-600 hover:text-amber-400 transition-colors shrink-0"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
