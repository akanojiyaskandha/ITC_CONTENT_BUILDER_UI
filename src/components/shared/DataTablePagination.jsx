import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function DataTablePagination({ pagination, setPagination }) {
  const { pageNo, pageSize, totalItems, totalPages } = pagination;
  const startItem = totalItems === 0 ? 0 : pageNo * pageSize + 1;
  const endItem = Math.min((pageNo + 1) * pageSize, totalItems);

  const visiblePages = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, i) => i)
    : buildPageWindow(pageNo, totalPages);

  function go(n) {
    setPagination((prev) => ({ ...prev, pageNo: Math.max(0, Math.min(totalPages - 1, n)) }));
  }

  return (
    <div className="flex items-center justify-between gap-4 shrink-0">
      <span className="text-xs text-zinc-500 shrink-0">
        {startItem}–{endItem} of {totalItems}
      </span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500 whitespace-nowrap">Rows per page</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(v) => setPagination((prev) => ({ ...prev, pageSize: Number(v), pageNo: 0 }))}
          >
            <SelectTrigger className="h-7 w-16 border-zinc-800 bg-zinc-900 text-xs text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {[10, 20, 50, 100, 200].map((s) => (
                <SelectItem key={s} value={`${s}`} className="text-xs text-zinc-100 focus:bg-zinc-800">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-zinc-500 whitespace-nowrap">Page {pageNo + 1} of {totalPages}</span>

        <div className="flex items-center gap-0.5">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => go(0)} disabled={pageNo === 0} aria-label="First page">
            <ChevronsLeft size={13} />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => go(pageNo - 1)} disabled={pageNo === 0} aria-label="Previous page">
            <ChevronLeft size={13} />
          </Button>

          {visiblePages.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-zinc-600">…</span>
            ) : (
              <Button
                key={p}
                variant="outline"
                size="sm"
                onClick={() => go(p)}
                className={cn(
                  "h-7 w-7 p-0 text-xs border-zinc-800",
                  p === pageNo
                    ? "bg-white text-black hover:bg-zinc-100 border-white"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                )}
              >
                {p + 1}
              </Button>
            )
          )}

          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => go(pageNo + 1)} disabled={pageNo >= totalPages - 1} aria-label="Next page">
            <ChevronRight size={13} />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => go(totalPages - 1)} disabled={pageNo >= totalPages - 1} aria-label="Last page">
            <ChevronsRight size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildPageWindow(current, total) {
  const pages = [0];
  if (current > 2) pages.push("…");
  for (let p = Math.max(1, current - 1); p <= Math.min(total - 2, current + 1); p++) pages.push(p);
  if (current < total - 3) pages.push("…");
  if (total > 1) pages.push(total - 1);
  return pages;
}

DataTablePagination.propTypes = {
  pagination: PropTypes.shape({
    pageNo: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    totalItems: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
  setPagination: PropTypes.func.isRequired,
};
