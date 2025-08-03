import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
//Login Form components
const LoginForm = () => {
  const [form, setForm] = useState({ name: "", email: "", studentId: "" });
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [triedRestore, setTriedRestore] = useState(false);
useEffect(() => {
  // Log when the form mounts and show current user
  console.log("LoginForm mounted, current user:", user);

  // If user is already logged in (has a name), redirect to home
  if (user && user.name) {
    navigate("/");
    return;
  }

  // If we haven't attempted restore yet, try to load user from localStorage
  if (!triedRestore) {
    const stored = localStorage.getItem("user"); // get stored user string
    if (stored) {
      const parsed = JSON.parse(stored); // parse to object
      if (parsed && parsed.name) {
        login(parsed); // perform login with restored user
        navigate("/"); // redirect to home
        return;
      }
    }
    setTriedRestore(true); // mark that restore was attempted
  }
}, [user, login, navigate, triedRestore]);

 
// Handle form submission
const onSubmit = (e) => {
  e.preventDefault(); // prevent default form reload
  if (form.name && form.email && form.studentId) {
    const userData = { ...form, progress: {} }; // build user object with empty progress
    login(userData); // save/login user in context/state
    navigate("/"); // redirect to home/dashboard
  }
};

// Simulated Google login flow
const handleGoogleLogin = () => {
  const googleUser = {
    name: "Adarsh Yadav",
    email: "adarsh@gmail.com",
    studentId: "GGL123",
    progress: {}, // start with empty progress
  };
  login(googleUser); // log in the Google user
  navigate("/"); // redirect after login
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-gray-800 dark:bg-gray-900 dark:text-white transition-all duration-300">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4"
      >
        <div className="flex justify-center">
          <img
            src="public/ChatGPT_Image_Jul_20__2025__04_55_44_PM-removebg-preview.png"
            alt="App Logo"
            className="h-16 w-16 rounded-full shadow mb-4"
          />
        </div>
        <h2 className="text-2xl font-bold text-center">
          BCA Learning Assistant
        </h2>
        <input
          type="text"
          required
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full p-2 border rounded dark:text-black"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full p-2 border rounded dark:text-black"
        />
        <input
          type="text"
          required
          placeholder="Student ID"
          value={form.studentId}
          onChange={(e) =>
            setForm((f) => ({ ...f, studentId: e.target.value }))
          }
          className="w-full p-2 border rounded dark:text-black"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
        >
          Start Learning
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full bg-white border p-2 rounded shadow hover:bg-gray-50 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200"
        >
          <FcGoogle className="mr-2 text-xl" /> Login with Google
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
