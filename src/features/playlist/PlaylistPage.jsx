import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlaylistUploadCard } from "./PlaylistUploadCard";
import { PlaylistJobTracker } from "./PlaylistJobTracker";
import { uploadPlaylist } from "@/services/playlistService";
import { useToast } from "@/hooks/use-toast";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function PlaylistPage() {
  const shouldReduce = useReducedMotion();
  const [activeJobs, setActiveJobs] = useState([]); // { jobId, file }
  const { toast } = useToast();

  async function retryJob(jobId) {
    const job = activeJobs.find((j) => j.jobId === jobId);
    if (!job) return;
    try {
      const { jobId: newJobId } = await uploadPlaylist(job.file);
      setActiveJobs((prev) =>
        prev.map((j) => (j.jobId === jobId ? { jobId: newJobId, file: job.file } : j))
      );
    } catch (err) {
      toast({
        title: `Retry failed: ${job.file.name}`,
        description: err.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

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
            <PlaylistUploadCard
              onJobStarted={(jobId, file) =>
                setActiveJobs((prev) => [...prev, { jobId, file }])
              }
            />
          </div>

          {activeJobs.length > 0 && (
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Active Jobs ({activeJobs.length})
              </p>
              {activeJobs.map(({ jobId }) => (
                <PlaylistJobTracker
                  key={jobId}
                  jobId={jobId}
                  onRetry={() => retryJob(jobId)}
                  onDismiss={() =>
                    setActiveJobs((prev) => prev.filter((j) => j.jobId !== jobId))
                  }
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
}
