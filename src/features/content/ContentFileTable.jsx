import PropTypes from "prop-types";
import { useState } from "react";
import { useContent } from "@/hooks/useContent";
import { DataTable } from "@/components/shared/DataTable";
import { formatFileSize, formatDateTime } from "@/utils/formatters";

const COLUMNS = [
  {
    accessor: "fileName",
    label: "File Name",
    width: "55%",
    render: (row) => (
      <span className="font-mono text-xs text-zinc-300 block truncate" title={row.key}>
        {row.fileName}
      </span>
    ),
  },
  {
    accessor: "size",
    label: "Size",
    width: "15%",
    render: (row) => (
      <span className="text-xs text-zinc-400">{formatFileSize(row.size)}</span>
    ),
  },
  {
    accessor: "lastModified",
    label: "Last Modified",
    width: "30%",
    render: (row) => (
      <span className="text-xs text-zinc-400">{formatDateTime(row.lastModified)}</span>
    ),
  },
];

export function ContentFileTable({ channel, date, folder }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(200);

  const { data, isLoading, isFetching, refetch } = useContent({ channel, date, folder, page, limit: pageSize });

  return (
    <div className="h-full flex flex-col">
      <DataTable
        columns={COLUMNS}
        data={data?.files ?? []}
        total={data?.total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
        isRefreshing={isFetching}
        searchPlaceholder="Search files…"
        emptyTitle="No files in this folder"
        onRefresh={refetch}
      />
    </div>
  );
}

ContentFileTable.propTypes = {
  channel: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  folder: PropTypes.string.isRequired,
};
