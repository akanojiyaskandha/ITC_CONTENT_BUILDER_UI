import PropTypes from "prop-types";
import { useJob } from "@/hooks/useJob";
import { JobProgressCard } from "@/components/shared/JobProgressCard";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function RetryJobTracker({ jobId, onDismiss }) {
  const { data: job, isLoading } = useJob(jobId);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 font-mono">{jobId}</p>
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
      <JobProgressCard jobId={jobId} job={job} isLoading={isLoading} />
    </div>
  );
}

RetryJobTracker.propTypes = {
  jobId: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
