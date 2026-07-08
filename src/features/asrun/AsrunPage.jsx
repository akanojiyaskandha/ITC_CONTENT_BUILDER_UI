import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { AsrunUploadCard } from "./AsrunUploadCard";
import { AsrunJobTracker } from "./AsrunJobTracker";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function AsrunPage() {
  const shouldReduce = useReducedMotion();
  const [activeJobId, setActiveJobId] = useState(null);

  return (
    <AppShell
      header={
        <Header
          title="AS RUN"
          description="Reconcile ASRUN broadcast logs against playlist schedules"
        />
      }
    >
      <motion.div
        variants={pageVariants}
        initial={shouldReduce ? false : "initial"}
        animate="animate"
        transition={{ duration: 0.25 }}
        className="max-w-3xl"
      >
        <PageHeader
          title="ASRUN Reconciliation"
          description="Upload the ASRUN log (.txt) and the playlist (.xlsx). The reconciliation CSV will be available for download once processing completes."
        />

        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900">
            <AsrunUploadCard onJobStarted={setActiveJobId} />
          </div>

          {activeJobId && (
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900">
              <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">
                Active Job
              </p>
              <AsrunJobTracker
                jobId={activeJobId}
                onDismiss={() => setActiveJobId(null)}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
}
