"use client";

import { usePathname } from "next/navigation";
import Navbar from "./NavBar";
import React from "react";

export default function NavbarWrapper({ currentUser }) {
  const pathname = usePathname();

  // Les pages /auth ont leur propre mise en page (logo dans le bloc affiche).
  if (pathname?.startsWith("/auth/")) {
    return null;
  }

  // const isHome = pathname === "/";

  return (
    <>
      <Navbar currentUser={currentUser} />
      {/* {!isHome && <div className={styles.navbarSpacer} />} */}
    </>
  );
}
