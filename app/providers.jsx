"use client";

import { useEffect } from "react";
import { MagicLinkProvider } from "@/context/MagicLinkContext";
import { SupabaseProvider } from "@/context/SupabaseContext";
import { EthersProvider } from "@/context/EthersContext";

export function Providers({ children }) {
  useEffect(() => {
    document.documentElement.style.setProperty("transition", "none");
    document.documentElement.style.setProperty("color-scheme", "dark");
  }, []);

  return (
    <SupabaseProvider>
      <MagicLinkProvider>
        <EthersProvider>{children}</EthersProvider>
      </MagicLinkProvider>
    </SupabaseProvider>
  );
}
