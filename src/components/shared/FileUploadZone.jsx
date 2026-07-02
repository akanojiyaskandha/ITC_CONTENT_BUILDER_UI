import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function FileUploadZone({ onFile, accept = ".xlsx", hint = null }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(null);

  function handleFile(file) {
    setSelected(file);
    onFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function clearFile() {
    setSelected(null);
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (selected) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-zinc-700 bg-zinc-900">
        <FileSpreadsheet size={20} className="text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{selected.name}</p>
          <p className="text-xs text-zinc-500">
            {(selected.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <button
          onClick={clearFile}
          aria-label="Remove file"
          className="text-zinc-500 hover:text-zinc-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-10 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
        dragging
          ? "border-zinc-500 bg-zinc-800/50"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/30"
      )}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label="Upload file"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800">
        <Upload size={18} className="text-zinc-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-300">
          Drop file here or{" "}
          <span className="text-zinc-100 underline underline-offset-2">browse</span>
        </p>
        {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
        aria-label="File input"
      />
    </div>
  );
}

FileUploadZone.propTypes = {
  onFile: PropTypes.func.isRequired,
  accept: PropTypes.string,
  hint: PropTypes.string,
};
