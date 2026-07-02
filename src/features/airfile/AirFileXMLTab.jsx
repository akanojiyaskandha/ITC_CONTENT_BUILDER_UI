import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, CheckCircle2, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/shared/FileUploadZone";
import { useToast } from "@/hooks/use-toast";
import { useUploadXML } from "@/hooks/useAirFile";

export function AirFileXMLTab() {
  const shouldReduce = useReducedMotion();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [zoneKey, setZoneKey] = useState(0);
  const [success, setSuccess] = useState(false);

  const { mutate: upload, isPending } = useUploadXML({
    onSuccess: () => {
      setSuccess(true);
      setFile(null);
      setZoneKey((k) => k + 1);
      toast({
        title: "XML uploaded",
        variant: "success",
        description:
          "Timecodes stored — will auto-apply to future playlist processing.",
      });
    },
    onError: (err) => {
      toast({
        title: "XML upload failed",
        description: err?.error ?? err?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setSuccess(false);
    const form = new FormData();
    form.append("xml", file);
    upload(form);
  }

  return (
    <div className="max-w-lg">
      <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-zinc-800 shrink-0">
            <FileCode size={16} className="text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">
              Upload Oasys XML
            </p>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Parses <span className="font-mono">TrimIn / TrimOut</span> segment
              timecodes and stores them as SOM/EOM in the database. Auto-applied
              in playlist Step 2 when a matching House ID is found.
            </p>
          </div>
        </div>

        {/* XML format hint */}
        <div className="rounded-md bg-zinc-800 border border-zinc-700 p-3">
          <p className="text-[10px] font-mono text-zinc-500 leading-5">
            &lt;House_Number&gt; · &lt;Title&gt;
            <br />
            &lt;TrimIn&gt;00:00:00:00&lt;/TrimIn&gt;
            <br />
            &lt;TrimOut&gt;00:29:48:12&lt;/TrimOut&gt;
          </p>
        </div>

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FileUploadZone
            key={zoneKey}
            onFile={(f) => {
              setFile(f);
              setSuccess(false);
            }}
            accept=".xml"
            hint="Oasys .xml file from the playout system"
          />
          <Button
            type="submit"
            disabled={!file || isPending}
            className="self-start bg-white text-black hover:bg-zinc-200"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Uploading…
              </>
            ) : (
              "Upload XML"
            )}
          </Button>
        </form>

        {/* Success state */}
        {success && (
          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2.5 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-400">
                Stored successfully
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Timecodes will auto-apply to future playlist conversions (Step
                2).
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
