"use client";

import dynamic from "next/dynamic";
import React from "react";

const Footer = dynamic(() => import("./Bar_page"), {
  loading: () => null,
});

export default function FooterWrapper() {
  return <Footer />;
}
