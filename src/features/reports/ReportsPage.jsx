import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RefreshCw, ChevronsUpDown, Check, X, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useMissingReports } from "@/hooks/useMissingReports";
import { useChannels } from "@/hooks/useChannels";
import { ReportsListPanel } from "./ReportsListPanel";
import { ReportTablePanel } from "./ReportTablePanel";
import { MasterReportPanel } from "./MasterReportPanel";

const TABS = [
  { id: "date", label: "Date Reports" },
  { id: "master", label: "Master Report" },
];

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function ReportsPage() {
  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState("date");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelOpen, setChannelOpen] = useState(false);
  const [channelSearch, setChannelSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!channelOpen) return;
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setChannelOpen(false);
        setChannelSearch("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [channelOpen]);

  const { data: reports, isLoading, isFetching: isRefetchingReports, refetch: refetchReports } = useMissingReports();
  const { data: channelsData } = useChannels();
  const channels = channelsData?.channels ?? [];

  const canShowTable = Boolean(selectedReport && selectedChannel);

  return (
    <AppShell
      header={
        <Header
          title="Missing Reports"
          description="View and download date-wise missing content reports"
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
        <div className="flex items-center justify-between shrink-0">
          <PageHeader title="Missing Reports" />
          <div className="flex gap-1 border border-zinc-800 rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "master" ? (
          <div className="flex-1 min-h-0">
            <MasterReportPanel />
          </div>
        ) : (
          <div className="grid grid-cols-[320px_1fr] gap-4 flex-1 min-h-0">
            {/* Left panel — fixed width, independently scrollable */}
            <div className="flex flex-col h-full min-h-0 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Reports</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refetchReports}
                  disabled={isRefetchingReports}
                  className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
                  aria-label="Refresh reports list"
                >
                  <RefreshCw size={12} className={isRefetchingReports ? "animate-spin" : ""} />
                </Button>
              </div>
              <div className="overflow-y-auto flex-1 min-h-0 p-2">
                <ReportsListPanel
                  reports={reports}
                  selected={selectedReport?.fileName ?? null}
                  onSelect={(report) => { setSelectedReport(report); setSelectedChannel(null); }}
                  onDeleted={() => { setSelectedReport(null); setSelectedChannel(null); }}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Right panel — channel selector fixed, table scrolls */}
            <div className="flex flex-col h-full min-h-0 gap-3">
              {selectedReport ? (
                <>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-500">Channel:</span>
                    <div className="relative w-48" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setChannelOpen((o) => !o)}
                        className="h-8 w-full flex items-center justify-between gap-1 px-3 rounded-md border border-zinc-700 bg-zinc-900 text-xs text-zinc-100"
                      >
                        <span className="truncate text-left">{selectedChannel ?? "Select channel…"}</span>
                        <ChevronsUpDown size={12} className="shrink-0 text-zinc-500" />
                      </button>

                      {channelOpen && (
                        <div className="absolute z-50 w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 shadow-lg">
                          <div className="relative flex items-center border-b border-zinc-700 px-2">
                            <Search size={13} className="shrink-0 text-zinc-500 mr-1" />
                            <input
                              autoFocus
                              value={channelSearch}
                              onChange={(e) => setChannelSearch(e.target.value)}
                              placeholder="Search channel…"
                              className="h-8 w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none pr-5"
                            />
                            {channelSearch && (
                              <button
                                type="button"
                                onClick={() => setChannelSearch("")}
                                className="absolute right-2 text-zinc-500 hover:text-zinc-200 transition-colors"
                                aria-label="Clear search"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                          <div className="max-h-48 overflow-y-auto py-1">
                            {(channelSearch.trim()
                              ? channels.filter((ch) => ch.toLowerCase().includes(channelSearch.toLowerCase()))
                              : channels
                            ).length === 0 ? (
                              <p className="text-xs text-zinc-500 py-3 text-center">No channel found.</p>
                            ) : (
                              (channelSearch.trim()
                                ? channels.filter((ch) => ch.toLowerCase().includes(channelSearch.toLowerCase()))
                                : channels
                              ).map((ch) => (
                                <button
                                  key={ch}
                                  type="button"
                                  onClick={() => { setSelectedChannel(ch); setChannelOpen(false); setChannelSearch(""); }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-100 hover:bg-zinc-800 transition-colors text-left"
                                >
                                  <Check size={12} className={ch === selectedChannel ? "opacity-100 shrink-0" : "opacity-0 shrink-0"} />
                                  {ch}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {canShowTable ? (
                    <div className="flex-1 min-h-0">
                      <ReportTablePanel channel={selectedChannel} date={selectedReport.playlistDate} reportType={selectedReport.reportType} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center flex-1 text-sm text-zinc-500">
                      Select a channel to view report rows
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center flex-1 text-sm text-zinc-500">
                  Select a report to view its rows
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
