// import React from "react";
// import { useAuth } from "../../context/AuthContext";

// const Navbar = ({ title }) => {
//   const { user } = useAuth();

//   return (
//     <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//       <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
//       <div className="flex items-center gap-4">
//         <span className="text-sm text-gray-500">
//           Welcome, <strong>{user?.name}</strong>
//         </span>
//         <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
//           {user?.name?.charAt(0)}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;

import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; // ← NEW

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme(); // ← NEW

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        {title}
      </h2>
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xl"
          title="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          Welcome, <strong>{user?.name}</strong>
        </span>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
