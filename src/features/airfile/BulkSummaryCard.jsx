import PropTypes from "prop-types";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function Stat({ label, value, cls = "text-zinc-100" }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-3">
      <p className={`text-xl font-bold ${cls}`}>{value}</p>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

export function BulkSummaryCard({ files, elapsed, onDownload, downloading }) {
  const success = files.filter((f) => f.status === "completed").length;
  const failed = files.filter((f) => f.status === "failed").length;
  const airx = files.filter(
    (f) => f.status === "completed" && f.result?.airxCount > 0,
  ).length;

  return (
    <div
      className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden"
      aria-label="Conversion summary"
    >
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-medium text-zinc-100">Conversion Summary</p>
        <Button
          size="sm"
          onClick={onDownload}
          disabled={!success || downloading}
          className="bg-white text-black hover:bg-zinc-200 gap-1.5 h-7 text-xs"
        >
          {downloading ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Preparing…
            </>
          ) : (
            <>
              <Download size={12} /> Download ZIP
            </>
          )}
        </Button>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-7 divide-x divide-zinc-800 border-b border-zinc-800">
        <Stat label="Total" value={files.length} />
        <Stat label="Success" value={success} cls="text-emerald-400" />
        <Stat
          label="Failed"
          value={failed}
          cls={failed ? "text-red-400" : "text-zinc-100"}
        />
        <Stat label="AIR" value={success} cls="text-blue-400" />
        <Stat label="Excel" value={success} />
        <Stat label="AIRX" value={airx} />
        <Stat label="Time" value={`${Math.round(elapsed / 1000)}s`} />
      </div>
    </div>
  );
}
