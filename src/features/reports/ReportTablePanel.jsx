import PropTypes from "prop-types";
import { useState } from "react";
import { useMissingReportRows } from "@/hooks/useMissingReportRows";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";

const COLUMNS = [
  { accessor: "channel",        label: "Channel",    width: "17%", className: "truncate" },
  { accessor: "playlistDate",   label: "Date",       width: "9%",  className: "truncate" },
  { accessor: "startTime",      label: "Start Time", width: "12%", className: "font-mono text-xs truncate" },
  { accessor: "type",           label: "Type",       width: "8%",  className: "truncate" },
  { accessor: "houseId",        label: "House ID",   width: "12%", className: "font-mono text-xs truncate" },
  {
    accessor: "title",
    label: "Title",
    width: "24%",
    render: (row) => (
      <span className="block truncate" title={row.title}>
        {row.title}
      </span>
    ),
  },
  { accessor: "expectedFolder", label: "Folder",     width: "9%",  className: "truncate" },
  {
    key: "status",
    accessor: "status",
    label: "Status",
    width: "9%",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function ReportTablePanel({ channel, date }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(200);

  const { data, isLoading, isFetching, refetch } = useMissingReportRows({ channel, date, page, limit: pageSize });

  return (
    <div className="h-full flex flex-col">
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
        searchPlaceholder="Search by house ID, title…"
        emptyTitle="No missing items for this date"
        onRefresh={refetch}
      />
    </div>
  );
}

ReportTablePanel.propTypes = {
  channel: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  reportType: PropTypes.string,
};
