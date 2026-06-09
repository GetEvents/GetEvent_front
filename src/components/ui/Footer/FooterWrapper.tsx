"use client";

import dynamic from "next/dynamic";

const Footer = dynamic(() => import("./Bar_page"), {
  loading: () => null,
});

interface FooterWrapperProps {
  currentUser?: boolean;
}

export default function FooterWrapper({
  currentUser = false,
}: FooterWrapperProps) {
  return <Footer currentUser={currentUser} />;
}
