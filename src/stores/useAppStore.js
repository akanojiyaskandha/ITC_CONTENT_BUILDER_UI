import { create } from "zustand";

export const useAppStore = create((set) => ({
  sidebarOpen: true,
  selectedChannel: null,
  selectedDate: null,
  selectedFolder: "Content",

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSelectedChannel: (channel) =>
    set({ selectedChannel: channel, selectedDate: null }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedFolder: (folder) => set({ selectedFolder: folder }),
}));
