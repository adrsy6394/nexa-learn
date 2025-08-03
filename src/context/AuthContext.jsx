// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";

// Create auth context
export const AuthContext = createContext();

const DEFAULT_USER = { progress: {} };

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if exists, otherwise default user
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : { ...DEFAULT_USER };
  });

  // Keep localStorage in sync with user state
  useEffect(() => {
    if (user === null) {
      localStorage.removeItem("user"); // clear if logged out fully
    } else {
      localStorage.setItem("user", JSON.stringify(user)); // persist updated user
    }
  }, [user]);

  // Login setter
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Logout resets to default safe shape (not null)
  const logout = useCallback(() => {
    setUser({ ...DEFAULT_USER });
  }, []);

  // Mark a topic as learned inside nested progress structure
  const markTopicAsLearned = useCallback(
    (semester, subject, unit, topic) => {
      setUser((prevUser) => {
        // Clone previous user or fallback to default shape
        const updatedUser =
          prevUser && typeof prevUser === "object" ? { ...prevUser } : { ...DEFAULT_USER };

        if (!updatedUser.progress) updatedUser.progress = {};
        const progress = updatedUser.progress;

        // Ensure nested objects exist
        if (!progress[semester]) progress[semester] = {};
        if (!progress[semester][subject]) progress[semester][subject] = {};
        if (!progress[semester][subject][unit]) progress[semester][subject][unit] = [];

        // Add topic if not already marked
        if (!progress[semester][subject][unit].includes(topic)) {
          progress[semester][subject][unit].push(topic);
        }

        return updatedUser;
      });
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        markTopicAsLearned,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
