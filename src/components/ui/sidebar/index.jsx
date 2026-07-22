"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TicketCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useAuthMutations";
import styles from "./style.module.scss";

const Sidebar = ({ visible }) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();

  const isOrganizer = user?.role === "ORGANISATEUR" || user?.role === "ADMIN";
  const profile = {
    nom: user?.nom || "Utilisateur",
    prenom: user?.prenom || "",
    email: user?.email || "",
  };

  const menuItems = useMemo(() => {
    const items = [
      {
        href: "/events",
        title: "Découvrir",
        icon: <CalendarDays size={24} aria-hidden="true" />,
      },
    ];

    if (isOrganizer) {
      items.push({
        href: "/events/my-events",
        title: "Tableau de bord",
        icon: <LayoutDashboard size={24} aria-hidden="true" />,
      });
    }

    items.push(
      {
        href: "/participations",
        title: "Mes participations",
        icon: <TicketCheck size={24} aria-hidden="true" />,
      },
      {
        href: "/settings",
        title: "Paramètres",
        icon: <Settings size={24} aria-hidden="true" />,
      },
    );

    return items;
  }, [isOrganizer]);

  if (!visible) return null;

  const toggleMenu = () => {
    setIsCollapsed((current) => !current);
  };

  const handleLogOut = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      router.push("/auth/login");
    }
  };

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      id="menu_left"
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logoWrapper}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image
              src={isCollapsed ? "/flashicon.png" : "/LogoI.png"}
              alt="GetEvent"
              width={isCollapsed ? 36 : 130}
              height={isCollapsed ? 36 : 73}
              style={{
                height: "auto",
                objectFit: "contain",
                transition: "all 0.1s ease",
              }}
              priority
              quality={100}
            />
          </Link>
        </div>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={toggleMenu}
          title={isCollapsed ? "Déployer le menu" : "Réduire le menu"}
          aria-label={isCollapsed ? "Déployer le menu" : "Réduire le menu"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={20} aria-hidden="true" />
          )}
        </button>
      </div>

      <nav className={styles.sidebarNav} aria-label="Navigation principale">
        <ul>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                  title={item.title}
                >
                  <div className={styles.navIcon}>{item.icon}</div>
                  <span className={styles.navText}>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.mobileNav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavItem} ${isActive ? styles.active : ""}`}
                title={item.title}
              >
                {item.icon}
              </Link>
            );
          })}
        </div>

        <div className={styles.profileBox}>
          <div className={styles.avatarPlaceholder}>
            {profile.prenom?.charAt(0) || profile.nom?.charAt(0) || "U"}
          </div>
          <div className={styles.profileDetails}>
            <span className={styles.profileName}>
              {profile.prenom} {profile.nom}
            </span>
            <span className={styles.profileEmail}>
              {profile.email || "utilisateur@getevent.cd"}
            </span>
          </div>
        </div>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogOut}
          title="Se déconnecter"
          aria-label="Se déconnecter"
        >
          <LogOut size={20} aria-hidden="true" />
          <span className={styles.navText}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
