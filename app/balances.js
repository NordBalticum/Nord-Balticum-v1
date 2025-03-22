"use client";

import { useEffect, useState } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";
import { getBlockchainBalance, getDatabaseBalance } from "@/utils/ethers";
import { getTokenBalance, getTokenSymbol } from "@/utils/ethers.tokens";
import tokenList from "@/utils/tokenlist";
import styles from "@/styles/balances.module.css";

export default function BalancesPage() {
  const { user, wallet } = useMagicLink();
  const router = useRouter();
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [dbBalance, setDbBalance] = useState("0.00");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push("/");
  }, [user]);

  useEffect(() => {
    if (wallet?.address && user?.id) {
      fetchBalances();
    }
  }, [wallet, user]);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const bnb = await getBlockchainBalance(wallet.address);
      const db = await getDatabaseBalance(user.id);

      const tokenData = await Promise.all(
        tokenList.map(async (token) => {
          try {
            const balance = await getTokenBalance(token.address, wallet.address);
            const symbol = await getTokenSymbol(token.address);
            return {
              name: token.name,
              symbol,
              balance,
              address: token.address,
            };
          } catch (err) {
            return {
              name: token.name,
              symbol: token.symbol,
              balance: "0.00",
              address: token.address,
            };
          }
        })
      );

      setBnbBalance(bnb);
      setDbBalance(db);
      setTokens(tokenData);
    } catch (error) {
      console.error("❌ Balanso klaida:", error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>💰 Wallet Balances</h2>

      {loading ? (
        <p className={styles.loading}>⏳ Loading balances...</p>
      ) : (
        <div className={styles.card}>
          {/* ✅ BNB BALANCES */}
          <p className={styles.balanceTitle}>BNB Balance:</p>
          <p className={styles.bnb}>
            On-Chain: <strong>{bnbBalance} BNB</strong>
          </p>
          <p className={styles.bnb}>
            In Database: <strong>{dbBalance} BNB</strong>
          </p>

          <hr className={styles.hr} />

          {/* ✅ TOKEN BALANCES */}
          <h3 className={styles.subtitle}>Token Balances:</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Symbol</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.address}>
                  <td>{token.name}</td>
                  <td>{token.symbol}</td>
                  <td>
                    {parseFloat(token.balance) > 0
                      ? `${token.balance}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
