"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { useMagicLink } from "@/context/MagicLinkContext";
import { getTokenSymbol } from "@/utils/ethers.tokens";
import { tokenList } from "@/utils/tokenlist";
import styles from "@/styles/receive.module.css";

export default function ReceivePage() {
  const { user, wallet, allowTokens } = useMagicLink();
  const router = useRouter();

  const [tab, setTab] = useState("BNB");
  const [copied, setCopied] = useState(false);
  const [selectedToken, setSelectedToken] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("TOKEN");

  useEffect(() => {
    if (!user) router.push("/app/login");
  }, [user]);

  useEffect(() => {
    if (tab === "TOKEN" && selectedToken) {
      fetchTokenSymbol();
    }
  }, [selectedToken, tab]);

  const fetchTokenSymbol = async () => {
    try {
      const symbol = await getTokenSymbol(selectedToken);
      setTokenSymbol(symbol || "TOKEN");
    } catch (err) {
      console.error("❌ Token symbol error:", err);
      setTokenSymbol("TOKEN");
    }
  };

  const handleCopy = () => {
    if (!wallet?.address) return;
    navigator.clipboard.writeText(wallet.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const renderQRCode = () => (
    <div className={styles.qr}>
      <QRCode value={wallet?.address || ""} size={140} bgColor="#ffffff" fgColor="#000000" />
    </div>
  );

  const renderAddress = () => (
    <>
      <p className={styles.address}>{wallet?.address}</p>
      <button className={styles.copyBtn} onClick={handleCopy}>
        {copied ? "✅ Copied!" : "📋 Copy Address"}
      </button>
    </>
  );

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        {/* ✅ Tabs */}
        <div className={styles.tabs}>
          <button
            className={tab === "BNB" ? styles.activeTab : styles.tab}
            onClick={() => setTab("BNB")}
          >
            Receive BNB
          </button>
          <button
            className={tab === "TOKEN" ? styles.activeTab : styles.tab}
            onClick={() => setTab("TOKEN")}
            disabled={!allowTokens}
          >
            Receive Token
          </button>
        </div>

        {/* ✅ BNB Receive */}
        {tab === "BNB" && (
          <>
            <h2 className={styles.title}>Receive BNB</h2>
            <p className={styles.info}>Only send BNB to this address. Any other asset may be lost.</p>
            {renderQRCode()}
            {renderAddress()}
          </>
        )}

        {/* ✅ Token Receive */}
        {tab === "TOKEN" && (
          <>
            <h2 className={styles.title}>Receive Token</h2>

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

            {selectedToken && (
              <>
                <p className={styles.info}>
                  Only send <strong>{tokenSymbol}</strong> to this address.
                </p>
                {renderQRCode()}
                {renderAddress()}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
