// =============================================
// main.jsx — ENTRY POINT
// This is where React starts. It connects
// React to the HTML div with id="root"
// =============================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
