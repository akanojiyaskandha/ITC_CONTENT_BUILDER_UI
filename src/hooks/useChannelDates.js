import { useQuery } from "@tanstack/react-query";
import { getChannelDates } from "@/services/channelsService";

export function useChannelDates(channel, params) {
  return useQuery({
    queryKey: ["channel-dates", channel, params],
    queryFn: () => getChannelDates(channel, params),
    enabled: Boolean(channel),
  });
}
