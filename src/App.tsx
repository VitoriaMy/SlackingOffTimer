import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/home/page";
import { TrendsPage } from "@/pages/trends/page";
import { SettingsPage } from "@/pages/settings/page";
import { AnimationsPage } from "@/pages/animations/page";
import { ComponentsPage } from "@/pages/components/page";
import { StautsPage } from "@/pages/status/page";
import { useSlackRecord } from "@/hooks/useSlackRecord";

export function App() {
  const { recordSlackSwitch, currentSwitchState } = useSlackRecord();
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage
          recordSlackSwitch={recordSlackSwitch}
          currentSwitchState={currentSwitchState}
        />}
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
      <Route path="/status" element={<StautsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
