import PropTypes from "prop-types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/shared/FileUploadZone";
import { uploadPlaylist } from "@/services/playlistService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RotateCcw, X } from "lucide-react";

const CONCURRENCY = 4;

export function PlaylistUploadCard({ onJobStarted }) {
  const [files, setFiles] = useState([]);
  const [failed, setFailed] = useState([]); // { id, file, error }
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  async function uploadOne(file) {
    try {
      const { jobId } = await uploadPlaylist(file);
      onJobStarted(jobId, file);
      return true;
    } catch (err) {
      setFailed((prev) => [
        ...prev,
        { id: `${file.name}-${Date.now()}`, file, error: err.message ?? "Upload failed" },
      ]);
      return false;
    }
  }

  async function uploadBatch(batch) {
    setIsUploading(true);
    const queue = [...batch];

    async function worker() {
      while (queue.length) {
        const file = queue.shift();
        await uploadOne(file);
      }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, batch.length) }, worker));
    setIsUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!files.length || isUploading) return;
    const batch = files;
    setFiles([]);
    await uploadBatch(batch);
    toast({ title: "Upload complete", description: `${batch.length} playlist(s) queued.` });
  }

  async function retryOne(entry) {
    setFailed((prev) => prev.filter((f) => f.id !== entry.id));
    setIsUploading(true);
    await uploadOne(entry.file);
    setIsUploading(false);
  }

  function dismissFailed(id) {
    setFailed((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FileUploadZone
        onFile={setFiles}
        accept=".xlsx"
        multiple
        hint="Filename must include channel name and date — e.g. LTS Prime 23-Jun-26.xlsx. You can select multiple files."
      />

      {failed.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-red-400 uppercase tracking-wide">
            Failed uploads ({failed.length})
          </p>
          {failed.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/10"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{entry.file.name}</p>
                <p className="text-xs text-red-400 truncate">{entry.error}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => retryOne(entry)}
                disabled={isUploading}
                className="h-7 px-2 text-zinc-300 hover:text-zinc-100"
              >
                <RotateCcw size={14} className="mr-1" />
                Retry
              </Button>
              <button
                type="button"
                onClick={() => dismissFailed(entry.id)}
                aria-label="Dismiss"
                className="text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="submit"
        disabled={!files.length || isUploading}
        className="self-start bg-white text-black hover:bg-zinc-200"
      >
        {isUploading ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Uploading…
          </>
        ) : (
          `Process Playlist${files.length > 1 ? `s (${files.length})` : ""}`
        )}
      </Button>
    </form>
  );
}

PlaylistUploadCard.propTypes = {
  onJobStarted: PropTypes.func.isRequired,
};
