
"use client";

import { useEffect, useState } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import styles from "@/styles/admin.module.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TransactionsAdmin() {
  const { user } = useMagicLink();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/");
      return;
    }
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setTransactions(data);
    setLoading(false);
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "transactions.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>💸 Transactions</h2>
      <button onClick={downloadJSON} className={styles.button}>Export JSON</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className={styles.list}>
          {transactions.map(tx => (
            <li key={tx.id}>
              <strong>{tx.type}</strong> - {tx.amount} {tx.token_symbol || "BNB"} - {new Date(tx.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
