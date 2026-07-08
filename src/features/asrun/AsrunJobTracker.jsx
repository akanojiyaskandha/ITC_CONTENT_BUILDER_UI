import PropTypes from "prop-types";
import { useState } from "react";
import { useJob } from "@/hooks/useJob";
import { JobProgressCard } from "@/components/shared/JobProgressCard";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { downloadAsrunCsv } from "@/services/asrunService";
import { useToast } from "@/hooks/use-toast";

export function AsrunJobTracker({ jobId, onDismiss }) {
  const { data: job, isLoading } = useJob(jobId);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const isTerminal = job?.status === "completed" || job?.status === "failed";
  const canDownload = job?.status === "completed" && job?.result?.outputFileName;

  async function handleDownload() {
    if (!canDownload || downloading) return;
    setDownloading(true);
    try {
      await downloadAsrunCsv(job.result.outputFileName);
    } catch (err) {
      toast({ title: "Download failed", description: err?.message ?? "Could not download the CSV file.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 font-mono truncate pr-2">{jobId}</p>
        <div className="flex items-center gap-1 shrink-0">
          {canDownload && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="h-6 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800"
            >
              <Download size={12} className="mr-1" />
              Download CSV
            </Button>
          )}
          {isTerminal && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-100"
              aria-label="Dismiss job"
            >
              <X size={12} />
            </Button>
          )}
        </div>
      </div>
      <JobProgressCard jobId={jobId} job={job} isLoading={isLoading} />
    </div>
  );
}

AsrunJobTracker.propTypes = {
  jobId: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
