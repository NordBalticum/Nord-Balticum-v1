"use client";

import { useState, useEffect } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";
import styles from "@/styles/login.module.css";

export default function Login() {
  const { loginWithMagicLink, user, successMessage, loading } = useMagicLink();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.push("/app/dashboard");
  }, [user]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setError("⚠️ Please enter a valid email address.");
      return;
    }

    setError("");
    setIsSent(true);

    const success = await loginWithMagicLink(email);
    if (!success) {
      setError("❌ Failed to send Magic Link. Please try again.");
      setIsSent(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>🔐 Login to NordBalticum</h2>

        {isSent ? (
          <div className={styles.successContainer}>
            <p className={styles.successMessage}>
              ✅ Magic Link sent successfully!
            </p>
            <p className={styles.subtext}>
              Please check your inbox and confirm your login.
            </p>
          </div>
        ) : (
          <>
            <input
              className={styles.input}
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading || isSent}
            />

            {error && <p className={styles.errorMessage}>{error}</p>}

            <button
              className={styles.loginButton}
              onClick={handleLogin}
              disabled={loading || isSent}
            >
              {loading ? "⏳ Sending..." : "📧 Send Magic Link"}
            </button>
          </>
        )}

        {successMessage && (
          <p className={styles.successMessage}>{successMessage}</p>
        )}
      </div>
    </div>
  );
}
