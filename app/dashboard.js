"use client";

import { useEffect, useState } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";
import { getTokenBalance, getTokenSymbol } from "@/utils/ethers.tokens";
import tokenList from "@/utils/tokenlist";
import styles from "@/styles/dashboard.module.css";

export default function Dashboard() {
  const { user, wallet, balance, updateBalance, allowTokens } = useMagicLink();
  const [tokenData, setTokenData] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/");
  }, [user]);

  useEffect(() => {
    if (wallet?.address) {
      updateBalance();
      if (allowTokens) fetchTokens();
    }
  }, [wallet]);

  const fetchTokens = async () => {
    setLoadingTokens(true);
    try {
      const tokens = await Promise.all(
        tokenList.map(async (token) => {
          try {
            const balance = await getTokenBalance(token.address, wallet.address);
            const symbol = await getTokenSymbol(token.address);
            return {
              ...token,
              balance,
              symbol,
            };
          } catch (err) {
            console.error(`❌ Error loading ${token.symbol}`, err);
            return {
              ...token,
              balance: "0.00",
              symbol: token.symbol,
            };
          }
        })
      );
      setTokenData(tokens);
    } catch (err) {
      console.error("❌ Token fetch error:", err);
    }
    setLoadingTokens(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>💼 Your Wallet</h2>

      {/* ✅ Wallet Info */}
      <div className={styles.walletBox}>
        <label className={styles.label}>Wallet Address:</label>
        <p className={styles.address}>{wallet?.address}</p>

        <p className={styles.balance}>
          BNB Balance: <strong>{balance}</strong> BNB
        </p>
      </div>

      {/* ✅ Token Section */}
      {allowTokens && (
        <div className={styles.tokensSection}>
          <h3 className={styles.subtitle}>Your Tokens</h3>

          {loadingTokens ? (
            <p className={styles.info}>⏳ Loading token balances...</p>
          ) : (
            <>
              {tokenData.length === 0 ? (
                <p className={styles.info}>No tokens found.</p>
              ) : (
                <ul className={styles.tokenList}>
                  {tokenData.map((token) => (
                    <li key={token.address} className={styles.tokenItem}>
                      <div className={styles.tokenLeft}>
                        <span className={styles.tokenName}>
                          {token.symbol} – {token.name}
                        </span>
                        <span className={styles.tokenAddress}>
                          {token.address}
                        </span>
                      </div>
                      <div className={styles.tokenRight}>
                        {parseFloat(token.balance) > 0
                          ? `${token.balance} ${token.symbol}`
                          : "—"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
