import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./app/globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppRouter } from "@/router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><BrowserRouter><ThemeProvider><AuthProvider><AppRouter/></AuthProvider></ThemeProvider></BrowserRouter></React.StrictMode>
);
