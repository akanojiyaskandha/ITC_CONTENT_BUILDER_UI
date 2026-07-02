import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCommandStore } from "@/stores/useCommandStore";
import {
  LayoutDashboard,
  Upload,
  FileWarning,
  FolderOpen,
  RefreshCcw,
  Radio,
} from "lucide-react";

const PAGES = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Playlist Upload", to: "/playlist", icon: Upload },
  { label: "Missing Reports", to: "/reports", icon: FileWarning },
  { label: "Content Browser", to: "/content", icon: FolderOpen },
  { label: "Retry Operations", to: "/retry", icon: RefreshCcw },
  { label: "Air File Builder", to: "/airfile", icon: Radio },
];

export function CommandPalette() {
  const { open, setOpen } = useCommandStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setOpen]);

  function handleSelect(to) {
    setOpen(false);
    navigate(to);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Go to page…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {PAGES.map(({ label, to, icon: Icon }) => (
            <CommandItem key={to} onSelect={() => handleSelect(to)}>
              <Icon size={14} className="mr-2 text-zinc-400" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
