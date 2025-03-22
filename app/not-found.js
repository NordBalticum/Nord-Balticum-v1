import styles from "@/styles/notfound.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404 – Page Not Found</h1>
      <p className={styles.subtitle}>
        The page you're trying to access does not exist in the NordBalticum system.
      </p>
    </div>
  );
}
