import { useQuery } from "@tanstack/react-query";
import { getContent } from "@/services/contentService";

export function useContent(params) {
  return useQuery({
    queryKey: ["content", params],
    queryFn: () => getContent(params),
    enabled: Boolean(params?.channel && params?.date && params?.folder),
  });
}
