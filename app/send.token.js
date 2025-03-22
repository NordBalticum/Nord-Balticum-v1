"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMagicLink } from "@/context/MagicLinkContext";
import {
  sendTokenTransaction,
  getTokenBalance,
  getTokenSymbol,
} from "@/utils/ethers.tokens";
import { tokenList } from "@/utils/tokenlist";
import styles from "@/styles/sendtoken.module.css";

export default function SendToken() {
  const { user, wallet, allowTokens } = useMagicLink();
  const router = useRouter();

  const [tokenAddress, setTokenAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("🚀 Ready to send token.");
  const [sending, setSending] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("0.00");
  const [tokenSymbol, setTokenSymbol] = useState("TOKEN");

  useEffect(() => {
    if (!user) router.push("/app/login");
    if (!allowTokens) router.push("/app/send");
  }, [user, allowTokens]);

  useEffect(() => {
    if (wallet?.address && tokenAddress) {
      updateTokenInfo();
    }
  }, [wallet, tokenAddress]);

  const updateTokenInfo = async () => {
    try {
      const balance = await getTokenBalance(tokenAddress, wallet.address);
      const symbol = await getTokenSymbol(tokenAddress);
      setTokenBalance(balance);
      setTokenSymbol(symbol);
    } catch (err) {
      console.error("❌ Token info error:", err);
      setTokenBalance("0.00");
      setTokenSymbol("TOKEN");
    }
  };

  const handleSendToken = async () => {
    const numericAmount = parseFloat(amount);

    if (!tokenAddress) {
      setStatus("⚠ Please select a token.");
      return;
    }

    if (!recipient || recipient.length < 42) {
      setStatus("⚠ Invalid recipient address.");
      return;
    }

    if (!amount || numericAmount <= 0) {
      setStatus("⚠ Enter valid token amount.");
      return;
    }

    if (numericAmount > parseFloat(tokenBalance)) {
      setStatus("⚠ Insufficient token balance.");
      return;
    }

    setSending(true);
    setStatus("⏳ Sending...");

    try {
      const result = await sendTokenTransaction({
        encryptedKey: wallet.private_key_enc,
        nonce: wallet.nonce,
        tokenAddress,
        recipient,
        amount: numericAmount,
      });

      if (result.success) {
        setStatus(`✅ ${tokenSymbol} sent! Tx: ${result.hash}`);
        setRecipient("");
        setAmount("");
        updateTokenInfo();
      } else {
        setStatus(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Send token error:", error);
      setStatus(`❌ Exception: ${error.message}`);
    }

    setSending(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h2 className={styles.title}>🚀 Send Token</h2>

        {/* ✅ Token Picker */}
        <label className={styles.label}>Select Token</label>
        <select
          className={styles.select}
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        >
          <option value="">-- Choose Token --</option>
          {tokenList
            .filter((token) => token.active)
            .map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol} – {token.name}
              </option>
            ))}
        </select>

        {/* ✅ Token Info */}
        {tokenAddress && (
          <>
            <p className={styles.balance}>
              <strong>Token Balance:</strong> {tokenBalance} {tokenSymbol}
            </p>

            <input
              className={styles.input}
              type="text"
              placeholder="Recipient Wallet Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />

            <input
              className={styles.input}
              type="number"
              placeholder={`Amount to send (${tokenSymbol})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <button
              className={styles.sendButton}
              onClick={handleSendToken}
              disabled={sending}
            >
              {sending ? "⏳ Sending..." : `🚀 Send ${tokenSymbol}`}
            </button>

            <p className={styles.status}>{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
