import { useState } from "react";
import PropTypes from "prop-types";
import { Download, FileWarning, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { downloadReport } from "@/services/reportsService";
import { useDeleteReport } from "@/hooks/useDeleteReport";
import { useRevalidateReport } from "@/hooks/useRevalidateReport";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/utils/formatters";

export function ReportsListPanel({ reports = [], selected = null, onSelect, onDeleted = undefined, isLoading = false }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [revalidatingId, setRevalidatingId] = useState(null);
  const { mutate: deleteReport, isPending: isDeleting } = useDeleteReport();
  const { mutate: revalidate } = useRevalidateReport();
  const { toast } = useToast();

  function handleRevalidate(e, report) {
    e.stopPropagation();
    if (revalidatingId) return;
    setRevalidatingId(report.fileName);
    revalidate(report.playlistDate, {
      onSuccess: (res) => {
        toast({ title: `Revalidation done. Found: ${res.data.found}, Still Missing: ${res.data.stillMissing}` });
        setRevalidatingId(null);
      },
      onError: () => {
        toast({ title: "Revalidation failed.", variant: "destructive" });
        setRevalidatingId(null);
      },
    });
  }

  async function handleDownload(e, report) {
    e.stopPropagation();
    if (downloadingId) return;
    setDownloadingId(report.fileName);
    try {
      const blob = await downloadReport(report.playlistDate, report.reportType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = report.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Failed to download report.", variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  }

  function handleDeleteConfirm() {
    deleteReport({ date: pendingDelete.playlistDate, type: pendingDelete.reportType }, {
      onSuccess: () => {
        toast({ title: `Report ${pendingDelete.fileName} deleted.` });
        if (selected === pendingDelete.fileName) onDeleted?.();
        setPendingDelete(null);
      },
      onError: (err) => {
        toast({ title: err.message ?? "Failed to delete report.", variant: "destructive" });
        setPendingDelete(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-zinc-900 rounded-lg border border-zinc-800" />
        ))}
      </div>
    );
  }

  if (!reports?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
        <FileWarning size={20} className="text-zinc-500" />
        <p className="text-sm text-zinc-400">No reports found</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {reports.map((report) => (
          <div
            key={report.fileName}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors cursor-pointer",
              selected === report.fileName
                ? "border-zinc-600 bg-zinc-800"
                : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800/50"
            )}
            onClick={() => onSelect(report)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(report)}
            aria-selected={selected === report.fileName}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-100">{report.fileName}</p>
              <p className="text-xs text-zinc-500">
                {report.recordCount} records · {formatDateTime(report.updatedAt)}
              </p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
                aria-label={`Revalidate ${report.playlistDate} report`}
                disabled={revalidatingId === report.fileName}
                onClick={(e) => handleRevalidate(e, report)}
                title="Re-check missing items against S3"
              >
                <RefreshCw size={13} className={revalidatingId === report.fileName ? "animate-spin" : ""} />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-700"
                aria-label={`Download ${report.fileName}`}
                disabled={downloadingId === report.fileName}
                onClick={(e) => handleDownload(e, report)}
              >
                <Download size={13} />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                aria-label={`Delete ${report.playlistDate} report`}
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete(report);
                }}
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Delete report?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will permanently delete the{" "}
              <span className="font-mono text-zinc-200">{pendingDelete?.fileName}</span> missing report from
              the server. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

ReportsListPanel.propTypes = {
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      playlistDate: PropTypes.string.isRequired,
      fileName: PropTypes.string,
      recordCount: PropTypes.number,
      updatedAt: PropTypes.string,
    })
  ),
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onDeleted: PropTypes.func,
  isLoading: PropTypes.bool,
};
