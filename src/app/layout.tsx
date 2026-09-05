import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-phone-number-input/style.css";
import Footer from "@/components/ui/Footer/Bar_page";
import NavbarWrapper from "@/components/ui/NavBar/NavbarWrapper";
import Sidebar from "@/components/ui/sidebar";
import { NotificationProvider } from "@/components/Notification/NotificationProvider";
import PushNotificationManager from "@/components/Notification/PushNotificationManager";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import CookieConsent from "@/components/CookieConsent/CookieConsent";
import AuthProvider from "@/context/AuthProvider";
import Providers from "./providers";
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "GetEvent",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/flashicon.png", sizes: "32x32", type: "image/png" },
      { url: "/flashicon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/flashicon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#171717",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let currentUser = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userResponse = token ? await getUser() : null;
    currentUser = userResponse?.user || null;
  } catch {
    currentUser = null;
  }

  const isLoggedIn = Boolean(currentUser);

  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider initialUser={currentUser}>
          <NotificationProvider>
            <Providers>
              <NavbarWrapper currentUser={isLoggedIn} />

              <div
                className={isLoggedIn ? styles.loginIsTrue : styles.container}
              >
                <div className={styles.containerSaideBar}>
                  {isLoggedIn && <Sidebar visible={true} />}
                </div>
                {children}
              </div>
              <Footer currentUser={isLoggedIn} />
              <PwaInstallPrompt />
              <PushNotificationManager isLoggedIn={isLoggedIn} />
              <CookieConsent hasMobileSidebar={isLoggedIn} />
            </Providers>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
