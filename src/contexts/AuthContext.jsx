import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole, setUserRole } from "@/services/firebaseService";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const role = await getUserRole(fbUser.uid);
        setUser({
          id: fbUser.uid,
          email: fbUser.email || "",
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
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

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await setUserRole(result.user.uid, role);
      return true;
    } catch (error: any) {
      console.error("Login error:", error.message);
      return false;
    }
  };

  const signup = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setUserRole(result.user.uid, role);
      return true;
    } catch (error: any) {
      console.error("Signup error:", error.message);
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
