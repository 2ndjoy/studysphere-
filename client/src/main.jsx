import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";

import "./index.css";
import "react-loading-skeleton/dist/skeleton.css";
import AuthProvider from "./context/AuthContext";
import ThemeProvider from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
        <ErrorBoundary>

    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </AuthProvider></ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);