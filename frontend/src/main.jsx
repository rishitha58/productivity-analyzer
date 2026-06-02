import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

// ⭐ NEW: Import StudyMode context
import { StudyModeProvider } from "./context/StudyModeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <StudyModeProvider>
        <App />
      </StudyModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);