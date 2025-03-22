"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { useMagicLink } from "@/context/MagicLinkContext";
import ERC20_ABI from "@/abis/erc20.json"; // Įsitikink, kad failas yra `abis/erc20.json`

export const EthersTokenContext = createContext();

export const EthersTokenProvider = ({ children }) => {
  const { signer, address } = useMagicLink();
  const [tokens, setTokens] = useState([]);

  const fetchTokenBalance = async (tokenAddress) => {
    if (!signer || !tokenAddress) return "0";
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const raw = await contract.balanceOf(address);
    return ethers.utils.formatUnits(raw, 18);
  };

  const sendToken = async (tokenAddress, to, amount) => {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    const value = ethers.utils.parseUnits(amount, decimals);
    const fee = value.mul(3).div(100);
    const finalAmount = value.sub(fee);

    const tx1 = await contract.transfer(to, finalAmount);
    const tx2 = await contract.transfer(process.env.NEXT_PUBLIC_ADMIN_WALLET, fee);

    await tx1.wait();
    await tx2.wait();

    return { tx1, tx2 };
  };

  const loadTokens = async () => {
    // Custom token list
    const predefined = [
      { symbol: "USDT", address: process.env.NEXT_PUBLIC_USDT_ADDRESS },
      { symbol: "DAI", address: process.env.NEXT_PUBLIC_DAI_ADDRESS },
    ];

    const enriched = await Promise.all(
      predefined.map(async (token) => {
        const balance = await fetchTokenBalance(token.address);
        return { ...token, balance };
      })
    );

    setTokens(enriched);
  };

  useEffect(() => {
    if (address && signer) loadTokens();
  }, [address]);

  return (
    <EthersTokenContext.Provider value={{ tokens, sendToken, fetchTokenBalance }}>
      {children}
    </EthersTokenContext.Provider>
  );
};

export const useEthersToken = () => useContext(EthersTokenContext);
