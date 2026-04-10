import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDocFromServer, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
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

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDocFromServer(doc(db, "userWdboard", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: uid,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          lastLogin: data.lastLogin?.toDate() || new Date(),
          avatar: data.avatar,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Only fetch profile if we don't already have it (avoids duplicate fetch after login)
        setUser(currentUser => {
          if (currentUser && currentUser.id === fbUser.uid) {
            setIsLoading(false);
            return currentUser;
          }
          // Defer Firestore call to avoid deadlock
          setTimeout(async () => {
            const profile = await fetchUserProfile(fbUser.uid);
            setUser(profile);
            setIsLoading(false);
          }, 0);
          return currentUser;
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log("[Auth] Login attempt for:", email);
    let userCredential;
    try {
      console.log("[Auth] Step 1: Calling signInWithEmailAndPassword...");
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("[Auth] Step 1 SUCCESS: Firebase auth passed, UID:", userCredential.user.uid);
    } catch (error: any) {
      console.error("[Auth] Step 1 FAILED: Auth error:", error.code, error.message);
      let errorMessage = "Login failed. Please try again.";
      if (error.code === "auth/user-not-found") errorMessage = "No account found with this email.";
      else if (error.code === "auth/wrong-password") errorMessage = "Incorrect password.";
      else if (error.code === "auth/invalid-email") errorMessage = "Invalid email address.";
      else if (error.code === "auth/too-many-requests") errorMessage = "Too many failed attempts. Please try again later.";
      else if (error.code === "auth/invalid-credential") errorMessage = "Invalid email or password.";
      return { success: false, error: errorMessage };
    }

    // Auth succeeded — fetch profile but don't fail login if Firestore errors
    try {
      console.log("[Auth] Step 2: Fetching user profile from Firestore...");
      let profile = await fetchUserProfile(userCredential.user.uid);
      if (!profile) {
        console.log("[Auth] Step 2: No profile found, creating new one...");
        const newProfile = {
          email: userCredential.user.email || email,
          name: userCredential.user.displayName || email.split("@")[0],
          role: "staff" as UserRole,
          avatarUrl: "",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        await setDoc(doc(db, "userWdboard", userCredential.user.uid), newProfile);
        console.log("[Auth] Step 2 SUCCESS: New profile created");
        profile = {
          id: userCredential.user.uid,
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.role,
          lastLogin: new Date(),
        };
      } else {
        console.log("[Auth] Step 2 SUCCESS: Profile loaded, role:", profile.role);
        setDoc(doc(db, "userWdboard", userCredential.user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true }).catch(() => {});
      }
      setUser(profile);
    } catch (profileError) {
      console.warn("[Auth] Step 2 FAILED: Profile fetch error, using fallback:", profileError);
      setUser({
        id: userCredential.user.uid,
        email: userCredential.user.email || email,
        name: userCredential.user.displayName || email.split("@")[0],
        role: "staff" as UserRole,
        lastLogin: new Date(),
      });
    }

    console.log("[Auth] Login complete");
    return { success: true };
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("[Auth] Register attempt:", email, "role:", role);
      console.log("[Auth] Step 1: Creating Firebase auth user...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[Auth] Step 1 SUCCESS: Auth user created, UID:", userCredential.user.uid);
      
      console.log("[Auth] Step 2: Creating Firestore profile...");
      await setDoc(doc(db, "userWdboard", userCredential.user.uid), {
        email,
        name,
        role,
        avatarUrl: "",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
      console.log("[Auth] Step 2 SUCCESS: Profile created");

      const profile: User = {
        id: userCredential.user.uid,
        email,
        name,
        role,
        lastLogin: new Date(),
      };

      setUser(profile);
      console.log("[Auth] Register complete");
      return { success: true };
    } catch (error: any) {
      console.error("[Auth] Register FAILED:", error.code, error.message);
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password must be at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
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
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
