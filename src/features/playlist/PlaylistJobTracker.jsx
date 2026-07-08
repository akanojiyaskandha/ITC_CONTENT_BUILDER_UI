import PropTypes from "prop-types";
import { useJob } from "@/hooks/useJob";
import { JobProgressCard } from "@/components/shared/JobProgressCard";
import { Button } from "@/components/ui/button";
import { RotateCcw, X } from "lucide-react";

export function PlaylistJobTracker({ jobId, onRetry, onDismiss }) {
  const { data: job, isLoading } = useJob(jobId);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 font-mono">{jobId}</p>
        <div className="flex items-center gap-1">
          {job?.status === "failed" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRetry}
              className="h-6 px-2 text-zinc-400 hover:text-zinc-100"
            >
              <RotateCcw size={12} className="mr-1" />
              Retry
            </Button>
          )}
          {(job?.status === "completed" || job?.status === "failed") && (
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

PlaylistJobTracker.propTypes = {
  jobId: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
