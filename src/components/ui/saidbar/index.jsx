"use client";
import Link from "next/link";
import styles from "./style.module.scss";
import { getUser, logout } from "@/actions/auth/authActions";
import { initMenuToggle } from "@/utils/menu";
import { useEffect, useState, React } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
const Sidebar = ({ visible }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState({
    nom: "Utilisateur",
    prenom: "",
    email: "",
  });
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    initMenuToggle();

    let isMounted = true;

    // Récupérer le profil via l'action serveur `getUser`
    getUser()
      .then((response) => {
        if (isMounted && response?.user) {
          const u = response.user;
          setProfile({
            nom: u.nom || u.name || "Utilisateur",
            prenom: u.prenom || "",
            email: u.email || "",
            photo: u.photo || null,
          });
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du profil:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!visible) return null;

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogOut = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const menuItems = [
    {
      href: "/events",
      title: "Événements",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
      ),
    },
    {
      href: "/events/my-events",
      title: "Mes événements",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
        </svg>
      ),
    },
    {
      href: "/participations",
      title: "Mes Participations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 640 512"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M320 64C355.3 64 384 92.7 384 128C384 163.3 355.3 192 320 192C284.7 192 256 163.3 256 128C256 92.7 284.7 64 320 64zM416 376C416 401 403.3 423 384 435.9L384 528C384 554.5 362.5 576 336 576L304 576C277.5 576 256 554.5 256 528L256 435.9C236.7 423 224 401 224 376L224 336C224 283 267 240 320 240C373 240 416 283 416 336L416 376zM160 96C190.9 96 216 121.1 216 152C216 182.9 190.9 208 160 208C129.1 208 104 182.9 104 152C104 121.1 129.1 96 160 96zM176 336L176 368C176 400.5 188.1 430.1 208 452.7L208 528C208 529.2 208 530.5 208.1 531.7C199.6 539.3 188.4 544 176 544L144 544C117.5 544 96 522.5 96 496L96 439.4C76.9 428.4 64 407.7 64 384L64 352C64 299 107 256 160 256C172.7 256 184.8 258.5 195.9 262.9C183.3 284.3 176 309.3 176 336zM432 528L432 452.7C451.9 430.2 464 400.5 464 368L464 336C464 309.3 456.7 284.4 444.1 262.9C455.2 258.4 467.3 256 480 256C533 256 576 299 576 352L576 384C576 407.7 563.1 428.4 544 439.4L544 496C544 522.5 522.5 544 496 544L464 544C451.7 544 440.4 539.4 431.9 531.7C431.9 530.5 432 529.2 432 528zM480 96C510.9 96 536 121.1 536 152C536 182.9 510.9 208 480 208C449.1 208 424 182.9 424 152C424 121.1 449.1 96 480 96z" />
        </svg>
      ),
    },
    {
      href: "/settings",
      title: "Paramètres",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4m9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
        </svg>
      ),
    },
  ];
  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      id="menu_left"
    >
      {/* HEADER: LOGO & TOGGLE */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logoWrapper}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image
              src={isCollapsed ? "/flashicon.png" : "/LogoI.png"}
              alt="GetEvent Logo"
              width={isCollapsed ? 36 : 130}
              height={isCollapsed ? 36 : 45}
              style={{ objectFit: "contain", transition: "all 0.1s ease" }}
              priority
              quality={100}
            />
          </Link>
        </div>
        <button
          className={styles.toggleBtn}
          onClick={toggleMenu}
          title="Réduire"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M14 2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z" />
            <path d="M3 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
          </svg>
        </button>
      </div>

      {/* BODY: LINKS */}
      <nav className={styles.sidebarNav}>
        <ul>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <li key={index}>
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

      {/* FOOTER: PROFILE & LOGOUT */}
      <div className={styles.sidebarFooter}>
        <div className={styles.profileBox}>
          <div className={styles.avatarPlaceholder}>
            {profile.prenom?.charAt(0) || profile.nom?.charAt(0) || "U"}
          </div>
          <div className={styles.profileDetails}>
            <span className={styles.profileName}>
              {profile.prenom} {profile.nom}
            </span>
            <span className={styles.profileEmail}>
              {profile.email || "organisateur@getevent.cd"}
            </span>
          </div>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={handleLogOut}
          title="Se déconnecter"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"
            />
            <path
              fillRule="evenodd"
              d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"
            />
          </svg>
          <span className={styles.navText}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
