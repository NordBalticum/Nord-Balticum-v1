"use client";

import styles from "@/styles/successModal.module.css";

export default function SuccessModal({ hash, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>✅ Transaction Sent!</h2>
        <p>Track on BscScan:</p>
        <a href={hash} target="_blank" rel="noopener noreferrer">
          {hash}
        </a>
        <button onClick={onClose}>✖ Close</button>
      </div>
    </div>
  );
}
