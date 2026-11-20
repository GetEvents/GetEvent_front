import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import Sidebar from "./index";

// Navigation des utilisateurs connectés : barre latérale sur ordinateur,
// barre du bas sur mobile (bouton « Créer » au centre pour un organisateur).
const withUser = (role) => {
  function WithUser(Story) {
    const client = new QueryClient();
    return (
      <QueryClientProvider client={client}>
        <AuthContext.Provider
          value={{
            user: {
              id: 4,
              prenom: "Awa",
              nom: "Diallo",
              email: "awa@example.com",
              role,
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
          <div style={{ minHeight: "100vh", background: "var(--ge-paper)" }}>
            <Story />
          </div>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }
  return WithUser;
};

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  args: { visible: true },
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/events" } },
  },
};

export default meta;

export const Organisateur = { decorators: [withUser("ORGANISATEUR")] };

export const Participant = { decorators: [withUser("PARTICIPANT")] };
