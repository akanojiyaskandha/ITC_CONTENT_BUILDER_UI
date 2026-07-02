import PropTypes from "prop-types";
import { useAppStore } from "@/stores/useAppStore";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";

export function AppShell({ header, children }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden">
      <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {header}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}

AppShell.propTypes = {
  header: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};
