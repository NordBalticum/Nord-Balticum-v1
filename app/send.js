"use client";

import { useState, useEffect } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";

import { sendTransaction } from "@/utils/ethers";
import {
  sendTokenTransaction,
  getTokenBalance,
  getTokenSymbol,
} from "@/utils/ethers.tokens";
import { tokenList } from "@/utils/tokenlist";

import styles from "@/styles/send.module.css";

export default function Send() {
  const { user, wallet, balance, updateBalance, allowTokens } = useMagicLink();
  const router = useRouter();

  const [mode, setMode] = useState("BNB"); // "BNB" | "TOKEN"
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("🚀 Ready to send.");
  const [selectedToken, setSelectedToken] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("TOKEN");
  const [tokenBalance, setTokenBalance] = useState("0.00");

  useEffect(() => {
    if (!user) router.push("/app/login");
  }, [user]);

  useEffect(() => {
    if (wallet?.address && mode === "BNB") updateBalance();
    if (wallet?.address && mode === "TOKEN" && selectedToken) updateTokenInfo();
  }, [wallet, mode, selectedToken]);

  const updateTokenInfo = async () => {
    try {
      const balance = await getTokenBalance(selectedToken, wallet.address);
      const symbol = await getTokenSymbol(selectedToken);
      setTokenBalance(balance);
      setTokenSymbol(symbol);
    } catch (err) {
      console.error("❌ Token info error:", err);
      setTokenBalance("0.00");
      setTokenSymbol("TOKEN");
    }
  };

  const handleSend = async () => {
    const numericAmount = parseFloat(amount);
    if (!recipient || recipient.length < 42) {
      setStatus("⚠ Invalid recipient address.");
      return;
    }
    if (!amount || numericAmount <= 0) {
      setStatus("⚠ Enter valid amount.");
      return;
    }

    setSending(true);
    setStatus("⏳ Processing...");

    try {
      let result;

      // ✅ BNB transfer
      if (mode === "BNB") {
        const fee = numericAmount * 0.03;
        const total = numericAmount + fee;
        if (total > parseFloat(balance)) {
          setStatus("⚠ Insufficient BNB balance (incl. 3% fee).");
          setSending(false);
          return;
        }

        result = await sendTransaction(
          user.id,
          wallet.private_key_enc,
          recipient,
          numericAmount,
          wallet.nonce // ✅ naudojame nonce jei reikia dešifravimui
        );

        if (result.success) {
          setStatus(`✅ Sent BNB! View: ${result.hash}`);
          updateBalance();
        } else {
          setStatus(`❌ Error: ${result.error}`);
        }
      }

      // ✅ Token transfer
      if (mode === "TOKEN") {
        if (!selectedToken) {
          setStatus("⚠ Select a token.");
          setSending(false);
          return;
        }

        if (numericAmount > parseFloat(tokenBalance)) {
          setStatus("⚠ Not enough token balance.");
          setSending(false);
          return;
        }

        result = await sendTokenTransaction({
          encryptedKey: wallet.private_key_enc,
          nonce: wallet.nonce,
          tokenAddress: selectedToken,
          recipient,
          amount: numericAmount,
        });

        if (result.success) {
          setStatus(`✅ Sent ${tokenSymbol}! View: ${result.hash}`);
          updateTokenInfo();
        } else {
          setStatus(`❌ Token Error: ${result.error}`);
        }
      }

      if (result?.success) {
        setRecipient("");
        setAmount("");
      }
    } catch (err) {
      console.error("❌ Send error:", err);
      setStatus(`❌ Exception: ${err.message}`);
    }

    setSending(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sendBox}>
        <h2 className={styles.title}>🚀 Send {mode === "BNB" ? "BNB" : tokenSymbol}</h2>

        {/* ✅ Tab Switcher */}
        <div className={styles.tabs}>
          <button
            className={mode === "BNB" ? styles.activeTab : styles.tab}
            onClick={() => setMode("BNB")}
          >
            BNB
          </button>
          <button
            className={mode === "TOKEN" ? styles.activeTab : styles.tab}
            onClick={() => setMode("TOKEN")}
            disabled={!allowTokens}
          >
            Token
          </button>
        </div>

        {/* ✅ Token Picker */}
        {mode === "TOKEN" && (
          <>
            <label className={styles.label}>Select Token:</label>
            <select
              className={styles.select}
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
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
            <p className={styles.balanceText}>
              Balance: {tokenBalance} {tokenSymbol}
            </p>
          </>
        )}

        {/* ✅ Address input */}
        <input
          className={styles.input}
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />

        {/* ✅ Amount input */}
        <input
          className={styles.input}
          type="number"
          placeholder={`Amount (${mode === "BNB" ? "BNB" : tokenSymbol})`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* ✅ Send button */}
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? "⏳ Sending..." : `🚀 Send ${mode}`}
        </button>

        <p className={styles.statusMessage}>{status}</p>
      </div>
    </div>
  );
}
