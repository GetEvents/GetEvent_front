"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import styles from "./Footer.module.scss";

interface FooterProps {
  currentUser: boolean;
}

export default function Footer({ currentUser }: FooterProps) {
  const pathname = usePathname();
  // Pas de pied de page sur les pages /auth (mise en page dédiée).
  if (pathname?.startsWith("/auth/") || currentUser) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.maxContainer}>
        <div className={styles.topRow}>
          <p className={styles.brandTitle}>GetEvent</p>
          <Link href="/events/createvent" className={styles.publishButton}>
            Publier mon événement
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.footerGrid}>
          <div className={styles.brandInfo}>
            <p className={styles.brandText}>
              La billetterie qui simplifie l&apos;organisation de vos événements
              : publication, paiement Mobile Money, billets QR code et
              messagerie.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h3>Produit</h3>
            <ul>
              <li>
                <Link href="/events">Événements</Link>
              </li>
              <li>
                <Link href="/#how-it-works">Comment ?</Link>
              </li>
              <li>
                <Link href="/#features">Fonctionnalités</Link>
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

      <p className={styles.wordmark} aria-hidden="true">
        GetEvent
      </p>
    </footer>
  );
}
