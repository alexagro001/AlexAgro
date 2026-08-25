import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./styles/theme.css";
import "./styles/navbar.css";
import "./styles/leaf.css";
import "./styles/components.css";
import "./styles/admin.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
