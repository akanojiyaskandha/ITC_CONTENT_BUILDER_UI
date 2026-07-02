import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { RetryForm } from "./RetryForm";
import { RetryJobTracker } from "./RetryJobTracker";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function RetryPage() {
  const shouldReduce = useReducedMotion();
  const [activeJobId, setActiveJobId] = useState(null);

  return (
    <AppShell
      header={
        <Header
          title="Retry Operations"
          description="Re-process missing content from a date's report"
        />
      }
    >
      <motion.div
        variants={pageVariants}
        initial={shouldReduce ? false : "initial"}
        animate="animate"
        transition={{ duration: 0.25 }}
        className="max-w-xl"
      >
        <PageHeader
          title="Retry Missing Content"
          description="Selects all missing files from the report and copies them to MissingContent/."
        />

        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900">
            <RetryForm onJobStarted={setActiveJobId} />
          </div>

          {activeJobId && (
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900">
              <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">
                Active Job
              </p>
              <RetryJobTracker
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
