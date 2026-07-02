import PropTypes from "prop-types";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({ label, value = null, icon: Icon = null, description = null, variant = "default" }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex flex-col gap-3 p-5 rounded-lg border bg-zinc-900 border-zinc-800",
        variant === "danger" && "border-red-500/20",
        variant === "success" && "border-emerald-500/20"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
          {label}
        </span>
        {Icon && (
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-800">
            <Icon
              size={14}
              className={cn(
                "text-zinc-400",
                variant === "danger" && "text-red-400",
                variant === "success" && "text-emerald-400"
              )}
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-semibold text-zinc-100 tabular-nums">
          {value ?? "—"}
        </p>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
    </motion.div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.elementType,
  description: PropTypes.string,
  variant: PropTypes.oneOf(["default", "danger", "success"]),
};

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-lg border bg-zinc-900 border-zinc-800 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-zinc-800 rounded" />
        <div className="w-7 h-7 bg-zinc-800 rounded-md" />
      </div>
      <div>
        <div className="h-7 w-16 bg-zinc-800 rounded" />
        <div className="h-3 w-28 bg-zinc-800 rounded mt-1.5" />
      </div>
    </div>
  );
}
