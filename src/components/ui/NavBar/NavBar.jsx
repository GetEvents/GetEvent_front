"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./NavBar.module.scss";
import React from "react";
export default function Navbar({ currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = Boolean(currentUser);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoggedIn) return null;

  const navLinks = isLoggedIn
    ? [
        { href: "/", label: "Accueil" },
        { href: "/events", label: "Événements" },
        { href: "/events/my-events", label: "Mes événements" },
        { href: "/message", label: "Messages" },
      ]
    : [
        { href: "/", label: "Accueil" },
        { href: "/events", label: "Événements" },
        { href: "/#event-types", label: "Types" },
        { href: "/#features", label: "Fonctionnalités" },
        { href: "/#impact", label: "Impact" },
        { href: "/#faq", label: "FAQ" },
      ];

  const isHome = pathname === "/";

  return (
    <nav
      className={`${styles.navbar} ${isScrolled || !isHome ? styles.scrolled : ""}`}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/LogoI.png"
              alt="GetEvent"
              width={200}
              height={156}
              priority
              quality={90}
            />
          </Link>

          <div className={styles.navLinks}>
            {navLinks.map((link) => {
              const isAnchorLink = link.href.includes("#");
              const isActive = !isAnchorLink && pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={styles.mobileMenuButton}
              aria-label="Menu"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            <div className={styles.authContainer}>
              {isLoggedIn && (
                <Link href="/events/createvent" className={styles.createButton}>
                  Créer un événement
                </Link>
              )}
              <Link
                href="/auth/register"
                className={styles.signupButton}
                aria-label="Inscription"
              >
                Inscription
              </Link>
              <Link
                href="/auth/login"
                className={styles.loginButton}
                aria-label="Connexion"
              >
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ""}`}
      >
        <div className={styles.mobileMenuContent}>
          {navLinks.map((link) => {
            const isAnchorLink = link.href.includes("#");
            const isActive = !isAnchorLink && pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${isActive ? styles.active : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}

          <div className={styles.mobileAuthSection}>
            {isLoggedIn && (
              <Link
                href="/events/createvent"
                className={styles.mobileCreateButton}
                onClick={() => setMobileMenuOpen(false)}
              >
                Créer un événement
              </Link>
            )}
            <Link
              href="/auth/register"
              className={styles.mobileSignupButton}
              onClick={() => setMobileMenuOpen(false)}
            >
              Inscription
            </Link>
            <Link
              href="/auth/login"
              className={styles.mobileLoginButton}
              onClick={() => setMobileMenuOpen(false)}
            >
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
