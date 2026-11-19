import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import { NotificationProvider } from "@/components/Notification/NotificationProvider";
import SettingsPage from "./page";

// Page « Paramètres » avec un utilisateur fictif, pour la voir sans compte.
const USER = {
  id: 4,
  prenom: "Marc",
  nom: "Organisateur",
  email: "marc@example.com",
  role: "ORGANISATEUR",
  pays: "BJ",
  numero: "+22997000000",
  date_naissance: "1995-06-15",
};

const withProviders = (user) => {
  function WithProviders(Story) {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    client.setQueryData(["payments", "stripe-onboarding", user.id], {
      success: true,
      isComplete: false,
    });
    return (
      <QueryClientProvider client={client}>
        <AuthContext.Provider
          value={{
            user,
            token: null,
            isAuthenticated: true,
            loading: false,
            error: null,
            setUser: () => {},
            setToken: () => {},
            logout: () => {},
          }}
        >
          <NotificationProvider>
            <div style={{ minHeight: "100vh", background: "var(--ge-paper)" }}>
              <Story />
            </div>
          </NotificationProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }
  return WithProviders;
};

const meta = {
  title: "Pages/Paramètres",
  component: SettingsPage,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
};

export default meta;

export const Organisateur = { decorators: [withProviders(USER)] };

export const Participant = {
  decorators: [withProviders({ ...USER, role: "PARTICIPANT" })],
};
