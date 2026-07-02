import PropTypes from "prop-types";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { JOB_STATUS } from "@/utils/constants";

const ICON = {
  [JOB_STATUS.PENDING]: Clock,
  [JOB_STATUS.PROCESSING]: Loader2,
  [JOB_STATUS.COMPLETED]: CheckCircle2,
  [JOB_STATUS.FAILED]: XCircle,
};

const ICON_CLASS = {
  [JOB_STATUS.PENDING]: "text-amber-400",
  [JOB_STATUS.PROCESSING]: "text-blue-400 animate-spin",
  [JOB_STATUS.COMPLETED]: "text-emerald-400",
  [JOB_STATUS.FAILED]: "text-red-400",
};

export function JobProgressCard({ jobId = null, job = null, isLoading = false }) {
  const shouldReduce = useReducedMotion();

  if (isLoading && !job) {
    return (
      <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-800 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 bg-zinc-800 rounded" />
            <div className="h-3 w-40 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const Icon = ICON[job.status] ?? Clock;
  const iconClass = ICON_CLASS[job.status] ?? "text-zinc-400";

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 rounded-lg border border-zinc-800 bg-zinc-900"
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 shrink-0 mt-0.5">
          <Icon size={16} className={iconClass} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-zinc-100">Job {job.type}</p>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-xs text-zinc-500 font-mono truncate">{jobId}</p>

          {job.errorMessage && (
            <div className="mt-2 p-2.5 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{job.errorMessage}</p>
            </div>
          )}

          {job.status === JOB_STATUS.COMPLETED && job.result && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {Object.entries(job.result)
                .filter(([, v]) => v !== null && typeof v !== "object")
                .map(([k, v]) => (
                  <div key={k} className="text-center p-2 rounded-md bg-zinc-800">
                    <p className="text-xs text-zinc-500 capitalize">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-sm font-semibold text-zinc-100">{v}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

JobProgressCard.propTypes = {
  jobId: PropTypes.string,
  job: PropTypes.shape({
    type: PropTypes.string,
    status: PropTypes.string,
    errorMessage: PropTypes.string,
    result: PropTypes.object,
  }),
  isLoading: PropTypes.bool,
};
