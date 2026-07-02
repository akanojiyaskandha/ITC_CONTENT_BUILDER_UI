import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDateFolder } from "@/services/channelsService";

export function useDeleteDateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channel, date }) => deleteDateFolder(channel, date),
    onSuccess: (_data, { channel }) => {
      queryClient.invalidateQueries({ queryKey: ["channel-dates", channel] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}
