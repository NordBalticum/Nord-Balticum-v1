"use client";

import { useEffect, useState } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin.module.css";

export default function Admin() {
  const { user } = useMagicLink();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (user.email === adminEmail) {
      setIsAdmin(true);
    } else {
      router.push("/");
    }

    setChecking(false);
  }, [user]);

  if (checking) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>🛡️ Checking access...</h2>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🛡️ Admin Panel</h2>
      <p className={styles.text}>Welcome, Admin! Manage logs, transactions, and user actions.</p>

      <ul className={styles.links}>
        <li><a href="/app/logs">📄 View System Logs</a></li>
        <li><a href="/app/transactions">💸 View Transactions</a></li>
        <li><a href="/app/send">🚀 Send BNB</a></li>
        <li><a href="/app/settings">⚙️ Account Settings</a></li>
        <li><a href="/app/balances">📊 Balances</a></li>
      </ul>
    </div>
  );
}
