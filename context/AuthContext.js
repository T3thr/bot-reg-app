// AuthContext.js

"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { signIn as nextAuthSignIn, getSession } from "next-auth/react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data
  const [role, setRole] = useState("user"); // Default role to "user"
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch the current session and user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const session = await getSession();
        if (session) {
          setUser(session.user);
          setRole(session.user.role || "user"); // Use role from session if available
        } else {
          setUser(null);
          setRole("user");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  const signupUser = async ({ username,  password, lineUserId }) => {
    try {
      setLoading(true);
      const { data, status } = await axios.post("/api/auth/signup", { username, password, lineUserId });
      setLoading(false);

      if (status === 201) {
        toast.success("Signup successful! Go to Home Page soon.", {
          autoClose: 3000,
          onClose: () => router.push("/"),
        });
        setUser(data.user); // Set user state after signup
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "Signup failed";
      toast.error(errorMessage);
    }
  };


  const clearErrors = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        error,
        loading,
        signupUser,
        setUser,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
