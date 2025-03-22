"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/context/SupabaseContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // 🔄 Jei neprisijungęs, siunčiame į login puslapį
    }
  }, [user, loading, router]);

  if (loading) return <div>🔄 Loading...</div>;

  return user ? children : null;
};

export default ProtectedRoute;
