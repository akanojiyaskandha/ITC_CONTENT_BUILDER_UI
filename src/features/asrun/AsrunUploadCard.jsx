import PropTypes from "prop-types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/shared/FileUploadZone";
import { useUploadAsrun } from "@/hooks/useUploadAsrun";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const DATE_PATTERN = /\d{2}-[A-Za-z]{3}-\d{2}/;

function getAsrunFileError(file) {
  if (!file) return null;
  if (!file.name.toLowerCase().endsWith(".txt")) {
    return "ASRUN log must be a .txt file.";
  }
  return null;
}

function getPlaylistFileError(file) {
  if (!file) return null;
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return "Playlist must be a .xlsx file.";
  }
  if (!DATE_PATTERN.test(file.name)) {
    return "Filename must include a date — e.g. SS1_LTS_22-Jun-26.xlsx";
  }
  return null;
}

export function AsrunUploadCard({ onJobStarted }) {
  const [asrunFile, setAsrunFile] = useState(null);
  const [playlistFile, setPlaylistFile] = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const { toast } = useToast();

  const asrunError = getAsrunFileError(asrunFile);
  const playlistError = getPlaylistFileError(playlistFile);
  const missingAsrun = submitAttempted && !asrunFile;
  const missingPlaylist = submitAttempted && !playlistFile;

  const { mutate, isPending } = useUploadAsrun({
    onSuccess: ({ jobId }) => {
      toast({ title: "ASRUN processing started", description: `Job ID: ${jobId}` });
      setAsrunFile(null);
      setPlaylistFile(null);
      setSubmitAttempted(false);
      onJobStarted(jobId);
    },
    onError: (err) => {
      toast({
        title: "Upload failed",
        description: err.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!asrunFile || !playlistFile || asrunError || playlistError) return;

    mutate({ asrunFile, playlistFile });
  }

  const canSubmit = asrunFile && playlistFile && !asrunError && !playlistError;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Side-by-side upload zones */}
      <div className="grid grid-cols-2 gap-4">
        {/* LEFT — ASRUN Log */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
            ASRUN Log{" "}
            <span className="text-zinc-600 normal-case font-normal">.txt</span>
          </p>
          <FileUploadZone
            onFile={setAsrunFile}
            accept=".txt"
            hint="UTF-16LE encoded XML broadcast log"
          />
          {(missingAsrun || asrunError) && (
            <p className="text-xs text-red-400">
              {missingAsrun ? "Please upload an ASRUN log .txt file." : asrunError}
            </p>
          )}
        </div>

        {/* RIGHT — Playlist */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
            Playlist{" "}
            <span className="text-zinc-600 normal-case font-normal">.xlsx</span>
          </p>
          <FileUploadZone
            onFile={setPlaylistFile}
            accept=".xlsx"
            hint="e.g. SS1_TELUGUHD_LTS_22-Jun-26.xlsx"
          />
          {(missingPlaylist || playlistError) && (
            <p className="text-xs text-red-400">
              {missingPlaylist ? "Please upload a playlist .xlsx file." : playlistError}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="self-start bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Uploading…
          </>
        ) : (
          "Process ASRUN"
        )}
      </Button>

      {submitAttempted && !canSubmit && !isPending && (
        <p className="text-xs text-zinc-500">
          Fix the errors above before submitting.
        </p>
      )}
    </form>
  );
}

AsrunUploadCard.propTypes = {
  onJobStarted: PropTypes.func.isRequired,
};
