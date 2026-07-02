
export const getStatusColor = (status) => {
  switch (status) {
    case "LIVE":
      return "bg-red-500 hover:bg-red-600";
    case "COMPLETED":
      return "bg-green-500 hover:bg-green-600";
    case "NOT_STARTED":
      return "bg-blue-500 hover:bg-blue-600";
      case "INACTIVE":
        return "bg-amber-400 hover:bg-amber-400";
      case "ACTIVE":
        return "bg-blue-600 hover:bg-blue-600";
    case "ALLOCATED":
      return "bg-emerald-600/10 dark:bg-emerald-600/20 hover:bg-emerald-600/10 text-emerald-500";
    case "DEALLOCATED":
      return "bg-red-600/10 dark:bg-red-600/20 hover:bg-red-600/10 text-red-500";
    case "NOTALLOCATED":
      return "bg-amber-600/10 dark:bg-amber-600/20 hover:bg-amber-600/10 text-amber-500";
    default:
      return "bg-gray-600/10 dark:bg-gray-600/20 hover:bg-gray-600/10 text-gray-500";
  }
};

export const getStatusDotColor = (status) => {
  switch (status) {
    case "LIVE":
      return "bg-red-500";
    case "COMPLETED":
      return "bg-emerald-500";
    case "NOT_STARTED":
      return "bg-blue-500";
    case "ALLOCATED":
      return "bg-emerald-500";
    case "DEALLOCATED":
      return "bg-red-500";
    case "NOTALLOCATED":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
};