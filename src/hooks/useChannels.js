import { useQuery } from "@tanstack/react-query";
import { getChannels } from "@/services/channelsService";

export function useChannels(params) {
  return useQuery({
    queryKey: ["channels", params],
    queryFn: () => getChannels(params),
  });
}
