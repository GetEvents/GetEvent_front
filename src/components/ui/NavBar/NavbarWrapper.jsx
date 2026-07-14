"use client";

import { usePathname } from "next/navigation";
import Navbar from "./NavBar";
import React from "react";

export default function NavbarWrapper({ currentUser }) {
  const pathname = usePathname();

  if (pathname === "/auth/login" || pathname === "/auth/register") {
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
