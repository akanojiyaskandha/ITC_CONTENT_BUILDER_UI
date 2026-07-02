import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlaylistUploadCard } from "./PlaylistUploadCard";
import { PlaylistJobTracker } from "./PlaylistJobTracker";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function PlaylistPage() {
  const shouldReduce = useReducedMotion();
  const [activeJobId, setActiveJobId] = useState(null);

  return (
    <AppShell
      header={
        <Header
          title="Playlist Upload"
          description="Upload an .xlsx playlist to start async processing"
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
          title="Upload Playlist"
          description="Select an Excel file containing channel and date. Processing runs in the background."
        />

        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900">
            <PlaylistUploadCard onJobStarted={setActiveJobId} />
          </div>

          {activeJobId && (
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900">
              <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">
                Active Job
              </p>
              <PlaylistJobTracker
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
