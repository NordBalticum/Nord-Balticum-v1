"use client";

import { useEffect, useState } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import styles from "@/styles/logs.module.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LogsPage() {
  const { user } = useMagicLink();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/");
  }, [user]);

  useEffect(() => {
    if (user?.id) fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data);
    } catch (error) {
      console.error("❌ Klaida gaunant logus:", error);
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📝 System Activity Log</h2>

      {loading ? (
        <p className={styles.loading}>⏳ Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className={styles.noLogs}>No activity found.</p>
      ) : (
        <ul className={styles.logList}>
          {logs.map((log) => (
            <li key={log.id} className={styles.logItem}>
              <div className={styles.row}>
                <span className={styles.eventType}>
                  {log.event_type?.toUpperCase() || "UNKNOWN"}
                </span>
                <span className={styles.date}>{formatDate(log.created_at)}</span>
              </div>
              <p className={styles.description}>{log.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
