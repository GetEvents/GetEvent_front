import "./globals.css";
import React from "react";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <Providers> {children} </Providers>
      </body>
    </html>
  );
}
