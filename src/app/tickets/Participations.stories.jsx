import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import { participantKeys } from "@/hooks/useParticipants";
import ParticipationsPage from "./page";

// Page « Mes billets » avec des billets fictifs, pour la voir sans compte.
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString();

const events = {
  cinema: {
    id: 10,
    title: "Nuit du Cinéma Africain",
    category: "Social",
    image: "/heroImg.png",
    startDate: inDays(20),
    startTime: "20:00",
    location: "Ave Jean-Paul II, Cotonou",
  },
  forum: {
    id: 9,
    title: "Forum des Jeunes Entrepreneurs",
    category: "Business",
    startDate: inDays(5),
    startTime: "09:00",
    location: "Centre International de Conférences, Cotonou",
  },
  concert: {
    id: 8,
    title: "Concert Afro-Rythmes",
    category: "Art",
    startDate: inDays(-3),
    startTime: "21:00",
    location: "Cotonou, Bénin",
  },
};

const ticket = (id, event, status = "VALID") => ({
  id,
  status,
  qrCode: `GETEVENT-${event.id}-${id}`,
  validatedAt: status === "USED" ? inDays(-3) : null,
  event,
});

const RAW = {
  participant: [
    ticket(101, events.cinema),
    ticket(102, events.forum),
    ticket(103, events.forum),
    ticket(104, events.forum, "USED"),
    ticket(105, events.concert, "USED"),
    // Billet en attente de remboursement (liste en cache pas encore
    // rafraîchie) : il ne doit pas être compté dans les billets à venir.
    ticket(106, events.cinema),
  ],
};

const USER = { id: 4, prenom: "Awa", nom: "Diallo", role: "PARTICIPANT" };

const withProviders = (data, refunds = []) => {
  function WithProviders(Story) {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    client.setQueryData(participantKeys.byUser(), data);
    client.setQueryData(["payments", "refunds", "mine", USER.id], {
      refunds,
    });
    return (
      <QueryClientProvider client={client}>
        <AuthContext.Provider
          value={{
            user: USER,
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
  return WithProviders;
};

const meta = {
  title: "Pages/Participations",
  component: ParticipationsPage,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
};

export default meta;

export const AvecBillets = {
  decorators: [
    withProviders(RAW, [
      {
        id: "r1",
        ticketId: 106,
        amount: 500,
        currency: "XOF",
        status: "PENDING",
        reason: "Empêchement",
        ticket: { event: events.cinema },
      },
    ]),
  ],
};

export const Vide = { decorators: [withProviders({ participant: [] })] };
