"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

import { encryptPrivateKey, decryptPrivateKey } from "@/utils/encryption";
import { provider, getBlockchainBalance } from "@/utils/ethers";

// ✅ Supabase client init
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const MagicLinkContext = createContext();

export const MagicLinkProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [allowTokens, setAllowTokens] = useState(true);

  const router = useRouter();

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchOrGenerateWallet(user.id);
      checkTokenPermission(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (wallet?.address) updateBalance();
  }, [wallet]);

  // ✅ Sesijos inicijavimas
  const initializeSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data?.session?.user) {
        setUser(data.session.user);
        displaySuccess("✅ Session active");
      } else {
        logout();
      }
    } catch (error) {
      console.error("❌ Session error:", error);
      displayError("⚠ Session initialization failed");
    }
    setLoading(false);
  };

  // ✅ Token leidimo tikrinimas (global + individualus)
  const checkTokenPermission = async (userId) => {
    const adminEnabled = process.env.NEXT_PUBLIC_TOKENS_ENABLED === "true";
    if (!adminEnabled) {
      setAllowTokens(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("allow_tokens")
        .eq("id", userId)
        .single();

      if (error || !data?.allow_tokens) {
        setAllowTokens(false);
      } else {
        setAllowTokens(true);
      }
    } catch (error) {
      console.error("❌ Token permission error:", error);
      setAllowTokens(false);
    }
  };

  // ✅ Wallet tikrinimas arba kūrimas
  const fetchOrGenerateWallet = async (user_id) => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("address, private_key_enc, nonce")
        .eq("user_id", user_id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data?.address && data?.private_key_enc && data?.nonce) {
        setWallet(data);
        localStorage.setItem("walletAddress", data.address);
        displaySuccess("🔐 Wallet loaded");
      } else {
        await createWalletForUser(user_id);
      }
    } catch (error) {
      console.error("❌ Wallet load error:", error);
      displayError("⚠ Wallet fetch error");
    }
  };

  // ✅ Wallet generavimas
  const createWalletForUser = async (user_id) => {
    try {
      const newWallet = ethers.Wallet.createRandom();
      const { encrypted, nonce } = await encryptPrivateKey(newWallet.privateKey);

      await supabase.from("wallets").insert([
        {
          user_id,
          address: newWallet.address,
          private_key_enc: encrypted,
          nonce: nonce,
        },
      ]);

      setWallet({ address: newWallet.address, private_key_enc: encrypted, nonce });
      localStorage.setItem("walletAddress", newWallet.address);
      displaySuccess("✅ New wallet created");
    } catch (error) {
      console.error("❌ Wallet creation error:", error);
      displayError("⚠ Wallet generation failed");
    }
  };

  // ✅ Balanso atnaujinimas
  const updateBalance = async () => {
    try {
      const amount = await getBlockchainBalance(wallet.address);
      setBalance(amount);
    } catch (error) {
      console.error("❌ Balance error:", error);
      displayError("⚠ Balance fetch failed");
    }
  };

  // ✅ Prisijungimas per MagicLink
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
      displaySuccess("📧 Magic Link sent!");
      return true;
    } catch (error) {
      console.error("❌ Magic Link error:", error);
      displayError("⚠ Magic Link failed");
      return false;
    }
  };

  // ✅ Atsijungimas
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setWallet(null);
    setBalance("0.00");
    setAllowTokens(true);
    localStorage.removeItem("walletAddress");
    router.push("/");
    displaySuccess("👋 Logged out");
  };

  // ✅ Žinučių helperiai
  const displaySuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const displayError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 4000);
  };

  return (
    <MagicLinkContext.Provider
      value={{
        user,
        wallet,
        balance,
        allowTokens,
        updateBalance,
        loginWithMagicLink,
        logout,
        loading,
        successMessage,
        errorMessage,
      }}
    >
      {children}
    </MagicLinkContext.Provider>
  );
};

export const useMagicLink = () => useContext(MagicLinkContext);
