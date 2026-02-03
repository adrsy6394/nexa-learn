// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext();

const DEFAULT_USER = { progress: {} }; // safe shape for UI

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null; // null = not logged in
  });

  // Initialize from Supabase session on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user ?? null;
        if (mounted && sessionUser) {
          // Minimal public user fields we care about (avoid storing secret tokens)
          const publicUser = {
            id: sessionUser.id,
            email: sessionUser.email,
            // optionally load profile below (name/studentId)
            progress: (JSON.parse(localStorage.getItem("user")) || {}).progress || {},
          };
          setUser(publicUser);
          localStorage.setItem("user", JSON.stringify(publicUser));
        } else if (mounted && !sessionUser) {
          // keep whatever local storage has, or null
          const stored = localStorage.getItem("user");
          if (!stored) setUser(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    }

    init();

    // subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const sUser = session?.user ?? null;
      if (sUser) {
        const publicUser = {
          id: sUser.id,
          email: sUser.email,
          progress: (JSON.parse(localStorage.getItem("user")) || {}).progress || {},
        };
        setUser(publicUser);
        localStorage.setItem("user", JSON.stringify(publicUser));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => {
      mounted = false;
      // safe unsubscribe
      try {
        listener?.subscription?.unsubscribe?.();
      } catch (e) {}
    };
  }, []);

  // Local persistence when user object changes (keeps UI fast)
  useEffect(() => {
    if (user === null) {
      localStorage.removeItem("user");
    } else {
      // only store safe public fields
      const toStore = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        studentId: user.studentId,
        progress: user.progress || {},
      };
      localStorage.setItem("user", JSON.stringify(toStore));
    }
  }, [user]);

  // Signup: create auth user, then insert profile row (profiles table)
  const signUp = useCallback(async ({ email, password, full_name, studentId }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;

      const authUser = data.user;
      if (!authUser) {
        // In some flows (magic links) session may be null — still create profile after confirmation
        return { success: true, message: "Check your email to confirm signup (if using email confirmations)." };
      }

      // create profile row (id = auth.user.id)
      const profile = {
        id: authUser.id,
        full_name,
        student_id: studentId,
      };

      const { error: profileError } = await supabase.from("profiles").upsert(profile, { returning: "minimal" });

      if (profileError) {
        console.warn("Profile insert error (non-fatal):", profileError.message);
      }

      // set minimal client-side user (you may later fetch profile to show name)
      const publicUser = { id: authUser.id, email: authUser.email, full_name, studentId, progress: {} };
      setUser(publicUser);
      return { success: true };
    } catch (err) {
      console.error("SignUp error:", err);
      return { success: false, error: err.message || err };
    }
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const authUser = data.user;
      const publicUser = { id: authUser.id, email: authUser.email, progress: {} };

      // Try load profile for name/studentId
      const { data: profile, error: profError } = await supabase
        .from("profiles")
        .select("full_name, student_id")
        .eq("id", authUser.id)
        .single();

      if (profError) {
        // not fatal, continue with minimal user
      } else if (profile) {
        publicUser.full_name = profile.full_name;
        publicUser.studentId = profile.student_id;
      }

      setUser(publicUser);
      return { success: true };
    } catch (err) {
      console.error("SignIn error:", err);
      return { success: false, error: err.message || err };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("user");
      return { success: true };
    } catch (err) {
      console.error("SignOut error:", err);
      return { success: false, error: err.message || err };
    }
  }, []);

  // Mark a topic learned locally and attempt to sync to DB (progress table)
  const markTopicAsLearned = useCallback(
    async (semester, subject, unit, topic) => {
      // update local UI first
      setUser((prev) => {
        const base = prev && typeof prev === "object" ? { ...prev } : { ...DEFAULT_USER };

        if (!base.progress) base.progress = {};
        if (!base.progress[semester]) base.progress[semester] = {};
        if (!base.progress[semester][subject]) base.progress[semester][subject] = {};
        if (!base.progress[semester][subject][unit]) base.progress[semester][subject][unit] = [];

        if (!base.progress[semester][subject][unit].includes(topic)) {
          base.progress[semester][subject][unit].push(topic);
        }

        // persist minimal
        localStorage.setItem("user", JSON.stringify(base));
        return base;
      });

      // attempt DB sync if user is signed in
      try {
        const currentUser = (user && user.id) || JSON.parse(localStorage.getItem("user"))?.id;
        if (!currentUser) return { success: false, message: "Not logged in; progress saved locally." };

        const payload = {
          user_id: currentUser,
          semester,
          subject,
          unit,
          topic,
          completed: true,
        };

        // upsert requires unique constraint defined on (user_id, semester, subject, unit, topic)
        const { error } = await supabase.from("progress").upsert(payload, { onConflict: "(user_id,semester,subject,unit,topic)" });
        if (error) {
          console.warn("Progress DB sync failed:", error.message);
          return { success: false, message: "Saved locally; DB sync failed." };
        }
        return { success: true };
      } catch (err) {
        console.error("Progress sync exception:", err);
        return { success: false, message: "Saved locally; DB sync failed." };
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        signUp,
        signIn,
        signOut,
        markTopicAsLearned,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// helper hook
export const useAuth = () => useContext(AuthContext);
