"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.scss";

interface FooterProps {
  currentUser: boolean;
}

export default function Footer({ currentUser }: FooterProps) {
  const pathname = usePathname();
  if (
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    currentUser
  ) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.maxContainer}>
        <div className={styles.footerGrid}>
          <div className={styles.brandInfo}>
            <p className={styles.brandTitle}>GetEvent</p>
            <p className={styles.brandText}>
              La plateforme de gestion d&apos;événements qui simplifie
              l&apos;organisation en équipe. Créez, planifiez et gérez vos
              événements avec élégance et facilité.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h3>Produit</h3>
            <ul>
              <li>
                <Link href="/#how-it-works">Comment ?</Link>
              </li>
              <li>
                <Link href="/#features">Fonctionnalités</Link>
              </li>
              <li>
                <Link href="/#impact">Impact</Link>
              </li>
              <li>
                <Link href="/#faq">FAQ</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h3>Légal</h3>
            <ul>
              <li>
                <Link href="/legal/legal-notice">Mentions légales</Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy">Confidentialité</Link>
              </li>
              <li>
                <Link href="/legal/terms-of-use">CGU</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>© 2026 GetEvent. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
