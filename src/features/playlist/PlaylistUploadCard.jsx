import PropTypes from "prop-types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/shared/FileUploadZone";
import { useUploadPlaylist } from "@/hooks/useUploadPlaylist";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function PlaylistUploadCard({ onJobStarted }) {
  const [file, setFile] = useState(null);
  const { toast } = useToast();

  const { mutate, isPending } = useUploadPlaylist({
    onSuccess: ({ jobId }) => {
      toast({ title: "Playlist upload started", description: `Job ID: ${jobId}` });
      setFile(null);
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
    if (!file) return;
    mutate(file);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FileUploadZone
        onFile={setFile}
        accept=".xlsx"
        hint="Filename must include channel name and date — e.g. LTS Prime 23-Jun-26.xlsx"
      />

      <Button
        type="submit"
        disabled={!file || isPending}
        className="self-start bg-white text-black hover:bg-zinc-200"
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Uploading…
          </>
        ) : (
          "Process Playlist"
        )}
      </Button>
    </form>
  );
}

PlaylistUploadCard.propTypes = {
  onJobStarted: PropTypes.func.isRequired,
};
