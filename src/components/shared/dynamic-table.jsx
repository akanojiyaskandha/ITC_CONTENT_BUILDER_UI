import { useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Utils ──────────────────────────────────────────────────────── */

const humanizeKey = (key) =>
  key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();

const isPrimitive = (v) =>
  v === null || v === undefined || ["string", "number", "boolean"].includes(typeof v);

const isDateLike = (v) => {
  if (!v) return false;
  if (v instanceof Date && !isNaN(v.getTime())) return true;
  if (typeof v === "number") return v > 1_000_000_000;
  if (typeof v === "string")
    return /^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{4}-\d{2}-\d{2}T/.test(v);
  return false;
};

const getAutoHeaders = (data) => {
  if (!data.length) return [];
  const keys = Object.keys(data[0]).filter((k) => data.some((r) => isPrimitive(r[k])));
  const dateKey = keys.find((k) => data.some((r) => isDateLike(r[k])));
  return dateKey ? [dateKey, ...keys.filter((k) => k !== dateKey)] : keys;
};

const SortIcon = ({ field, sortFields = [], sortOrders = [] }) => {
  const idx = sortFields.indexOf(field);
  if (idx === -1) return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />;
  return sortOrders[idx] === "asc"
    ? <ArrowUp   className="ml-1 h-3 w-3 text-primary" />
    : <ArrowDown className="ml-1 h-3 w-3 text-primary" />;
};

/* ── DynamicTable ───────────────────────────────────────────────── */
/**
 * Props (Simple mode):
 *   data, cellRenderers?, sortable?, emptyText?
 *
 * Props (Advanced mode):
 *   data, columns, renderCell, loading?, sortFields?, sortOrders?,
 *   toggleSort?, emptyText?
 *
 * ColumnConfig: { key, filter?, frozen?, frozenPosition?: "left"|"right", width? }
 */
export default function DynamicTable(props) {
  const isAdvanced = "columns" in props;
  const isAllMode  = isAdvanced && props.columns.length === 1 && props.columns[0].key === "all";

  /* headers */
  const headers = useMemo(() => {
    if (!isAdvanced) return getAutoHeaders(props.data);
    if (isAllMode) {
      const auto = getAutoHeaders(props.data);
      return auto.length ? [...auto, "actions"] : [];
    }
    return props.columns.map((c) => c.key);
  }, [props.data, isAdvanced, isAllMode, isAdvanced && props.columns]);

  /* columnMap */
  const columnMap = useMemo(() => {
    if (!isAdvanced) return {};
    if (isAllMode) {
      return Object.fromEntries(
        headers.map((k) => [
          k,
          k === "actions"
            ? { key: k, filter: false, frozen: true, frozenPosition: "right" }
            : { key: k, filter: true, frozen: false },
        ])
      );
    }
    return Object.fromEntries(props.columns.map((c) => [c.key, c]));
  }, [isAdvanced, isAllMode, headers, isAdvanced && props.columns]);

  /* split frozen / scrollable */
  const { left, mid, right } = useMemo(() => {
    if (!isAdvanced)
      return { left: [], mid: headers, right: [] };
    const l = [], m = [], r = [];
    headers.forEach((k) => {
      const col = columnMap[k];
      if (col?.frozen) {
        col.frozenPosition === "right" ? r.push(k) : l.push(k);
      } else {
        m.push(k);
      }
    });
    return { left: l, mid: m, right: r };
  }, [headers, columnMap, isAdvanced]);

  const renderOrder = [...left, ...mid, ...right];

  /* offset helpers */
  const leftOffset = (key) => {
    const idx = left.indexOf(key);
    return left.slice(0, idx).reduce((s, k) => s + (columnMap[k]?.width || 150), 0);
  };
  const rightOffset = (key) => {
    const idx = right.indexOf(key);
    return right.slice(idx + 1).reduce((s, k) => s + (columnMap[k]?.width || 150), 0);
  };
  const colWidth = (key) => columnMap[key]?.width ? `${columnMap[key].width}px` : "auto";

  const frozenStyle = (key) => ({
    ...(left.includes(key)  ? { left:  `${leftOffset(key)}px`,  minWidth: colWidth(key), width: colWidth(key) } : {}),
    ...(right.includes(key) ? { right: `${rightOffset(key)}px`, minWidth: colWidth(key), width: colWidth(key) } : {}),
    ...(!left.includes(key) && !right.includes(key) && columnMap[key]?.width
      ? { maxWidth: `${columnMap[key].width}px`, width: `${columnMap[key].width}px` }
      : {}),
  });

  /* per-cell sticky classes — head vs body differ only in bg */
  const stickyClass = (key, isHead) => {
    const isLeft  = left.includes(key);
    const isRight = right.includes(key);
    if (!isLeft && !isRight) return "";
    return cn(
      "sticky",
      isLeft  && (isHead ? "z-30" : "z-10"),
      isRight && (isHead ? "z-30" : "z-10"),
      isHead  ? "bg-muted" : "bg-card",
      isLeft  && left.indexOf(key)  === left.length  - 1 && "border-r border-border",
      isRight && right.indexOf(key) === 0                && "border-l border-border",
    );
  };

  if (!headers.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {props.emptyText ?? "No data available"}
      </p>
    );
  }

  const hasData = props.data.length > 0;

  return (
    <div className={cn("relative overflow-auto rounded-xl border border-border [&>div]:!overflow-visible", props.className)}>
      <Table className="border-collapse">

        {/* ── Header ── */}
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent bg-muted/30">
            {renderOrder.map((key) => {
              const sortable = isAdvanced && !!columnMap[key]?.filter;
              return (
                <TableHead
                  key={key}
                  onClick={() => sortable && props.toggleSort?.(key)}
                  className={cn(
                    "sticky top-0 z-20 bg-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
                    sortable && "cursor-pointer select-none hover:text-primary transition-colors",
                    stickyClass(key, true),
                  )}
                  style={frozenStyle(key)}
                >
                  {sortable ? (
                    <span className="inline-flex items-center">
                      {humanizeKey(key)}
                      <SortIcon
                        field={key}
                        sortFields={props.sortFields}
                        sortOrders={props.sortOrders}
                      />
                    </span>
                  ) : (
                    humanizeKey(key)
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        {/* ── Body ── */}
        <TableBody>
          {isAdvanced && props.loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-border">
                {renderOrder.map((key) => (
                  <TableCell
                    key={key}
                    className={cn("px-4 py-3", stickyClass(key, false))}
                    style={frozenStyle(key)}
                  >
                    <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !hasData ? (
            <TableRow className="border-border hover:bg-transparent">
              <TableCell
                colSpan={renderOrder.length}
                className="py-12 text-center text-sm text-muted-foreground"
              >
                {props.emptyText ?? "No data available"}
              </TableCell>
            </TableRow>
          ) : (
            props.data.map((row, i) => (
              <TableRow key={i} className={cn("border-border hover:bg-muted/20 transition-colors", props.rowClassName?.(row))}>

                {renderOrder.map((key) => (
                  <TableCell
                    key={key}
                    className={cn(
                      "px-4 py-3 text-sm text-foreground whitespace-nowrap",
                      columnMap[key]?.truncate && "overflow-hidden",
                      stickyClass(key, false),
                    )}
                    style={frozenStyle(key)}
                  >
                    {(() => {
                      const content = isAdvanced
                        ? props.renderCell(key, row)
                        : props.cellRenderers?.[key]
                        ? props.cellRenderers[key](row[key], row)
                        : (row[key] ?? "-");
                      return columnMap[key]?.truncate ? (
                        <div className="truncate" title={String(row[key] ?? "")}>{content}</div>
                      ) : content;
                    })()}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
