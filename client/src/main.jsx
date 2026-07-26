import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";

import "./index.css";
import "react-loading-skeleton/dist/skeleton.css";
import AuthProvider from "./context/AuthContext";
import ThemeProvider from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { UserProvider } from "./context/UserContext";
import {
    NotificationProvider,
} from "./context/NotificationContext";


ReactDOM.createRoot(document.getElementById("root")).render(
   <AuthProvider>

    <ThemeProvider>

        <UserProvider>

            <NotificationProvider>

                <App />

            </NotificationProvider>

        </UserProvider>

    </ThemeProvider>

</AuthProvider>
);