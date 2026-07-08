import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function FileUploadZone({ onFile, accept = ".xlsx", hint = null, multiple = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(multiple ? [] : null);

  function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (multiple) {
      const next = [...selected, ...files];
      setSelected(next);
      onFile(next);
    } else {
      setSelected(files[0]);
      onFile(files[0]);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleChange(e) {
    handleFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  }

  function clearFile() {
    setSelected(multiple ? [] : null);
    onFile(multiple ? [] : null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index) {
    const next = selected.filter((_, i) => i !== index);
    setSelected(next);
    onFile(next);
  }

  const hasSelection = multiple ? selected.length > 0 : !!selected;

  if (hasSelection) {
    if (multiple) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {selected.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-900">
                <FileSpreadsheet size={18} className="text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">{f.name}</p>
                  <p className="text-xs text-zinc-500">{(f.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => removeAt(i)}
                  aria-label="Remove file"
                  className="text-zinc-500 hover:text-zinc-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs text-zinc-400 hover:text-zinc-100 underline underline-offset-2 self-start"
          >
            Add more files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleChange}
            className="sr-only"
            aria-label="File input"
          />
        </div>
      );
    }
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
        multiple={multiple}
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
  multiple: PropTypes.bool,
};
