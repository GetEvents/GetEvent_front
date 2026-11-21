import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import { NotificationProvider } from "@/components/Notification/NotificationProvider";
import CreateEvent from "./index";
// Mêmes marges que la vraie page (/events/new).
import pageStyles from "@/app/events/new/style.module.scss";

// Formulaire de création d'événement, vu par un organisateur connecté.
const withProviders = (pays) => {
  function WithProviders(Story) {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return (
      <QueryClientProvider client={client}>
        <AuthContext.Provider
          value={{
            user: {
              id: 4,
              prenom: "Awa",
              nom: "Diallo",
              role: "ORGANISATEUR",
              pays,
            },
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
            <div className={pageStyles.page}>
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
  title: "Pages/Créer un événement",
  component: CreateEvent,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
};

export default meta;

export const OrganisateurBenin = { decorators: [withProviders("BJ")] };

// Hors Bénin : billetterie verrouillée sur « gratuit » avec un message.
export const OrganisateurHorsBenin = { decorators: [withProviders("TG")] };
