"use client";

import { useEffect, useState } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { logEvent } from "@/utils/logger";
import styles from "@/styles/settings.module.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SettingsPage() {
  const { user, wallet, balance } = useMagicLink();
  const router = useRouter();

  const [newEmail, setNewEmail] = useState("");
  const [status, setStatus] = useState("");
  const [requestDelete, setRequestDelete] = useState(false);
  const [tokenStatus, setTokenStatus] = useState("Loading...");

  useEffect(() => {
    if (!user) router.push("/");
    else checkTokenStatus();
  }, [user]);

  const checkTokenStatus = async () => {
    const adminGlobal = process.env.NEXT_PUBLIC_TOKENS_ENABLED === "true";
    if (!adminGlobal) {
      setTokenStatus("❌ Globally Disabled");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("allow_tokens")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setTokenStatus("⚠ Error Fetching");
      } else {
        setTokenStatus(data.allow_tokens ? "✅ Enabled" : "⛔ Disabled for User");
      }
    } catch {
      setTokenStatus("❌ Error");
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setStatus("⚠ Please enter a valid email.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      setStatus("📧 Confirmation sent to new email.");
      await logEvent(user.id, "Email Change", `Requested email change to ${newEmail}`);
    } catch (err) {
      console.error("❌ Email change error:", err);
      setStatus("❌ Failed to send confirmation.");
    }
  };

  const handleAccountDeleteRequest = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ request_delete: true })
        .eq("id", user.id);

      if (error) throw error;
      setRequestDelete(true);
      setStatus("🗑️ Deletion request submitted. Admin will review.");
      await logEvent(user.id, "Delete Request", "User requested account deletion.");
    } catch (err) {
      console.error("❌ Delete request error:", err);
      setStatus("❌ Failed to submit deletion request.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>⚙️ User Settings</h2>

      {/* Wallet Info */}
      <div className={styles.section}>
        <label className={styles.label}>Wallet Address:</label>
        <p className={styles.value}>{wallet?.address}</p>
        <p className={styles.balance}>Balance: {balance} BNB</p>
      </div>

      {/* Email Update */}
      <div className={styles.section}>
        <label className={styles.label}>Change Email Address:</label>
        <input
          className={styles.input}
          type="email"
          placeholder="Enter new email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button className={styles.button} onClick={handleEmailChange}>
          Update Email
        </button>
      </div>

      {/* Account Deletion */}
      <div className={styles.section}>
        <label className={styles.label}>Account Deletion:</label>
        <button
          className={styles.danger}
          onClick={handleAccountDeleteRequest}
          disabled={requestDelete}
        >
          {requestDelete ? "🗑️ Deletion Requested" : "Request Account Deletion"}
        </button>
      </div>

      {/* Token System Status */}
      <div className={styles.section}>
        <label className={styles.label}>Token System:</label>
        <p className={styles.value}>{tokenStatus}</p>
      </div>

      {/* Status Message */}
      {status && <div className={styles.status}>{status}</div>}
    </div>
  );
      }
