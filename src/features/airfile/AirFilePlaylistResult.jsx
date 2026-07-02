import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, ChevronDown, ChevronUp, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getPlaylistDownloadUrl, triggerDownload } from "@/api/airfileapi";

function formatCountdown(ms) {
  if (ms <= 0) return "Expired";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AirFilePlaylistResult({ result, onDismiss }) {
  const shouldReduce = useReducedMotion();
  const [logOpen, setLogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(result.expiresAt - Date.now());
  const expired = timeLeft <= 0;

  const {
    lang,
    sessionId,
    channelName,
    dateOnly,
    airFilename,
    xlsxFilename,
    airxCount,
    lineCount,
    log,
  } = result;

  useEffect(() => {
    if (expired) return;
    const id = setInterval(
      () => setTimeLeft(result.expiresAt - Date.now()),
      1000,
    );
    return () => clearInterval(id);
  }, [result.expiresAt, expired]);

  const DOWNLOADS = [
    { type: "air", label: ".air File", filename: airFilename },
    { type: "xlsx", label: ".xlsx Updated", filename: xlsxFilename },
    ...(airxCount > 0
      ? [
          {
            type: "airx",
            label: `.airx ZIP (${airxCount})`,
            filename: `${channelName}_airx.zip`,
          },
        ]
      : []),
    {
      type: "all",
      label: "Download ALL ZIP",
      filename: `${channelName}_all.zip`,
    },
  ];

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden"
      aria-label="Playlist processing result"
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
            Success
          </Badge>
          <span className="text-sm font-medium text-zinc-100">
            {channelName} — {dateOnly}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 text-xs ${expired ? "text-red-400" : "text-zinc-500"}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <Clock size={12} />
            {expired
              ? "Session expired — re-upload to regenerate"
              : `Session expires in ${formatCountdown(timeLeft)}`}
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss result"
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 divide-x divide-zinc-800 border-b border-zinc-800">
        {[
          ["Lines", lineCount],
          ["AIRX Files", airxCount],
          ["Language", lang],
        ].map(([label, val]) => (
          <div key={label} className="px-5 py-3 text-center">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-sm font-semibold text-zinc-100 mt-0.5">{val}</p>
          </div>
        ))}
      </div>

      {/* Download buttons */}
      <div className="px-5 py-4 flex flex-wrap gap-2 border-b border-zinc-800">
        {DOWNLOADS.map(({ type, label }) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            disabled={expired}
            onClick={() =>
              triggerDownload(getPlaylistDownloadUrl(lang, sessionId, type))
            }
            className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 gap-1.5"
          >
            <Download size={13} />
            {label}
          </Button>
        ))}
      </div>

      {/* Processing log */}
      {log?.length > 0 && (
        <Collapsible open={logOpen} onOpenChange={setLogOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full px-5 py-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              <span className="font-medium uppercase tracking-wide">
                Processing Log ({log.length} entries)
              </span>
              {logOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Separator className="bg-zinc-800" />
            <ScrollArea className="h-48 px-5 py-3">
              <div className="space-y-0.5">
                {log.map((line, i) => (
                  <p
                    key={i}
                    className="text-xs font-mono text-zinc-400 leading-5"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      )}
    </motion.div>
  );
}
