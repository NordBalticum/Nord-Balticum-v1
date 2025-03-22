"use client";

import styles from "@/styles/loading.module.css";

export default function Loading() {
  return (
    <div className={styles.overlay}>
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p className={styles.text}>Loading NordBalticum...</p>
      </div>
    </div>
  );
}
