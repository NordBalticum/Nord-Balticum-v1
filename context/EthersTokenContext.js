"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { JsonRpcProvider } from "ethers";
import ERC20_ABI from "@/lib/abi/erc20.json";

const EthersTokenContext = createContext();

export const EthersTokenProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [usdtBalance, setUsdtBalance] = useState("0");
  const [daiBalance, setDaiBalance] = useState("0");

  // ✅ USDT ir DAI adresai BSC tinkle
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
  const DAI_ADDRESS = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);
      ethProvider.getSigner().getAddress().then(setAddress).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!provider || !address) return;

    const fetchBalances = async () => {
      try {
        const signer = provider.getSigner();
        const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
        const daiContract = new ethers.Contract(DAI_ADDRESS, ERC20_ABI, signer);

        const usdtRaw = await usdtContract.balanceOf(address);
        const daiRaw = await daiContract.balanceOf(address);

        const usdtDecimals = await usdtContract.decimals();
        const daiDecimals = await daiContract.decimals();

        setUsdtBalance(ethers.utils.formatUnits(usdtRaw, usdtDecimals));
        setDaiBalance(ethers.utils.formatUnits(daiRaw, daiDecimals));
      } catch (err) {
        console.error("Error fetching token balances:", err);
      }
    };

    fetchBalances();
  }, [provider, address]);

  return (
    <EthersTokenContext.Provider value={{ usdtBalance, daiBalance }}>
      {children}
    </EthersTokenContext.Provider>
  );
};

export const useEthersToken = () => useContext(EthersTokenContext);
