import { useState } from "react";
import PropTypes from "prop-types";
import { Play, X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useGenerateEasyAir } from "@/hooks/useAirFile";
import { getEasyAirDownloadUrl, triggerDownload } from "@/api/airfileapi";

function HouseIdTagInput({ ids, onAdd, onRemove, onClear, disabled }) {
  const [value, setValue] = useState("");

  function commit() {
    const id = value.trim().toUpperCase();
    if (id && !ids.includes(id)) onAdd(id);
    setValue("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !value && ids.length > 0) {
      onRemove(ids[ids.length - 1]);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 min-h-10 px-2.5 py-1.5 rounded-lg border transition-colors",
        disabled
          ? "border-zinc-800 bg-zinc-900 opacity-50 cursor-not-allowed"
          : "border-zinc-700 bg-zinc-950 focus-within:border-zinc-500",
      )}
    >
      {ids.map((id) => (
        <span
          key={id}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-xs text-zinc-200"
        >
          {id}
          {!disabled && (
            <button
              onClick={() => onRemove(id)}
              aria-label={`Remove ${id}`}
              className="text-zinc-500 hover:text-zinc-200"
            >
              <X size={11} />
            </button>
          )}
        </span>
      ))}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        disabled={disabled}
        placeholder={ids.length ? "" : "Type a House ID and press Enter…"}
        className="flex-1 min-w-[140px] bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed"
        aria-label="Add House ID"
      />
      {ids.length > 0 && !disabled && (
        <button
          onClick={onClear}
          aria-label="Clear all House IDs"
          className="text-zinc-600 hover:text-zinc-300 ml-1"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

HouseIdTagInput.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

function EasyAirResultCard({ result }) {
  const { houseId, ok } = result;

  if (!ok) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-sm font-medium text-red-400">{houseId} — failed</p>
        <p className="text-xs text-zinc-500 mt-1">
          {result.err?.error ?? result.err?.message ?? "Unknown error"}
        </p>
      </div>
    );
  }

  const { title, channels, files } = result.data;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-sm font-medium text-zinc-100">{houseId}</p>
        {title && <p className="text-xs text-zinc-500 mt-0.5">{title}</p>}
        {channels?.length > 0 && (
          <p className="text-[11px] text-zinc-600 mt-0.5">{channels.join(", ")}</p>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2">
        {files.map((f) => (
          <div
            key={f.filename}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800"
          >
            <div className="min-w-0">
              <p className="text-xs text-zinc-300 truncate">{f.filename}</p>
              <p className="text-[10px] text-zinc-600">
                {f.channel} · {f.duration}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerDownload(getEasyAirDownloadUrl(f.filename))}
              className="border-zinc-700 text-zinc-300 hover:text-zinc-100 gap-1.5 h-7 text-xs shrink-0"
            >
              <Download size={12} />
              Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

EasyAirResultCard.propTypes = {
  result: PropTypes.shape({
    houseId: PropTypes.string.isRequired,
    ok: PropTypes.bool.isRequired,
    data: PropTypes.object,
    err: PropTypes.object,
  }).isRequired,
};

export function AirFileEasyAirTab() {
  const { toast } = useToast();
  const [houseIds, setHouseIds] = useState([]);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutateAsync: generate } = useGenerateEasyAir();

  function addId(id) {
    setHouseIds((prev) => [...prev, id]);
  }
  function removeId(id) {
    setHouseIds((prev) => prev.filter((x) => x !== id));
  }
  function clearIds() {
    setHouseIds([]);
  }

  async function handleGenerate() {
    if (houseIds.length === 0) return;
    setIsProcessing(true);

    const outcomes = await Promise.all(
      houseIds.map((houseId) =>
        generate(houseId)
          .then((data) => ({ ok: true, houseId, data }))
          .catch((err) => ({ ok: false, houseId, err })),
      ),
    );

    setResults((prev) => [...outcomes, ...prev]);

    const succeeded = outcomes.filter((o) => o.ok);
    const failed = outcomes.filter((o) => !o.ok);

    if (succeeded.length) {
      toast({
        title: "Air files generated",
        description: succeeded.map((o) => o.houseId).join(", "),
      });
    }
    if (failed.length) {
      toast({
        title: "Some House IDs failed",
        description: failed
          .map((o) => `${o.houseId}: ${o.err?.error ?? o.err?.message ?? "Unknown error"}`)
          .join("; "),
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* LEFT — form */}
      <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            House ID(s)
          </p>
          <HouseIdTagInput
            ids={houseIds}
            onAdd={addId}
            onRemove={removeId}
            onClear={clearIds}
            disabled={isProcessing}
          />
          <p className="text-xs text-zinc-600">
            Type a House ID and press Enter or comma to add it — you can queue
            multiple.
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={houseIds.length === 0 || isProcessing}
          className="bg-white text-black hover:bg-zinc-200 gap-1.5 self-start"
        >
          {isProcessing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Play size={14} />
              Generate Air Files
              {houseIds.length > 1 ? ` (${houseIds.length})` : ""}
            </>
          )}
        </Button>
      </div>

      {/* RIGHT — output */}
      <div className="flex flex-col gap-3 min-h-[200px]">
        {results.length > 0 ? (
          results.map((r, i) => (
            <EasyAirResultCard key={`${r.houseId}-${i}`} result={r} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] rounded-lg border border-dashed border-zinc-800 text-zinc-600 text-sm gap-2">
            <Play size={20} className="opacity-30" />
            <span>Generated files will appear here</span>
          </div>
        )}
      </div>
    </div>
  );
}
