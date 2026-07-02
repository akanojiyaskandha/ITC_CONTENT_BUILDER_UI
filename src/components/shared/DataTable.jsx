import PropTypes from "prop-types";
import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Download, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { DataTablePagination } from "./DataTablePagination";

export function DataTable({
  columns,
  data,
  total = null,
  page = 1,
  pageSize = 200,
  onPageChange = null,
  onPageSizeChange = null,
  searchPlaceholder = "Search…",
  isLoading = false,
  emptyIcon = null,
  emptyTitle = "No data",
  onExport = null,
  onRefresh = null,
  isRefreshing = false,
  hideSearch = false,
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : null;
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  function toggleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  const totalItems = total ?? sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginationState = { pageNo: page - 1, pageSize, totalItems, totalPages };

  function handleSetPagination(updater) {
    const next = typeof updater === "function" ? updater(paginationState) : updater;
    if (next.pageNo !== paginationState.pageNo) onPageChange?.(next.pageNo + 1);
    if (next.pageSize !== paginationState.pageSize) {
      onPageSizeChange?.(next.pageSize);
      if (next.pageNo === paginationState.pageNo) onPageChange?.(1);
    }
  }

  if (isLoading) return <TableSkeleton cols={columns.length} />;

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      {/* Toolbar — fixed height, never scrolls */}
      <div className="flex items-center gap-2 shrink-0">
        {!hideSearch && (
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 pr-7 h-8 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 text-sm"
              aria-label="Search table"
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
        )}
        {onRefresh && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            aria-label="Refresh table"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          </Button>
        )}
        {onExport && (
          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
            className="h-8 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <Download size={14} className="mr-1.5" />
            Export
          </Button>
        )}
        {/* <p className="text-xs text-zinc-500 ml-auto">
          {total != null
            ? `${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} of ${total}`
            : `${sorted.length} rows`}
        </p> */}
      </div>

      {/* Table — fills remaining height, vertical scroll only, sticky header, fixed layout */}
      <div className="rounded-lg border border-zinc-800 overflow-y-auto flex-1 min-h-0">
        <table className="w-full text-sm table-fixed" aria-label="Data table">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-zinc-800 bg-zinc-900">
              {columns.map((col) => (
                <th
                  key={col.key ?? col.accessor}
                  className="px-4 py-2.5 text-left bg-zinc-900"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable !== false && col.accessor ? (
                    <button
                      onClick={() => toggleSort(col.accessor)}
                      className="flex items-center gap-1 text-xs text-zinc-500 uppercase tracking-wide hover:text-zinc-100 transition-colors whitespace-nowrap"
                    >
                      {col.label}
                      {sort.key === col.accessor ? (
                        sort.dir === "asc" ? (
                          <ArrowUp size={11} />
                        ) : (
                          <ArrowDown size={11} />
                        )
                      ) : (
                        <ArrowUpDown size={11} />
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                      {col.label}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState icon={emptyIcon} title={emptyTitle ?? "No data"} />
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={row.id ?? row._id ?? i}
                  className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key ?? col.accessor}
                      className={cn("px-4 py-3 text-zinc-300", col.className)}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? row[col.accessor]
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — fixed height, never scrolls */}
      {onPageChange && (
        <DataTablePagination pagination={paginationState} setPagination={handleSetPagination} />
      )}
    </div>
  );
}

function TableSkeleton({ cols }) {
  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden animate-pulse">
      <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800">
        <div className="h-3 w-32 bg-zinc-800 rounded" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-zinc-800 last:border-0">
          {Array.from({ length: cols }).map((__, j) => (
            <div key={j} className="h-3 bg-zinc-800 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

TableSkeleton.propTypes = { cols: PropTypes.number.isRequired };

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      accessor: PropTypes.string,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      sortable: PropTypes.bool,
      className: PropTypes.string,
      width: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  total: PropTypes.number,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  isLoading: PropTypes.bool,
  emptyIcon: PropTypes.elementType,
  emptyTitle: PropTypes.string,
  onExport: PropTypes.func,
  onRefresh: PropTypes.func,
  isRefreshing: PropTypes.bool,
};
