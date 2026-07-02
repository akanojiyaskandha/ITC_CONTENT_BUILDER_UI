import PropTypes from "prop-types";
import { Search } from "lucide-react";
import { useCommandStore } from "@/stores/useCommandStore";

export function Header({ title, description = null, actions = null }) {
  const openCmd = useCommandStore((s) => s.setOpen);

  return (
    <div className="flex items-center justify-between h-14 px-6 border-b border-zinc-800 shrink-0 bg-zinc-950">
      <div className="flex flex-col justify-center min-w-0">
        <h1 className="text-sm font-semibold text-zinc-100 truncate">{title}</h1>
        {description && (
          <p className="text-xs text-zinc-500 truncate">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => openCmd(true)}
          aria-label="Open command palette (Ctrl+K)"
          className="flex items-center gap-2 h-8 px-3 rounded-md border border-zinc-800 text-xs text-zinc-500 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
        >
          <Search size={12} />
          <span>Search</span>
          <kbd className="ml-1 text-[10px] text-zinc-600">⌘K</kbd>
        </button>
        {actions}
      </div>
    </div>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
};
