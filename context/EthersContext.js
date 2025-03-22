"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useMagicLink } from "@/context/MagicLinkContext";
import { updateBalance } from "@/utils/supabaseUtils";

export const EthersContext = createContext();

export const EthersProvider = ({ children }) => {
  const { address, signer } = useMagicLink();
  const [balance, setBalance] = useState("0");

  const fetchBalance = async () => {
    if (!address || !signer) return;
    try {
      const raw = await signer.provider.getBalance(address);
      const formatted = ethers.utils.formatEther(raw);
      setBalance(formatted);
      await updateBalance(address, "bsc", formatted); // auto update į Supabase
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  };

  const sendBNB = async (to, amount) => {
    if (!signer || !ethers.utils.isAddress(to)) throw new Error("Invalid input");

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
    <EthersContext.Provider value={{ address, signer, balance, fetchBalance, sendBNB }}>
      {children}
    </EthersContext.Provider>
  );
};

export const useEthers = () => useContext(EthersContext);
