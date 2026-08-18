import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
} from "react-router";

import {
  AuthProvider,
} from "./auth/AuthContext";

import App from "./App.jsx";

import "./index.css";
import "./App.css";
import "./theme.css";


createRoot(
  document.getElementById(
    "root"
  )
).render(
  <StrictMode>

    <BrowserRouter>

      <AuthProvider>

        <App />

      </AuthProvider>

    </BrowserRouter>

  </StrictMode>
);