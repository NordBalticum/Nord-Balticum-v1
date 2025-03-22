"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { parseEther, formatEther, isAddress } from "ethers";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useSupabase } from "@/context/SupabaseContext";

export const EthersContext = createContext();

export const EthersProvider = ({ children }) => {
  const { address, signer } = useMagicLink();
  const { supabase } = useSupabase();
  const [balance, setBalance] = useState("0");

  const fetchBalance = async () => {
    if (!address || !signer || !supabase) return;
    try {
      const raw = await signer.provider.getBalance(address);
      const formatted = formatEther(raw);
      setBalance(formatted);

      // Supabase balanso įrašas
      await supabase
        .from("balances")
        .upsert(
          {
            wallet: address,
            network: "bsc",
            amount: formatted,
          },
          { onConflict: ["wallet", "network"] }
        );
    } catch (err) {
      console.error("Balance fetch error:", err.message);
    }
  };

  const sendBNB = async (to, amount) => {
    if (!signer || !isAddress(to)) throw new Error("Invalid address or signer");

    const value = parseEther(amount); // parseEther returns a BigInt
    const fee = (BigInt(value) * 3n) / 100n; // Convert value to BigInt and calculate fee
    const finalAmount = value - fee;

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
    <EthersContext.Provider value={{ address, signer, balance, fetchBalance, sendBNB }}>
      {children}
    </EthersContext.Provider>
  );
};

export const useEthers = () => useContext(EthersContext);
