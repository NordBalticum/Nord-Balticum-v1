"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useSupabase } from "@/context/SupabaseContext";

// Konteksto sukūrimas
export const EthersContext = createContext();

// Provideris
export const EthersProvider = ({ children }) => {
  const { address, signer } = useMagicLink();
  const { supabase } = useSupabase();
  const [balance, setBalance] = useState("0");

  // Balanso paėmimas ir atnaujinimas į Supabase
  const fetchBalance = async () => {
    if (!address || !signer || !supabase) return;
    try {
      const raw = await signer.provider.getBalance(address);
      const formatted = ethers.utils.formatEther(raw);
      setBalance(formatted);

      await supabase
        .from("balances")
        .upsert(
          { wallet: address, network: "bsc", amount: formatted },
          { onConflict: ["wallet", "network"] }
        );
    } catch (err) {
      console.error("Balance fetch error:", err.message);
    }
  };

  // BNB siuntimas su 3% fee
  const sendBNB = async (to, amount) => {
    if (!signer || !ethers.utils.isAddress(to)) {
      throw new Error("Invalid address or signer.");
    }

    const value = ethers.utils.parseEther(amount);
    const fee = value.mul(3).div(100); // 3% fee
    const finalAmount = value.sub(fee);

    const tx1 = await signer.sendTransaction({ to, value: finalAmount });
    const tx2 = await signer.sendTransaction({
      to: process.env.NEXT_PUBLIC_ADMIN_WALLET,
      value: fee,
    });

    await tx1.wait();
    await tx2.wait();
    await fetchBalance();

    return { tx1, tx2 };
  };

  useEffect(() => {
    fetchBalance();
  }, [address]);

  return (
    <EthersContext.Provider
      value={{
        address,
        signer,
        balance,
        fetchBalance,
        sendBNB,
      }}
    >
      {children}
    </EthersContext.Provider>
  );
};

// Hookas naudojimui
export const useEthers = () => useContext(EthersContext);
