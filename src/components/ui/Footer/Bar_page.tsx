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
            <div className={styles.socials}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={styles.socialLink}
                href="https://www.linkedin.com/in/marcelintingougoui/"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className={styles.socialLink}
                href="https://github.com"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mail"
                className={styles.socialLink}
                href="mailto:contact@getevent.com"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>
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
