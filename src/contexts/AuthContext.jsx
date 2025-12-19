import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { getUserRole, setUserRole } from "@/services/firebaseService";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const role = await getUserRole(fbUser.uid);

        setUser({
          id: fbUser.uid,
          email: fbUser.email || "",
          name:
            fbUser.displayName ||
            (fbUser.email ? fbUser.email.split("@")[0] : "User"),
          role: role || "staff",
          lastLogin: new Date(),
          avatar: fbUser.photoURL || undefined,
        });
      } else {
        setFirebaseUser(null);
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password, role) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await setUserRole(result.user.uid, role);
      return true;
    } catch (error) {
      console.error("Login error:", error?.message || error);
      return false;
    }
  };

  const signup = async (email, password, role) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setUserRole(result.user.uid, role);
      return true;
    } catch (error) {
      console.error("Signup error:", error?.message || error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
