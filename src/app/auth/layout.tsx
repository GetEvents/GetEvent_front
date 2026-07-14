"use client";
import styles from "./layout.module.scss";
// import Navbar from "../../component/NavBar/NavBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.navbar}>{/* <Navbar /> */}</div>

      <div className={styles.right__part}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
