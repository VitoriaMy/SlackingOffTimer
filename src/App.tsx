import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/home/page";
import { TrendsPage } from "@/pages/trends/page";
import { SettingsPage } from "@/pages/settings/page";
import { AnimationsPage } from "@/pages/animations/page";
import { ComponentsPage } from "@/pages/components/page";


export function App() {

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />
      <Route
        path="/trends"
        element={<TrendsPage />}
      />
      <Route
        path="/settings/*"
        element={<SettingsPage />}
      />
      <Route
        path="/animations"
        element={<AnimationsPage />}
      />
      <Route path="/components" element={<ComponentsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
