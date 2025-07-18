import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "nprogress/nprogress.css";
import App from "./App.tsx";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful:', registration);
      },
      (err) => {
        console.log('ServiceWorker registration failed:', err);
      }
    );
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
