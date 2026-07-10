import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlaylistUploadCard } from "./PlaylistUploadCard";
import { PlaylistJobTracker } from "./PlaylistJobTracker";
import {
  uploadPlaylistWithAirFile,
  generateAirFile,
} from "./uploadPlaylistWithAirFile";
import { useToast } from "@/hooks/use-toast";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function PlaylistPage() {
  const shouldReduce = useReducedMotion();
  const [activeJobs, setActiveJobs] = useState([]); // { jobId, file }
  const [airFileMode, setAirFileMode] = useState("gcs");
  const [createAirFile, setCreateAirFile] = useState(true);
  const [airFileByJob, setAirFileByJob] = useState({}); // { [jobId]: result }
  const { toast } = useToast();

  function handleAirFileResult(jobId, result) {
    setAirFileByJob((prev) => ({ ...prev, [jobId]: result }));
  }

  async function retryJob(jobId) {
    const job = activeJobs.find((j) => j.jobId === jobId);
    if (!job) return;
    try {
      const { jobId: newJobId, airFilePromise } =
        await uploadPlaylistWithAirFile(job.file, airFileMode, createAirFile);
      setActiveJobs((prev) =>
        prev.map((j) =>
          j.jobId === jobId ? { jobId: newJobId, file: job.file } : j,
        ),
      );
      setAirFileByJob((prev) => {
        const rest = { ...prev };
        delete rest[jobId];
        rest[newJobId] = { status: "pending" };
        return rest;
      });
      airFilePromise.then((result) => handleAirFileResult(newJobId, result));
    } catch (err) {
      toast({
        title: `Retry failed: ${job.file.name}`,
        description: err.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function retryAirFile(jobId) {
    const job = activeJobs.find((j) => j.jobId === jobId);
    if (!job) return;
    handleAirFileResult(jobId, { status: "pending" });
    const result = await generateAirFile(job.file, airFileMode, createAirFile);
    handleAirFileResult(jobId, result);
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
              onAirFileResult={handleAirFileResult}
              airFileMode={airFileMode}
              onAirFileModeChange={setAirFileMode}
              createAirFile={createAirFile}
              onCreateAirFileChange={setCreateAirFile}
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
                  airFile={airFileByJob[jobId]}
                  onRetry={() => retryJob(jobId)}
                  onRetryAirFile={() => retryAirFile(jobId)}
                  onDismiss={() => {
                    setActiveJobs((prev) =>
                      prev.filter((j) => j.jobId !== jobId),
                    );
                    setAirFileByJob((prev) => {
                      const rest = { ...prev };
                      delete rest[jobId];
                      return rest;
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
}
