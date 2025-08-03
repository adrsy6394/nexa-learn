import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
// navigation components
const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  // Sync dark mode state to DOM and persist choice
useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add("dark"); // enable dark class for styling
    localStorage.setItem("theme", "dark"); // remember preference
  } else {
    document.documentElement.classList.remove("dark"); // disable dark styling
    localStorage.setItem("theme", "light"); // remember light preference
  }
}, [darkMode]);

// Logout user and redirect to login page
const handleLogout = () => {
  logout();
  navigate("/login");
};

// Navigation links used in the UI
const navLinks = [
  { name: "Home", path: "/" },
  { name: "Flashcards", path: "/flashcards" },
  { name: "Learn", path: "/learning" },
  { name: "Progress", path: "/progress" },
];


  return (
    <>
      <nav className="bg-white dark:bg-gray-900 text-black dark:text-white shadow-xl px-4 py-3 flex justify-between items-center dark:shadow-slate-700 fixed w-full top-0 z-50">
        <div className="flex items-center space-x-4">
          <img
            onClick={() => navigate("/")}
            src="public/ChatGPT_Image_Jul_20__2025__04_55_44_PM-removebg-preview.png"
            alt="App Logo"
            className="cursor-pointer h-12 w-12 rounded-full shadow mb-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 hover:scale-110 relative top-0 md:h-16 md:w-16"
          />

          {/* Desktop links */}
          <div className="hidden md:flex space-x-4">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3 ">
          {/* Dark mode toggle (desktop hidden vs mobile) */}
          <div className="hidden md:block">
            <button
              aria-label="Toggle theme"
              onClick={() => setDarkMode((m) => !m)}
              className="mr-2 pt-2"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Auth buttons for desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user && user.name ? (
              <>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text font-bold text-xl">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile hamburger + theme toggle */}
          <div className="flex items-center md:hidden space-x-2">
            <button aria-label="Toggle theme" onClick={() => setDarkMode((m) => !m)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="focus:outline-none"
              onClick={() => setIsOpen((o) => !o)}
              aria-label="Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="absolute top-20 left-0 w-full bg-white dark:bg-gray-900 text-black dark:text-white flex flex-col space-y-2 p-4 shadow-md md:hidden z-50 items-center">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setIsOpen(false);
                }}
                className="w-full text-center px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {link.name}
              </button>
            ))}

            <div className="w-full flex justify-center">
              {user && user.name ? (
                <div className="flex flex-col items-center space-y-2 w-full">
                  <span className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text font-bold text-xl">
                    {user.name}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-600 w-full"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border w-full"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
