// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.jsx";
// import "../index.css";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext"; // Yaha se fix karenge
import { ThemeProvider } from "./context/ThemeContext.jsx"; // Agar dark mode chahiye toh
import "../index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Pehle Auth Provider, phir Dark Mode Provider */}
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
