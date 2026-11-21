import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import { eventKeys } from "@/hooks/useEvents";
import { participantKeys } from "@/hooks/useParticipants";
import { paymentKeys } from "@/hooks/usePayout";
import Dashboard from "./index";

// Données fictives : le tableau de bord lit le cache React Query, pré-rempli
// ici pour l'afficher sans compte ni serveur.
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString();

const EVENTS = [
  {
    id: 1,
    title: "Nuit du Cinéma Africain",
    startDate: inDays(20),
    endDate: inDays(21),
    capacity: 500,
    paymentRequired: true,
    paymentPrice: 500,
    currency: "XOF",
    location: "Cotonou, Bénin",
  },
  {
    id: 2,
    title: "Forum des Jeunes Entrepreneurs",
    startDate: inDays(5),
    endDate: inDays(6),
    capacity: 200,
    paymentRequired: false,
    paymentPrice: 0,
    location: "Cotonou, Bénin",
  },
  {
    id: 3,
    title: "Sommet des entrepreneurs",
    startDate: inDays(-30),
    endDate: inDays(-29),
    capacity: 150,
    paymentRequired: true,
    paymentPrice: 15000,
    currency: "XOF",
    location: "Porto-Novo, Bénin",
  },
];

const person = (id, prenom, nom, status = "VALID") => ({
  id,
  status,
  createdAt: inDays(-id),
  user: {
    id: id + 100,
    prenom,
    nom,
    email: `${prenom.toLowerCase()}@example.com`,
  },
});

const PARTICIPANTS = {
  1: [
    person(1, "Awa", "Diallo"),
    person(2, "Koffi", "Mensah"),
    person(3, "Fatou", "Sow"),
  ],
  2: [person(4, "Yao", "Kouassi"), person(5, "Aïcha", "Bello")],
  3: [
    person(6, "Ibrahim", "Traoré", "USED"),
    person(7, "Mariam", "Keïta", "USED"),
  ],
};

// Demandes de remboursement en attente (onglet « Remboursements », admin).
const REFUNDS = [
  {
    id: "r1",
    amount: 5000,
    currency: "XOF",
    status: "PENDING",
    reason: "Empêchement de dernière minute, je ne pourrai pas venir.",
    createdAt: "2026-11-18T10:00:00.000Z",
    transaction: { providerTransactionId: 460512, providerId: "GE-1-8f2c" },
    ticket: {
      id: 101,
      user: { prenom: "Awa", nom: "Diallo", email: "awa@example.com" },
      event: { id: 1, title: "Nuit du Cinéma Africain" },
    },
  },
  {
    id: "r2",
    amount: 15000,
    currency: "XOF",
    status: "PENDING",
    reason: null,
    createdAt: "2026-11-20T15:30:00.000Z",
    transaction: { providerTransactionId: 460587, providerId: "GE-2-a91d" },
    ticket: {
      id: 102,
      user: { prenom: "Koffi", nom: "Mensah", email: "koffi@example.com" },
      event: { id: 2, title: "Forum des Jeunes Entrepreneurs" },
    },
  },
];

const buildClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  client.setQueryData(eventKeys.mine(), { events: EVENTS });
  EVENTS.forEach((ev) =>
    client.setQueryData(participantKeys.byEvent(ev.id), {
      participant: { data: PARTICIPANTS[ev.id] },
    }),
  );
  client.setQueryData(paymentKeys.balance(), {
    success: true,
    balance: 31500,
    reservedBalance: 1500,
    availableBalance: 30000,
    currency: "XOF",
  });
  client.setQueryData(paymentKeys.refunds("PENDING"), {
    success: true,
    refunds: REFUNDS,
  });
  return client;
};

const withProviders = (role) => {
  function WithProviders(Story) {
    return (
      <QueryClientProvider client={buildClient()}>
        <AuthContext.Provider
          value={{
            user: { id: 4, prenom: "Marc", nom: "Organisateur", role },
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
  title: "Pages/Dashboard",
  component: Dashboard,
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Organisateur = { decorators: [withProviders("ORGANISATEUR")] };

export const Administrateur = { decorators: [withProviders("ADMIN")] };
