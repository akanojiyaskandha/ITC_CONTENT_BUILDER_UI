import PropTypes from "prop-types";
import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Download, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AirFilePlaylistResult } from "./AirFilePlaylistResult";
import { downloadPlaylistBlob } from "@/api/airfileapi";

export function BatchResultsList({ results, onDismiss, onClearAll }) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const downloadable = results.filter((r) => Date.now() < r.expiresAt);

  async function handleDownloadAll() {
    if (!downloadable.length) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (const r of downloadable) {
        const blob = await downloadPlaylistBlob(r.lang, r.sessionId, "all");
        zip.file(`${r.channelName}_${r.dateOnly}.zip`, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const stamp = new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
        .replace(/ /g, "-");
      saveAs(content, `batch_playlists_${stamp}.zip`);
      toast({
        title: "Batch ZIP ready",
        description: `${downloadable.length} playlists bundled into one ZIP`,
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: err?.message ?? "Check API connection and try again",
        variant: "destructive",
      });
    }
    setDownloading(false);
  }

  if (!results.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Batch action bar */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Package size={15} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-100">
            {results.length} Result{results.length !== 1 ? "s" : ""}
          </span>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
            {results.length} Success
          </Badge>
          {downloadable.length < results.length && (
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
              {results.length - downloadable.length} Expired
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {downloadable.length > 1 && (
            <Button
              size="sm"
              onClick={handleDownloadAll}
              disabled={downloading}
              className="bg-white text-black hover:bg-zinc-200 gap-1.5 h-7 text-xs"
            >
              <Download size={12} />
              {downloading
                ? "Zipping…"
                : `Download All ZIP (${downloadable.length})`}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearAll}
            className="text-zinc-500 hover:text-red-400 gap-1 h-7 text-xs"
          >
            <Trash2 size={12} />
            Clear All
          </Button>
        </div>
      </div>

      {/* Individual result cards */}
      <div className="flex flex-col gap-3">
        {results.map((result) => (
          <AirFilePlaylistResult
            key={result.sessionId}
            result={result}
            onDismiss={() => onDismiss(result.sessionId)}
          />
        ))}
      </div>
    </div>
  );
}
