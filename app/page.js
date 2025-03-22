"use client";

import styles from "@/styles/page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* ✅ Logo */}
      <div className={styles.logoWrapper}>
        <Image
          src="/logo.png"
          alt="NordBalticum Logo"
          width={180}
          height={180}
          className={styles.logo}
          priority
        />
      </div>

      {/* ✅ Antraštė ir aprašymas */}
      <h1 className={styles.title}>NordBalticum</h1>
      <p className={styles.subtext}>Premium Web3 Wallet & Financial Ecosystem</p>

      {/* ✅ Pradžios mygtukas */}
      <button
        className={styles.startButton}
        onClick={() => router.push("/loginsystem/login")}
      >
        Enter Wallet
      </button>
    </div>
  );
}
