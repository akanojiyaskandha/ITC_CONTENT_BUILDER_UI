import { useState } from "react";
import PropTypes from "prop-types";
import { Trash2, CopyPlus, ChevronsUpDown, Check, X } from "lucide-react";
import { useChannels } from "@/hooks/useChannels";
import { useChannelDates } from "@/hooks/useChannelDates";
import { useDeleteDateFolder } from "@/hooks/useDeleteDateFolder";
import { useToast } from "@/hooks/use-toast";
import { FOLDER_TYPES } from "@/utils/constants";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CopyMissingDrawer } from "./CopyMissingDrawer";

export function ContentFiltersBar({ channel = null, date = null, folder, onChannelChange, onDateChange, onFolderChange }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const [channelSearch, setChannelSearch] = useState("");
  const { data: channelsData, isLoading: loadingChannels } = useChannels();
  const { data: datesData, isLoading: loadingDates } = useChannelDates(channel);
  const { mutate: deleteDateFolder, isPending: isDeleting } = useDeleteDateFolder();
  const { toast } = useToast();

  const channels = channelsData?.channels ?? [];
  const dates = datesData?.dates ?? [];

  function handleDeleteConfirm() {
    deleteDateFolder({ channel, date }, {
      onSuccess: (res) => {
        toast({ title: `Deleted ${res.data?.deletedFiles ?? 0} files from ${channel} / ${date}.` });
        onDateChange(null);
        setConfirmOpen(false);
      },
      onError: (err) => {
        toast({ title: err.message ?? "Failed to delete folder.", variant: "destructive" });
        setConfirmOpen(false);
      },
    });
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 p-4 rounded-lg border border-zinc-800 bg-zinc-900">

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 w-12 sm:w-auto shrink-0">Channel</label>
          <Popover open={channelOpen} onOpenChange={(o) => { setChannelOpen(o); if (!o) setChannelSearch(""); }}>
            <PopoverTrigger asChild disabled={loadingChannels}>
              <button className="h-8 flex-1 sm:flex-none sm:w-44 flex items-center justify-between gap-1 px-3 rounded-md border border-zinc-700 bg-zinc-800 text-xs text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="truncate text-left">
                  {loadingChannels ? "Loading…" : (channel ?? "Select channel")}
                </span>
                <ChevronsUpDown size={12} className="shrink-0 text-zinc-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-0 bg-zinc-900 border-zinc-700" align="start">
              <Command className="bg-zinc-900">
                <div className="relative">
                  <CommandInput
                    placeholder="Search channel…"
                    value={channelSearch}
                    onValueChange={setChannelSearch}
                    className="h-8 text-xs text-zinc-100 placeholder:text-zinc-500 pr-6"
                  />
                  {channelSearch && (
                    <button
                      onClick={() => setChannelSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <CommandList>
                  <CommandEmpty className="text-xs text-zinc-500 py-3">No channel found.</CommandEmpty>
                  <CommandGroup>
                    {channels.map((ch) => (
                      <CommandItem
                        key={ch}
                        value={ch}
                        onSelect={(val) => { onChannelChange(val); setChannelOpen(false); setChannelSearch(""); }}
                        className="text-xs text-zinc-100 data-[selected=true]:bg-zinc-800 cursor-pointer"
                      >
                        <Check size={12} className={ch === channel ? "opacity-100" : "opacity-0"} />
                        {ch}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 w-12 sm:w-auto shrink-0">Date</label>
          <Select value={date ?? ""} onValueChange={onDateChange} disabled={!channel || loadingDates}>
            <SelectTrigger className="h-8 flex-1 sm:flex-none sm:w-36 border-zinc-700 bg-zinc-800 text-xs text-zinc-100">
              <SelectValue placeholder={!channel ? "Pick channel first" : "Select date"} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {dates.map((d) => (
                <SelectItem key={d} value={d} className="text-xs text-zinc-100 focus:bg-zinc-800">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 w-12 sm:w-auto shrink-0">Folder</label>
          <Select value={folder} onValueChange={onFolderChange}>
            <SelectTrigger className="h-8 flex-1 sm:flex-none sm:w-44 border-zinc-700 bg-zinc-800 text-xs text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {FOLDER_TYPES.map((f) => (
                <SelectItem key={f.value} value={f.value} className="text-xs text-zinc-100 focus:bg-zinc-800">{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {channel && date && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 sm:flex-none h-8 px-3 text-xs text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-300"
              onClick={() => setDrawerOpen(true)}
              aria-label="Copy file to missing content"
            >
              <CopyPlus size={13} className="mr-1.5" />
              Copy to Missing
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 sm:flex-none h-8 px-3 text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => setConfirmOpen(true)}
              aria-label={`Delete all files for ${channel} / ${date}`}
            >
              <Trash2 size={13} className="mr-1.5" />
              Delete Folder
            </Button>
          </div>
        )}
      </div>

      <CopyMissingDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        defaultChannelName={channel}
        defaultDate={date}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Delete date folder?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will permanently delete{" "}
              <span className="font-mono text-zinc-200">all files</span> under{" "}
              <span className="font-mono text-zinc-200">{channel} / {date}</span> from GCS.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting…" : "Delete all files"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
