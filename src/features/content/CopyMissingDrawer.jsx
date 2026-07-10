import PropTypes from "prop-types";
import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTime } from "luxon";
import { useChannels } from "@/hooks/useChannels";
import { useChannelDates } from "@/hooks/useChannelDates";
import { useCopyMissing } from "@/hooks/useCopyMissing";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  AlertTriangle,
  ChevronsUpDown,
  Check,
  X,
  Search,
} from "lucide-react";

const schema = yup.object({
  contentId: yup.string().required("Content ID is required"),
  channelNames: yup
    .array()
    .of(yup.string())
    .min(1, "Select at least one channel"),
  playlistDate: yup.string().required("Playlist date is required"),
});

export function CopyMissingDrawer({
  open,
  onClose,
  defaultChannelName = null,
  defaultDate = null,
}) {
  const { toast } = useToast();
  const [ambiguousFiles, setAmbiguousFiles] = useState(null);
  const [channelOpen, setChannelOpen] = useState(false);
  const [channelSearch, setChannelSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      contentId: "",
      channelNames: defaultChannelName ? [defaultChannelName] : [],
      playlistDate: defaultDate ?? "",
    },
  });

  const watchedChannels = watch("channelNames") ?? [];
  const primaryChannel = watchedChannels[0] ?? null;
  const { data: channelsData, isLoading: loadingChannels } = useChannels();
  const { data: datesData, isLoading: loadingDates } =
    useChannelDates(primaryChannel);
  const channels = channelsData?.channels ?? [];
  const dates = useMemo(() => datesData?.dates ?? [], [datesData]);

  const filteredChannels = channelSearch.trim()
    ? channels.filter((ch) =>
        ch.toLowerCase().includes(channelSearch.toLowerCase()),
      )
    : channels;

  useEffect(() => {
    if (open) {
      reset({
        contentId: "",
        channelNames: defaultChannelName ? [defaultChannelName] : [],
        playlistDate: defaultDate ?? "",
      });
      setAmbiguousFiles(null);
      setChannelOpen(false);
      setChannelSearch("");
    }
  }, [open, defaultChannelName, defaultDate, reset]);

  useEffect(() => {
    if (!open || loadingDates || dates.length === 0) return;
    const todayLabel = DateTime.now().toFormat("dd-MMM-yy");
    if (dates.includes(todayLabel)) {
      setValue("playlistDate", todayLabel);
    }
  }, [open, dates, loadingDates, setValue]);

  useEffect(() => {
    if (!channelOpen) return;
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setChannelOpen(false);
        setChannelSearch("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [channelOpen]);

  const { mutateAsync } = useCopyMissing();

  const onSubmit = async ({ contentId, channelNames, playlistDate }) => {
    setAmbiguousFiles(null);
    setIsSubmitting(true);
    try {
      const succeeded = [];
      const failed = [];

      // Copy to channels one at a time (not in parallel) so concurrent
      // requests can't race on updating the same report file.
      for (const channelName of channelNames) {
        try {
          await mutateAsync({ contentId, channelName, playlistDate });
          succeeded.push(channelName);
        } catch (err) {
          if (err?.error?.errorCode === "V004") {
            setAmbiguousFiles(Array.isArray(err.data) ? err.data : []);
          }
          failed.push({
            channelName,
            message: err?.error?.message ?? err?.message ?? "Copy failed",
          });
        }
      }

      if (failed.length === 0) {
        toast({
          title: `Copied to ${succeeded.length} channel(s)`,
          description: contentId,
        });
        reset();
        onClose();
        return;
      }

      toast({
        title:
          succeeded.length === 0
            ? "Copy failed for all channels"
            : `Copied to ${succeeded.length} of ${channelNames.length} channels`,
        description: failed
          .map((f) => `${f.channelName}: ${f.message}`)
          .join("; "),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:w-[480px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <SheetHeader>
          <SheetTitle className="text-zinc-100">
            Copy to Missing Content
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-6"
        >
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-zinc-400">
              Content ID (House ID)
            </Label>
            <Input
              {...register("contentId")}
              placeholder="e.g. PRG1791060"
              className="bg-zinc-900 border-zinc-700 text-zinc-100 font-mono"
              aria-describedby={
                errors.contentId ? "contentId-error" : undefined
              }
            />
            {errors.contentId && (
              <p id="contentId-error" className="text-xs text-red-400">
                {errors.contentId.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-zinc-400">Channel Name</Label>
            <Controller
              name="channelNames"
              control={control}
              render={({ field }) => {
                const selected = field.value ?? [];
                const allSelected =
                  channels.length > 0 && selected.length === channels.length;
                const label =
                  selected.length === 0
                    ? "Select channel(s)"
                    : selected.length === 1
                      ? selected[0]
                      : `${selected.length} channels selected`;

                const toggleChannel = (ch) => {
                  const next = selected.includes(ch)
                    ? selected.filter((c) => c !== ch)
                    : [...selected, ch];
                  field.onChange(next);
                  if (next[0] !== selected[0]) setValue("playlistDate", "");
                };

                const toggleSelectAll = () => {
                  const next = allSelected ? [] : [...channels];
                  field.onChange(next);
                  if (next[0] !== selected[0]) setValue("playlistDate", "");
                };

                return (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      disabled={loadingChannels}
                      onClick={() => setChannelOpen((o) => !o)}
                      className="h-10 w-full flex items-center justify-between gap-1 px-3 rounded-md border border-zinc-700 bg-zinc-900 text-sm text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-describedby={
                        errors.channelNames ? "channelName-error" : undefined
                      }
                    >
                      <span className="truncate text-left">
                        {loadingChannels ? "Loading…" : label}
                      </span>
                      <ChevronsUpDown
                        size={13}
                        className="shrink-0 text-zinc-500"
                      />
                    </button>

                    {channelOpen && (
                      <div className="absolute z-50 w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 shadow-lg">
                        {/* Search row */}
                        <div className="relative flex items-center border-b border-zinc-700 px-2">
                          <Search
                            size={13}
                            className="shrink-0 text-zinc-500 mr-1"
                          />
                          <input
                            autoFocus
                            value={channelSearch}
                            onChange={(e) => setChannelSearch(e.target.value)}
                            placeholder="Search channel…"
                            className="h-8 w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none pr-5"
                          />
                          {channelSearch && (
                            <button
                              type="button"
                              onClick={() => setChannelSearch("")}
                              className="absolute right-2 text-zinc-500 hover:text-zinc-200 transition-colors"
                              aria-label="Clear search"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* Select all row */}
                        {channels.length > 0 && (
                          <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800"
                          >
                            <Check
                              size={12}
                              className={
                                allSelected
                                  ? "opacity-100 shrink-0"
                                  : "opacity-0 shrink-0"
                              }
                            />
                            Select All Channels
                          </button>
                        )}

                        {/* List */}
                        <div className="max-h-48 overflow-y-auto py-1">
                          {filteredChannels.length === 0 ? (
                            <p className="text-xs text-zinc-500 py-3 text-center">
                              No channel found.
                            </p>
                          ) : (
                            filteredChannels.map((ch) => (
                              <button
                                key={ch}
                                type="button"
                                onClick={() => toggleChannel(ch)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-100 hover:bg-zinc-800 transition-colors text-left"
                              >
                                <Check
                                  size={12}
                                  className={
                                    selected.includes(ch)
                                      ? "opacity-100 shrink-0"
                                      : "opacity-0 shrink-0"
                                  }
                                />
                                {ch}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />
            {errors.channelNames && (
              <p id="channelName-error" className="text-xs text-red-400">
                {errors.channelNames.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-zinc-400">Playlist Date</Label>
            <Controller
              name="playlistDate"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!primaryChannel || loadingDates}
                >
                  <SelectTrigger
                    className="bg-zinc-900 border-zinc-700 text-zinc-100 text-sm"
                    aria-describedby={
                      errors.playlistDate ? "date-error" : undefined
                    }
                  >
                    <SelectValue
                      placeholder={
                        !primaryChannel
                          ? "Pick channel first"
                          : loadingDates
                            ? "Loading…"
                            : "Select date"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {dates.map((d) => (
                      <SelectItem
                        key={d}
                        value={d}
                        className="text-xs text-zinc-100 focus:bg-zinc-800"
                      >
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.playlistDate && (
              <p id="date-error" className="text-xs text-red-400">
                {errors.playlistDate.message}
              </p>
            )}
          </div>

          {ambiguousFiles && (
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/10">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={14}
                  className="text-amber-400 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-xs font-medium text-amber-400">
                    Multiple files found — please refine your search
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {ambiguousFiles.map((f) => (
                      <li key={f} className="text-xs text-zinc-400 font-mono">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-white text-black hover:bg-zinc-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Copying…
                </>
              ) : (
                "Copy Content"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

CopyMissingDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  defaultChannelName: PropTypes.string,
  defaultDate: PropTypes.string,
};
