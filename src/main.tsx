// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { LanguageProvider } from "./context/LanguageContext";
import { DebugProvider } from "./context/DebugContext";

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <LanguageProvider>
      <DebugProvider>
        <App />
      </DebugProvider>
    </LanguageProvider>
  </StrictMode>
);

// ---- Service Worker registration ----
if ("serviceWorker" in navigator) {
  // on attend que la page soit chargée
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[SW] registered:", registration);
      })
      .catch((error) => {
        console.log("[SW] registration failed:", error);
      });
  });
}
