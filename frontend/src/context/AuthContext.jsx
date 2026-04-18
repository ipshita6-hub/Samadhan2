import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Get user role from backend
        try {
          const token = await currentUser.getIdToken();
          const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            method: "GET",
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("User role from backend:", data.role);
            setUserRole(data.role || "student");
          } else {
            // If backend returns error, try to determine role from localStorage or email
            const storedRole = localStorage.getItem(`user_role_${currentUser.uid}`);
            if (storedRole) {
              console.log("Using stored role:", storedRole);
              setUserRole(storedRole);
            } else {
              // Default based on email
              const role = currentUser.email?.includes("admin") ? "admin" : "student";
              console.log("Defaulting to role based on email:", role);
              setUserRole(role);
            }
          }
        } catch (error) {
          // If backend is not available, default to student role
          const storedRole = localStorage.getItem(`user_role_${currentUser.uid}`);
          if (storedRole) {
            console.log("Using stored role:", storedRole);
            setUserRole(storedRole);
          } else {
            const role = currentUser.email?.includes("admin") ? "admin" : "student";
            console.log("Backend unavailable, defaulting to role based on email:", role);
            setUserRole(role);
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
