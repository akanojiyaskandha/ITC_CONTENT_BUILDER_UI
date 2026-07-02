import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMissingReports } from "@/hooks/useMissingReports";
import { useRetryMissing } from "@/hooks/useRetryMissing";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { DATE_FORMAT_HINT } from "@/utils/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = yup.object({
  playlistDate: yup.string().required("Date is required"),
});

export function RetryForm({ onJobStarted }) {
  const { toast } = useToast();
  const { data: reports } = useMissingReports();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  const { mutate, isPending } = useRetryMissing({
    onSuccess: ({ jobId }) => {
      toast({ title: "Retry job started", description: `Job ID: ${jobId}` });
      reset();
      onJobStarted(jobId);
    },
    onError: (err) => {
      toast({
        title: err.message ?? "Failed to start retry",
        variant: "destructive",
      });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutate({ playlistDate: values.playlistDate }))}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-zinc-400">Select Date from Report</Label>
        <Select onValueChange={(v) => setValue("playlistDate", v)}>
          <SelectTrigger className="h-9 bg-zinc-900 border-zinc-700 text-zinc-100 text-sm">
            <SelectValue placeholder="Pick a date…" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            {reports?.filter((r) => r.reportType === "missing").map((r) => (
              <SelectItem key={r.playlistDate} value={r.playlistDate} className="text-sm text-zinc-100 focus:bg-zinc-800">
                {r.playlistDate}
                <span className="text-zinc-500 ml-2 text-xs">({r.recordCount} missing)</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs text-zinc-600">or enter manually</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-zinc-400">Playlist Date</Label>
        <Input
          {...register("playlistDate")}
          placeholder={DATE_FORMAT_HINT}
          className="bg-zinc-900 border-zinc-700 text-zinc-100"
          aria-describedby={errors.playlistDate ? "date-error" : undefined}
        />
        {errors.playlistDate && (
          <p id="date-error" className="text-xs text-red-400">
            {errors.playlistDate.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="self-start bg-white text-black hover:bg-zinc-200"
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Starting…
          </>
        ) : (
          "Start Retry"
        )}
      </Button>
    </form>
  );
}

RetryForm.propTypes = {
  onJobStarted: PropTypes.func.isRequired,
};
