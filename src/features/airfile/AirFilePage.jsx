import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Radio, FileText, FileCode, Package, Wand2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { AirFilePlaylistTab } from "./AirFilePlaylistTab";
import { AirFilePTKTab } from "./AirFilePTKTab";
import { AirFileXMLTab } from "./AirFileXMLTab";
import { BulkPlaylistTab } from "./BulkPlaylistTab";
import { AirFileEasyAirTab } from "./AirFileEasyAirTab";

const TABS = [
  {
    id: "playlist",
    label: "Playlist",
    Icon: Radio,
    description: "Convert xlsx playlist files to .air broadcast schedule files",
  },
  {
    id: "easyair",
    label: "Easy Air",
    Icon: Wand2,
    description: "Generate .air files directly from one or more House IDs",
  },
  // {
  //   id:          "ptk",
  //   label:       "PTK Manager",
  //   Icon:        FileText,
  //   description: "Manage Programme Title Key database — upload, sync from Google Sheets, or download",
  // },
  // {
  //   id:          "xml",
  //   label:       "XML Upload",
  //   Icon:        FileCode,
  //   description: "Upload Oasys XML files to store SOM/EOM segment timecodes",
  // },
  // {
  //   id:          "bulk",
  //   label:       "Bulk Converter",
  //   Icon:        Package,
  //   description: "Upload multiple playlist files — auto-detect language, convert all, download as one ZIP",
  // },
];

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function AirFilePage() {
  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState("playlist");

  const meta = TABS.find((t) => t.id === activeTab);

  return (
    <AppShell
      header={
        <Header
          title="Air File Builder"
          description="Convert playlists · Manage PTK · Upload Oasys XML"
        />
      }
    >
      <motion.div
        variants={pageVariants}
        initial={shouldReduce ? false : "initial"}
        animate="animate"
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-6 max-w-5xl w-full"
      >
        {/* Tab bar */}
        <div
          className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 w-fit flex-wrap"
          role="tablist"
          aria-label="Air File Builder sections"
        >
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100",
              )}
            >
              <Icon size={14} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Section heading */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">{meta?.label}</h2>
          <p className="text-sm text-zinc-400 mt-1">{meta?.description}</p>
        </div>

        {/* Tab panels */}
        <div role="tabpanel">
          {activeTab === "playlist" && <AirFilePlaylistTab />}
          {activeTab === "easyair" && <AirFileEasyAirTab />}
          {/* {activeTab === "ptk"      && <AirFilePTKTab />}
          {activeTab === "xml"      && <AirFileXMLTab />} */}
          {/* {activeTab === "bulk"     && <BulkPlaylistTab />} */}
        </div>
      </motion.div>
    </AppShell>
  );
}
