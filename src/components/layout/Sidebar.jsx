import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  FileWarning,
  FolderOpen,
  RefreshCcw,
  ChevronLeft,
  Tv2,
  Radio,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/playlist", icon: Upload, label: "Playlist Upload" },
  { to: "/reports", icon: FileWarning, label: "Missing Reports" },
  { to: "/content", icon: FolderOpen, label: "Content Browser" },
  { to: "/retry", icon: RefreshCcw, label: "Retry Operations" },
  { to: "/airfile", icon: Radio, label: "Air File Builder" },
  { to: "/asrun", icon: ClipboardList, label: "AS RUN" },
];

export function Sidebar({ open, onToggle }) {
  return (
    <motion.aside
      animate={{ width: open ? 240 : 56 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 shrink-0 overflow-hidden"
    >
      <div className="flex items-center h-14 px-3 border-b border-zinc-800 gap-2 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/10 shrink-0">
          <Tv2 size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-semibold text-zinc-100 whitespace-nowrap overflow-hidden"
            >
              LTS Content
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-hidden">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 h-9 rounded-md px-2 text-sm transition-colors",
                isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )
            }
          >
            <Icon size={16} className="shrink-0" />
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        className="flex items-center justify-center h-10 border-t border-zinc-800 text-zinc-500 hover:text-zinc-100 transition-colors"
      >
        <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.25 }}>
          <ChevronLeft size={16} />
        </motion.div>
      </button>
    </motion.aside>
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};
