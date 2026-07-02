import PropTypes from "prop-types";
import { Tv2, FileX, CheckCircle2, FolderOpen } from "lucide-react";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";

const STAT_CONFIG = [
  {
    key: "totalChannels",
    label: "Total Channels",
    icon: Tv2,
    description: "Active GCS channel folders",
  },
  {
    key: "totalContentFiles",
    label: "Content Files",
    icon: FolderOpen,
    description: "MXF files across all channels",
  },
  {
    key: "totalMissingFiles",
    label: "Missing Files",
    icon: FileX,
    description: "Files not found in GCS",
    variant: "danger",
  },
  {
    key: "totalRecoveredFiles",
    label: "Recovered Files",
    icon: CheckCircle2,
    description: "Copied to MissingContent",
    variant: "success",
  },
];

export function StatsGrid({ stats = null, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIG.map((c) => (
          <StatCardSkeleton key={c.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_CONFIG.map(({ key, label, icon, description, variant }) => (
        <StatCard
          key={key}
          label={label}
          value={stats?.[key] ?? 0}
          icon={icon}
          description={description}
          variant={variant}
        />
      ))}
    </div>
  );
}

StatsGrid.propTypes = {
  stats: PropTypes.shape({
    totalChannels: PropTypes.number,
    totalContentFiles: PropTypes.number,
    totalMissingFiles: PropTypes.number,
    totalRecoveredFiles: PropTypes.number,
  }),
  isLoading: PropTypes.bool,
};
