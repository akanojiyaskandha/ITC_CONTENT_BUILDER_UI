import PropTypes from "prop-types";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ icon: Icon = null, title, description = null, action = null }) {
  const IconComponent = Icon ?? Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800">
        <IconComponent size={20} className="text-zinc-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-300">{title}</p>
        {description && (
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <Button
          size="sm"
          variant="outline"
          className="mt-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
};
