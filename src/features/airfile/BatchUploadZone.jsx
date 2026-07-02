import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const MAX_BATCH = 20;
const MAX_SIZE_MB = 10;
const FILENAME_RE = /^[A-Za-z0-9_]+_\d{2}-[A-Za-z]{3}-\d{2}\.xlsx$/;

export function validateFile(file, existingNames = []) {
  if (!file.name.toLowerCase().endsWith(".xlsx")) return "Must be a .xlsx file";
  if (!FILENAME_RE.test(file.name))
    return "Filename must follow CHANNEL_DD-Mon-YY.xlsx (e.g. SS1_HD_LTS_25-Jun-26.xlsx)";
  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return `File exceeds ${MAX_SIZE_MB} MB limit`;
  if (existingNames.includes(file.name)) return "Already in queue";
  return null;
}

export function BatchUploadZone({
  onFilesAdded,
  existingNames,
  disabled,
  maxFiles,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState([]);

  function processFiles(rawFiles) {
    const list = Array.from(rawFiles);
    const seenNames = [...existingNames];
    const valid = [];
    const errs = [];

    if (seenNames.length >= maxFiles) {
      setErrors([
        `Queue is full (max ${maxFiles} files). Remove some files first.`,
      ]);
      return;
    }

    for (const f of list) {
      if (seenNames.length + valid.length >= maxFiles) {
        errs.push(`Max ${maxFiles} files reached — remaining files skipped`);
        break;
      }
      const err = validateFile(f, [...seenNames, ...valid.map((v) => v.name)]);
      if (err) errs.push(`${f.name}: ${err}`);
      else valid.push(f);
    }

    setErrors(errs);
    if (valid.length) onFilesAdded(valid);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (!disabled) processFiles(e.dataTransfer.files);
  }

  function handleChange(e) {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) =>
          e.key === "Enter" && !disabled && inputRef.current?.click()
        }
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Add playlist files — drop or click to browse"
        aria-disabled={disabled}
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-colors",
          disabled
            ? "border-zinc-800 bg-zinc-900/50 cursor-not-allowed opacity-50"
            : dragging
              ? "border-zinc-500 bg-zinc-800/50 cursor-copy"
              : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/30 cursor-pointer",
        )}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800">
          <Upload size={18} className="text-zinc-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-300">
            Drop files here or{" "}
            <span className="text-zinc-100 underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Multiple .xlsx — e.g. SS1_HD_LTS_25-Jun-26.xlsx · max {maxFiles}{" "}
            files
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          multiple
          onChange={handleChange}
          className="sr-only"
          aria-label="Select playlist files"
        />
      </div>

      {errors.length > 0 && (
        <ul
          className="flex flex-col gap-1 p-3 rounded-md bg-red-500/10 border border-red-500/20"
          role="alert"
          aria-label="Validation errors"
        >
          {errors.map((err, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-red-400">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
