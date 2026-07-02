import PropTypes from "prop-types";

export function PageHeader({ title, description = null, actions = null }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
        {description && (
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 ml-4 shrink-0">{actions}</div>}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
};
