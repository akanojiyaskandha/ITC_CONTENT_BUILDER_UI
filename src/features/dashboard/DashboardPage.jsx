import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { useStats } from "@/hooks/useStats";
import { StatsGrid } from "./StatsGrid";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const shouldReduce = useReducedMotion();
  const { data: stats, isLoading, error } = useStats();

  return (
    <AppShell
      header={
        <Header
          title="Dashboard"
          description="Media operations overview"
        />
      }
    >
      <motion.div
        variants={pageVariants}
        initial={shouldReduce ? false : "initial"}
        animate="animate"
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          title="Operations Overview"
          description="Real-time stats across all channels and content. Refreshes every 30s."
        />

        {error ? (
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10">
            <p className="text-sm text-red-400">
              Failed to load stats: {error.message ?? "Unknown error"}
            </p>
          </div>
        ) : (
          <StatsGrid stats={stats} isLoading={isLoading} />
        )}
      </motion.div>
    </AppShell>
  );
}
