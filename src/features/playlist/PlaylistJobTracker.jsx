import PropTypes from "prop-types";
import { useState } from "react";
import { useJob } from "@/hooks/useJob";
import { JobProgressCard } from "@/components/shared/JobProgressCard";
import { AirFilePlaylistResult } from "@/features/airfile/AirFilePlaylistResult";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, X } from "lucide-react";

const AIR_FILE_SESSION_TTL_MS = 30 * 60 * 1000;

function AirFileStatus({ airFile, onRetryAirFile }) {
  const [dismissed, setDismissed] = useState(false);
  if (!airFile || dismissed) return null;

  if (airFile.status === "pending") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Loader2 size={12} className="animate-spin" />
        Generating .air file…
      </div>
    );
  }

  if (airFile.status === "skipped") {
    return (
      <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] w-fit">
        Contingency file — .air file not applicable
      </Badge>
    );
  }

  if (airFile.status === "unmapped") {
    return (
      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] w-fit">
        {`.air file not generated — "${airFile.channelName}" isn't a mapped playlist channel`}
      </Badge>
    );
  }

  if (airFile.status === "failed") {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
          .air file failed
        </Badge>
        <span className="text-xs text-zinc-500">{airFile.error}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRetryAirFile}
          className="h-6 px-2 text-zinc-400 hover:text-zinc-100"
        >
          <RotateCcw size={12} className="mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  if (airFile.status === "success") {
    return (
      <AirFilePlaylistResult
        result={{ ...airFile, expiresAt: Date.now() + AIR_FILE_SESSION_TTL_MS }}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  return null;
}

AirFileStatus.propTypes = {
  airFile: PropTypes.object,
  onRetryAirFile: PropTypes.func.isRequired,
};

export function PlaylistJobTracker({
  jobId,
  airFile,
  onRetry,
  onRetryAirFile,
  onDismiss,
}) {
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
      <AirFileStatus airFile={airFile} onRetryAirFile={onRetryAirFile} />
    </div>
  );
}

PlaylistJobTracker.propTypes = {
  jobId: PropTypes.string.isRequired,
  airFile: PropTypes.object,
  onRetry: PropTypes.func.isRequired,
  onRetryAirFile: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
