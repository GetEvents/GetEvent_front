import "./globals.css";
import React from "react";
import AuthProvider from "@/constext/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <AuthProvider> {children} </AuthProvider>
      </body>
    </html>
  );
}
