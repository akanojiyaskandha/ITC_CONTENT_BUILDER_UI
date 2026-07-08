import { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Play,
  StopCircle,
  FileSpreadsheet,
  X,
  Upload,
  AlertCircle,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useConvertPlaylist, useConvertPlaylistGCS } from "@/hooks/useAirFile";
import { useChannels } from "@/hooks/useChannels";
import { resolvePlaylistRoute } from "@/api/airfileapi";
import { validateFile } from "./BatchUploadZone";
import { BatchResultsList } from "./BatchResultsList";

const SESSION_TTL_MS = 30 * 60 * 1000;

const STATUS_STYLE = {
  queued: "text-zinc-400 border-zinc-700",
  processing: "text-blue-400 border-blue-500/40",
  success: "text-emerald-400 border-emerald-500/40",
  failed: "text-red-400 border-red-500/40",
};

function parseFileMeta(name) {
  const stem = name.replace(/\.xlsx$/i, "");
  const parts = stem.split("_");
  const date = parts.at(-1);
  const channel = parts.slice(0, -1).join("_");
  return { channel, date };
}

function LanguageMultiSelect({
  options,
  loading,
  selected,
  onToggle,
  disabled,
}) {
  const [open, setOpen] = useState(false);

  const mappedOptions = options.filter((l) => resolvePlaylistRoute(l));

  const label =
    selected.length === 0 ? "Select language(s)…" : selected.join(", ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className="w-full justify-between border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100 font-normal"
        >
          <span className="truncate">
            {loading ? "Loading channels…" : label}
          </span>
          <ChevronsUpDown size={14} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 bg-zinc-950 border-zinc-800">
        <Command className="bg-zinc-950">
          <CommandInput
            placeholder="Search channel…"
            className="text-zinc-200"
          />
          <CommandList>
            <CommandEmpty className="text-zinc-500">
              No channel found.
            </CommandEmpty>
            <CommandGroup>
              {mappedOptions.map((l) => {
                const checked = selected.includes(l);
                return (
                  <CommandItem
                    key={l}
                    value={l}
                    onSelect={() => onToggle(l)}
                    className="gap-2 text-zinc-300 aria-selected:bg-zinc-800 aria-selected:text-zinc-100"
                  >
                    <Checkbox checked={checked} className="shrink-0" />
                    <span className="truncate">{l}</span>
                    {checked && (
                      <Check size={14} className="ml-auto shrink-0" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

LanguageMultiSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

function LanguageFileSlot({ lang, entry, onPick, onRemove, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [dropError, setDropError] = useState(null);
  const inputRef = useRef(null);

  function pick(rawFile) {
    const err = validateFile(rawFile, []);
    if (err) {
      setDropError(err);
      return;
    }
    setDropError(null);
    onPick(lang, rawFile);
  }

  const meta = entry ? parseFileMeta(entry.file.name) : null;
  const locked = disabled || entry?.status === "processing";

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-zinc-400">{lang}</p>

      {!entry ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!locked) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (locked) return;
            const f = e.dataTransfer.files[0];
            if (f) pick(f);
          }}
          onClick={() => !locked && inputRef.current?.click()}
          onKeyDown={(e) =>
            e.key === "Enter" && !locked && inputRef.current?.click()
          }
          role="button"
          tabIndex={locked ? -1 : 0}
          aria-label={`Select .xlsx for ${lang}`}
          aria-disabled={locked}
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed transition-colors text-xs",
            locked
              ? "border-zinc-800 opacity-50 cursor-not-allowed text-zinc-600"
              : dragOver
                ? "border-zinc-500 bg-zinc-800/50 cursor-copy text-zinc-300"
                : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30 cursor-pointer text-zinc-500",
          )}
        >
          <Upload size={13} className="shrink-0" />
          <span>
            Drop .xlsx for {lang} or{" "}
            <span className="text-zinc-200 underline underline-offset-2">
              browse
            </span>
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pick(f);
              e.target.value = "";
            }}
            className="sr-only"
            aria-label={`Select .xlsx for ${lang}`}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-800 bg-zinc-950">
          <FileSpreadsheet size={15} className="text-zinc-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-200 truncate">
              {entry.file.name}
            </p>
            <p className="text-[11px] text-zinc-500">
              {meta.channel} — {meta.date}
            </p>
          </div>
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize",
              STATUS_STYLE[entry.status],
            )}
          >
            {entry.status}
          </span>
          {!locked && (
            <button
              onClick={() => onRemove(lang)}
              aria-label={`Remove file for ${lang}`}
              className="text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {dropError && (
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-red-500/10 border border-red-500/20"
          role="alert"
        >
          <AlertCircle size={12} className="text-red-400 shrink-0" />
          <span className="text-[11px] text-red-400">{dropError}</span>
        </div>
      )}
    </div>
  );
}

LanguageFileSlot.propTypes = {
  lang: PropTypes.string.isRequired,
  entry: PropTypes.shape({
    file: PropTypes.object.isRequired,
    status: PropTypes.string.isRequired,
    error: PropTypes.any,
  }),
  onPick: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

LanguageFileSlot.defaultProps = {
  entry: null,
};

export function AirFilePlaylistTab() {
  const { toast } = useToast();
  const { data: channelsData, isLoading: channelsLoading } = useChannels({
    page: 1,
    limit: 50,
  });
  const channels = channelsData?.channels ?? [];
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [useGCS, setUseGCS] = useState(false);
  const [filesByLang, setFilesByLang] = useState({}); // { [lang]: { file, status, error } }
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const cancelRef = useRef(false);

  const { mutateAsync: convertLocal } = useConvertPlaylist();
  const { mutateAsync: convertGCS } = useConvertPlaylistGCS();

  function toggleLang(l) {
    if (isProcessing) return;
    setSelectedLangs((prev) => {
      if (prev.includes(l)) {
        setFilesByLang((f) => {
          const next = { ...f };
          delete next[l];
          return next;
        });
        return prev.filter((x) => x !== l);
      }
      return [...prev, l];
    });
  }

  function pickFileForLang(lang, rawFile) {
    setFilesByLang((prev) => ({
      ...prev,
      [lang]: { file: rawFile, status: "queued", error: null },
    }));
  }

  function removeFileForLang(lang) {
    setFilesByLang((prev) => {
      const next = { ...prev };
      delete next[lang];
      return next;
    });
  }

  const allReady =
    selectedLangs.length > 0 &&
    selectedLangs.every((l) => filesByLang[l]?.status === "queued");

  async function handleProcess() {
    if (!allReady) return;
    cancelRef.current = false;
    setIsProcessing(true);
    setFilesByLang((prev) => {
      const next = { ...prev };
      selectedLangs.forEach((l) => {
        next[l] = { ...next[l], status: "processing" };
      });
      return next;
    });

    const convert = useGCS ? convertLocal : convertGCS;
    const outcomes = await Promise.all(
      selectedLangs.map((channel) => {
        const route = resolvePlaylistRoute(channel);
        if (!route) {
          return Promise.resolve({
            ok: false,
            channel,
            err: { message: `No playlist route configured for "${channel}"` },
          });
        }
        const fd = new FormData();
        fd.append("xlsx", filesByLang[channel].file);
        return convert({ lang: route, formData: fd })
          .then((data) => ({ ok: true, channel, lang: route, data }))
          .catch((err) => ({ ok: false, channel, err }));
      }),
    );

    const succeeded = outcomes.filter((o) => o.ok);
    const failed = outcomes.filter((o) => !o.ok);

    if (succeeded.length) {
      setResults((prev) => [
        ...prev,
        ...succeeded.map(({ lang, data }) => ({
          ...data,
          expiresAt: Date.now() + SESSION_TTL_MS,
          lang,
        })),
      ]);
    }

    setFilesByLang((prev) => {
      const next = { ...prev };
      outcomes.forEach(({ channel, ok, err }) => {
        next[channel] = {
          ...next[channel],
          status: ok ? "success" : "failed",
          error: ok ? null : err,
        };
      });
      return next;
    });

    if (succeeded.length) {
      toast({
        title: "Playlist processed",
        description: succeeded.map((o) => o.channel).join(", "),
      });
    }
    if (failed.length) {
      toast({
        title: "Some languages failed",
        description: failed
          .map((o) => `${o.channel}: ${o.err?.message ?? "Unknown error"}`)
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
        {/* Language */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            Language
          </p>
          <LanguageMultiSelect
            options={channels}
            loading={channelsLoading}
            selected={selectedLangs}
            onToggle={toggleLang}
            disabled={isProcessing}
          />
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
              { value: false, label: "Upload to GCS" },
              { value: true, label: "Local Processing" },
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

        {/* Per-language file slots */}
        {selectedLangs.length === 0 ? (
          <p className="text-xs text-zinc-600 py-4 text-center">
            Select one or more languages above to upload their playlists
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedLangs.map((lang) => (
              <LanguageFileSlot
                key={lang}
                lang={lang}
                entry={filesByLang[lang]}
                onPick={pickFileForLang}
                onRemove={removeFileForLang}
                disabled={isProcessing}
              />
            ))}
          </div>
        )}

        {/* Action */}
        {selectedLangs.length > 0 && (
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
                disabled={!allReady}
                className="bg-white text-black hover:bg-zinc-200 gap-1.5"
              >
                <Play size={14} />
                Process Playlist
                {selectedLangs.length > 1 ? ` (${selectedLangs.length})` : ""}
              </Button>
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
              setFilesByLang({});
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
