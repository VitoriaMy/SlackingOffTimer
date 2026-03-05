import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./global.scss";
import { SettingsStoreProvider } from "./store/settingsStore";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsStoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SettingsStoreProvider>
  </React.StrictMode>
);