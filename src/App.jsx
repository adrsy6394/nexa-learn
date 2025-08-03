import React, { useContext } from "react";
import { AuthContext } from "./context/AuthContext"; // global auth state provider
import { Routes, Route, Navigate, useLocation } from "react-router-dom"; // routing utilities
import LoginForm from "./components/auth/LoginForm"; // login page
import Navigation from "./components/common/Navigation"; // top navigation bar
import HomePage from "./pages/HomePage"; // home page component
import LearningPage from "./pages/LearningPage"; // learning/AI Q&A page
import FlashcardsPage from "./pages/FlashcardsPage"; // flashcards page
import ProgressPage from "./pages/ProgressPage"; // progress tracking page

const App = () => {
  // Access current user and loading state from context
  const { user, loading } = useContext(AuthContext);
  const location = useLocation(); // get current route path

  // If still loading user data, show a full-screen loading message
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // If user is NOT logged in and is trying to visit a non-login page → redirect to /login
  if (!user || !user.name) {
    if (location.pathname !== "/login") {
      return <Navigate to="/login" replace />;
    }
    return <LoginForm />; // show login form when at /login
  }

  // If user IS logged in but tries to go to /login → redirect to home
  if (user && user.name && location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  // Authenticated user view → show navigation and all routes
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation /> {/* navigation bar */}

      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/progress" element={<ProgressPage />} />

        {/* fallback for unknown routes → redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
