import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Falha ao encontrar o elemento root");

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);