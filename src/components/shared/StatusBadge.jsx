import PropTypes from "prop-types";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  Missing: {
    label: "Missing",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export function StatusBadge({ status }) {
  const shouldReduce = useReducedMotion();
  const config = CONFIG[status] ?? {
    label: status,
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={shouldReduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        role="status"
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
          config.className
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            status === "processing" && "animate-pulse bg-blue-400",
            status === "pending" && "bg-amber-400",
            status === "completed" && "bg-emerald-400",
            status === "failed" && "bg-red-400",
            status === "Missing" && "bg-red-400",
            !CONFIG[status] && "bg-zinc-400"
          )}
        />
        {config.label}
      </motion.span>
    </AnimatePresence>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};
