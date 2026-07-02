import { useState } from "react";
import {
  Loader2,
  Download,
  RefreshCw,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/shared/FileUploadZone";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getPTKDownloadUrl, triggerDownload } from "@/api/airfileapi";
import { useUploadPTK, useSyncPTK } from "@/hooks/useAirFile";

function StatBox({ label, value, colorClass }) {
  return (
    <div className="p-2 rounded-md bg-zinc-800 text-center">
      <p className={`text-base font-bold ${colorClass}`}>{value}</p>
      <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

export function AirFilePTKTab() {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [zoneKey, setZoneKey] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [logOpen, setLogOpen] = useState(false);

  const { mutate: uploadPTK, isPending: uploadPending } = useUploadPTK({
    onSuccess: (data) => {
      setUploadResult(data);
      setFile(null);
      setZoneKey((k) => k + 1);
      toast({
        variant: "success",
        title: "PTK uploaded",
        description: `${data.saved} created · ${data.updated} updated · ${data.skipped} skipped`,
      });
    },
    onError: (err) => {
      toast({
        title: "PTK upload failed",
        description: err?.error ?? err?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: syncPTK, isPending: syncPending } = useSyncPTK({
    onSuccess: (data) => {
      setSyncResult(data);
      toast({
        title: "Google Sheets synced",
        description: `${data.saved} created · ${data.updated} updated`,
      });
    },
    onError: (err) => {
      toast({
        title: "Sync failed",
        description: err?.error ?? err?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append("xlsx", file);
    uploadPTK(form);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* ── Card 1: Upload PTK xlsx ───────────────────────────────────────── */}
      <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Upload size={15} className="text-zinc-400" />
          <p className="text-sm font-medium text-zinc-100">Upload PTK Data</p>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Col A = House ID · Col B = Title. Upserts all rows into the database.
        </p>
        <form onSubmit={handleUpload} className="flex flex-col gap-3 flex-1">
          <FileUploadZone
            key={zoneKey}
            onFile={setFile}
            accept=".xlsx,.xls"
            hint=".xlsx or .xls (max 20 MB)"
          />
          <Button
            type="submit"
            disabled={!file || uploadPending}
            size="sm"
            className="bg-white text-black hover:bg-zinc-200"
          >
            {uploadPending ? (
              <>
                <Loader2 size={13} className="mr-1.5 animate-spin" />
                Uploading…
              </>
            ) : (
              "Upload PTK Data"
            )}
          </Button>
        </form>

        {uploadResult && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-1.5">
              <StatBox
                label="Created"
                value={uploadResult.saved}
                colorClass="text-emerald-400"
              />
              <StatBox
                label="Updated"
                value={uploadResult.updated}
                colorClass="text-blue-400"
              />
              <StatBox
                label="Skipped"
                value={uploadResult.skipped}
                colorClass="text-amber-400"
              />
            </div>
            {uploadResult.log?.length > 0 && (
              <Collapsible open={logOpen} onOpenChange={setLogOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    {logOpen ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                    View log ({uploadResult.log.length})
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ScrollArea className="h-32 mt-2 rounded-md bg-zinc-800 p-2">
                    {uploadResult.log.map((l, i) => (
                      <p
                        key={i}
                        className="text-[10px] font-mono text-zinc-400 leading-4"
                      >
                        {l}
                      </p>
                    ))}
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </div>

      {/* ── Card 2: Sync from Google Sheets ──────────────────────────────── */}
      <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={15} className="text-zinc-400" />
          <p className="text-sm font-medium text-zinc-100">
            Sync from Google Sheets
          </p>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed flex-1">
          Reads all tabs of the configured spreadsheet and upserts PTK records.
          Sheet columns: <span className="font-mono">media · ptk · ptk2</span>
        </p>
        <Button
          onClick={() => syncPTK()}
          disabled={syncPending}
          size="sm"
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:text-zinc-100 gap-1.5"
        >
          {syncPending ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Syncing…
            </>
          ) : (
            <>
              <RefreshCw size={13} />
              Sync Now
            </>
          )}
        </Button>
        {syncResult && (
          <div className="grid grid-cols-2 gap-1.5">
            <StatBox
              label="Created"
              value={syncResult.saved}
              colorClass="text-emerald-400"
            />
            <StatBox
              label="Updated"
              value={syncResult.updated}
              colorClass="text-blue-400"
            />
          </div>
        )}
      </div>

      {/* ── Card 3: Download PTK.txt ──────────────────────────────────────── */}
      <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Download size={15} className="text-zinc-400" />
          <p className="text-sm font-medium text-zinc-100">Download PTK File</p>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed flex-1">
          Generates <span className="font-mono">PTK_ENG_&lt;date&gt;.txt</span>{" "}
          from all DB records in playout-ready format.
        </p>
        <div className="rounded-md bg-zinc-800 border border-zinc-700 p-3">
          <p className="text-[10px] font-mono text-zinc-500 leading-4 break-all">
            D:\JioDemo\Content\TV PROGRAM 50 FPS\PRG1773294.mxf |&lt;ST 0&gt;
            Title
          </p>
        </div>
        <Button
          onClick={() => triggerDownload(getPTKDownloadUrl())}
          size="sm"
          className="bg-white text-black hover:bg-zinc-200 gap-1.5"
        >
          <Download size={13} />
          Download PTK_ENG.txt
        </Button>
      </div>
    </div>
  );
}
