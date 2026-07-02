export const JOB_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const FOLDER_TYPES = [
  { value: "Content", label: "Content" },
  { value: "Playlist", label: "Playlist" },
  { value: "HDLBand_on_Files", label: "HDL Band-On Files" },
  { value: "MissingContent", label: "Missing Content" },
  { value: "Contingency", label: "Contingency" },
];

export const POLL_INTERVAL_MS = 4_000;

export const TABLE_PAGE_SIZES = [50, 100, 200];

export const DATE_FORMAT_HINT = "DD-Mon-YY (e.g. 23-Jun-26)";
