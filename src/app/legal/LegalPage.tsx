import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./LegalPage.module.scss";

const links = [
  { href: "/legal/legal-notice", label: "Mentions légales" },
  { href: "/legal/privacy-policy", label: "Confidentialité" },
  { href: "/legal/terms-of-use", label: "Conditions d’utilisation" },
];

export function LegalPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.nav} aria-label="Navigation juridique">
          <p>Informations juridiques</p>
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <article className={styles.article}>
          <p className={styles.eyebrow}>GetEvent · Cadre juridique</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{lead}</p>
          <p className={styles.updated}>Mise à jour : 23 juin 2026</p>
          {children}
        </article>
      </div>
    </main>
  );
}

export const legalStyles = styles;
