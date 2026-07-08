import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { PlaylistPage } from "@/features/playlist/PlaylistPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { ContentPage } from "@/features/content/ContentPage";
import { RetryPage } from "@/features/retry/RetryPage";
import { AirFilePage } from "@/features/airfile/AirFilePage";
import { AsrunPage } from "@/features/asrun/AsrunPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/playlist" element={<PlaylistPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/content" element={<ContentPage />} />
      <Route path="/retry" element={<RetryPage />} />
      <Route path="/airfile" element={<AirFilePage />} />
      <Route path="/asrun" element={<AsrunPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function AppWithRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
