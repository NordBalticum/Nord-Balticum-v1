"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/utils/SupabaseClient"; // ✅ Supabase klientas

// ✅ Konteksto sukūrimas
const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeSupabaseSession();
  }, []);

  // ✅ Inicializuojam Supabase sesiją
  const initializeSupabaseSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data?.session?.user) {
        setUser(data.session.user);
        setSession(data.session);
      } else {
        await logout(); // jei nėra sesijos – atjungiame
      }
    } catch (error) {
      console.error("❌ Supabase session error:", error);
    }
    setLoading(false);
  };

  // ✅ MagicLink login
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
      console.error("❌ MagicLink login error:", error);
      return false;
    }
  };

  // ✅ Atsijungimas
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("⚠️ Supabase logout issue:", error.message);
    }
    setUser(null);
    setSession(null);
    router.push("/login");
  };

  return (
    <SupabaseContext.Provider
      value={{
        user,
        session,
        loading,
        loginWithMagicLink,
        logout,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

// ✅ Hookas vartotojo sesijai gauti
export const useSupabase = () => useContext(SupabaseContext);
