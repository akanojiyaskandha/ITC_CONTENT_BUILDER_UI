import { useState, useEffect } from "react";
import { useMasterReport } from "@/hooks/useMasterReport";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, RefreshCw } from "lucide-react";

const COLUMNS = [
  { accessor: "channel", label: "Channel", width: "17%", className: "truncate" },
  { accessor: "playlistDate", label: "Date", width: "9%", className: "truncate" },
  { accessor: "startTime", label: "Start Time", width: "12%", className: "font-mono text-xs truncate" },
  { accessor: "type", label: "Type", width: "8%", className: "truncate" },
  { accessor: "houseId", label: "House ID", width: "12%", className: "font-mono text-xs truncate" },
  {
    accessor: "title",
    label: "Title",
    width: "24%",
    render: (row) => (
      <span className="block truncate" title={row.title}>{row.title}</span>
    ),
  },
  { accessor: "expectedFolder", label: "Folder", width: "9%", className: "truncate" },
  {
    key: "status",
    accessor: "status",
    label: "Status",
    width: "9%",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

function toReportDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

export function MasterReportPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(200);
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [date, debouncedSearch]);

  const { data, isLoading, isFetching, refetch } = useMasterReport({
    page,
    limit: pageSize,
    date: toReportDate(date),
    search: debouncedSearch,
  });

  const hasFilter = date || debouncedSearch;

  function clearFilters() {
    setDate("");
    setSearch("");
    setDebouncedSearch("");
  }

  const missingCount = data?.missingCount ?? 0;
  const doneCount = data?.doneCount ?? 0;

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-8 px-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
        />
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channel, house ID, title…"
            className="pl-8 pr-7 h-8 w-64 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {hasFilter && (
          <Button
            size="sm"
            variant="outline"
            onClick={clearFilters}
            className="h-8 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            Show All
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={refetch}
          disabled={isFetching}
          className="h-8 w-8 p-0 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          aria-label="Refresh"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
        </Button>

        {/* Status counters */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-800/50 bg-red-950/30">
            <span className="text-xs text-zinc-400">Missing</span>
            <span className="text-sm font-bold text-red-400">{missingCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-green-800/50 bg-green-950/30">
            <span className="text-xs text-zinc-400">Done</span>
            <span className="text-sm font-bold text-green-400">{doneCount}</span>
          </div>
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        data={data?.rows ?? []}
        total={data?.total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
        isRefreshing={isFetching}
        hideSearch
        emptyTitle="No records found"
      />
    </div>
  );
}
