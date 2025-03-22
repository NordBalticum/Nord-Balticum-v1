"use client";

import { useEffect, useState } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import tokenList from "@/utils/tokenlist";
import QRCode from "react-qr-code";
import styles from "@/styles/receive.token.module.css";

export default function ReceiveToken() {
  const { user, wallet } = useMagicLink();
  const [selectedToken, setSelectedToken] = useState(tokenList[0]?.address || "");
  const [tokenSymbol, setTokenSymbol] = useState(tokenList[0]?.symbol || "TOKEN");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = tokenList.find((t) => t.address === selectedToken);
    if (token) setTokenSymbol(token.symbol || "TOKEN");
  }, [selectedToken]);

  const copyAddress = () => {
    if (!wallet?.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!user || !wallet) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🚀 Receive Token</h2>

      <div className={styles.selectWrapper}>
        <label className={styles.label}>Select Token:</label>
        <select
          className={styles.select}
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
        >
          {tokenList
            .filter((token) => token.active)
            .map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol} – {token.name}
              </option>
            ))}
        </select>
      </div>

      <p className={styles.infoText}>
        Only send <strong>{tokenSymbol}</strong> to the address below.
        Sending other assets may result in permanent loss.
      </p>

      <div className={styles.qr}>
        <QRCode value={wallet.address} size={140} />
      </div>

      <div className={styles.addressBox}>
        <input
          className={styles.addressInput}
          type="text"
          readOnly
          value={wallet.address}
        />
        <button className={styles.copyButton} onClick={copyAddress}>
          {copied ? "✅ Copied!" : "📋 Copy Address"}
        </button>
      </div>
    </div>
  );
}
