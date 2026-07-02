import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppStore } from "@/stores/useAppStore";
import { ContentFiltersBar } from "./ContentFiltersBar";
import { ContentFileTable } from "./ContentFileTable";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function ContentPage() {
  const shouldReduce = useReducedMotion();
  const { selectedChannel, selectedDate, selectedFolder, setSelectedChannel, setSelectedDate, setSelectedFolder } =
    useAppStore();

  const canShowFiles = Boolean(selectedChannel && selectedDate);

  return (
    <AppShell
      header={
        <Header
          title="Content Browser"
          description="Browse GCS content by channel, date, and folder"
        />
      }
    >
      <motion.div
        variants={pageVariants}
        initial={shouldReduce ? false : "initial"}
        animate="animate"
        transition={{ duration: 0.25 }}
        className="flex flex-col h-full gap-4"
      >
        <PageHeader title="Content Browser" />

        <ContentFiltersBar
          channel={selectedChannel}
          date={selectedDate}
          folder={selectedFolder}
          onChannelChange={setSelectedChannel}
          onDateChange={setSelectedDate}
          onFolderChange={setSelectedFolder}
        />

        {canShowFiles ? (
          <div className="flex-1 min-h-0">
            <ContentFileTable
              channel={selectedChannel}
              date={selectedDate}
              folder={selectedFolder}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center flex-1 text-sm text-zinc-500">
            Select a channel and date to browse files
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
