"use client";

import styles from "@/styles/error.module.css";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className={styles.container}>
          <h2 className={styles.title}>Something went wrong!</h2>
          <p className={styles.message}>{error?.message}</p>
          <button className={styles.retryButton} onClick={() => reset()}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
