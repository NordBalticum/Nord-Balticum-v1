"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase klientas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ✅ Konteksto sukūrimas
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeAuthSession();
  }, []);

  // ✅ Sesijos inicializacija
  const initializeAuthSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data?.session?.user) {
        setUser(data.session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Auth session error:", error);
      setUser(null);
    }
    setLoading(false);
  };

  // ✅ Prisijungimas per Magic Link (naudojama tik be wallet)
  const loginWithMagicLink = async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("❌ Magic Link error:", error);
      return false;
    }
  };

  // ✅ Atsijungimas (tik auth)
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithMagicLink,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hookas naudoti `user`, `login`, `logout`
export const useAuth = () => useContext(AuthContext);
