import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { supabase } from "./supabaseClient.js";

supabase.auth
  .getSession()
  .then(({ error }) => {
    if (error) {
      console.error("Supabase connection error:", error);
    } else {
      console.log("Supabase connected successfully.");
    }
  });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);