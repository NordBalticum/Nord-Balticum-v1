"use client";

import { useEffect, useState } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import styles from "@/styles/transactions.module.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Transactions() {
  const { user } = useMagicLink();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/");
    else fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .or(`sender_email.eq.${user.email},receiver_email.eq.${user.email}`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data);
    } catch (err) {
      console.error("❌ Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatExplorerLink = (hash) => {
    if (!hash) return "#";
    const isTestnet = process.env.NEXT_PUBLIC_TESTNET === "true";
    return isTestnet
      ? `https://testnet.bscscan.com/tx/${hash}`
      : `https://bscscan.com/tx/${hash}`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📜 Transaction History</h2>

      {loading ? (
        <p className={styles.loading}>⏳ Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className={styles.empty}>No transactions found.</p>
      ) : (
        <ul className={styles.txList}>
          {transactions.map((tx) => (
            <li key={tx.id} className={styles.txItem}>
              <div className={styles.row}>
                <span className={styles.type}>
                  {tx.type ? tx.type.toUpperCase() : "UNKNOWN"}
                </span>
                <span className={styles.amount}>
                  {tx.amount} {tx.token_symbol || tx.network?.toUpperCase()}
                </span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>From:</span>
                <span className={styles.addr}>{tx.sender_email}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>To:</span>
                <span className={styles.addr}>{tx.receiver_email}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.date}>{formatDate(tx.created_at)}</span>
                {tx.tx_hash && (
                  <a
                    href={formatExplorerLink(tx.tx_hash)}
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
