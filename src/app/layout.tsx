import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/ui/Footer/Bar_page";
import NavbarWrapper from "@/components/ui/NavBar/NavbarWrapper";
import SaidBar from "@/components/ui/saidbar";
import { NotificationProvider } from "@/components/Notification/NotificationProvider";
import AuthProvider from "@/constext/AuthProvider";
import styles from "./layout.module.scss";
import { cookies } from "next/headers";
import { getUser } from "@/actions/auth/authActions";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GetEvent - Plateforme de gestion d'événements",
  description:
    "Créez, gérez et participez à des événements facilement avec GetEvent",
  icons: {
    icon: [
      { url: "/flashicon.png", sizes: "32x32", type: "image/png" },
      { url: "/flashicon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/flashicon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userResponse = token ? await getUser() : null;
  const currentUser = userResponse?.user || null;

  // Vérifier si le token existe (validation complète côté client)
  const isLoggedIn = Boolean(currentUser);

  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/flashicon.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/flashicon.png" />
        <link
          rel="apple-touch-icon"
          type="image/png"
          sizes="180x180"
          href="/flashicon.png"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <NavbarWrapper currentUser={isLoggedIn} />
            {/* {!isLoggedIn && (
              <>
                <div className={styles.triangle}></div>
                <div className={styles.circle_red}></div>
                <div className={styles.circle_redii}></div>
                <div className={styles.circle_green}></div>
              </>
            )} */}
            <div className={isLoggedIn ? styles.loginIsTrue : styles.container}>
              <div className={styles.containerSaideBar}>
                {isLoggedIn && <SaidBar visible={true} />}
              </div>
              {children}
            </div>
            <Footer currentUser={isLoggedIn} />
          </NotificationProvider>
        </AuthProvider>
        <Script src="/js/anime.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
