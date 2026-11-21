import ConversationHeader from "./ConversationHeader";
import MessageClient from "./MessageClient";
import styles from "./style.module.scss";

// Page de discussion d'un événement, avec une conversation fictive
// (l'utilisateur courant est Awa, l'organisateur est Koffi).
const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const people = {
  awa: { id: 4, prenom: "Awa", nom: "Diallo" },
  koffi: { id: 9, prenom: "Koffi", nom: "Mensah" },
  fatou: { id: 12, prenom: "Fatou", nom: "Sow" },
};

const message = (id, sender, text, minutes) => ({
  id,
  text,
  senderId: sender.id,
  sender,
  createdAt: minutesAgo(minutes),
});

const MESSAGES = [
  message(
    1,
    people.koffi,
    "Bienvenue à tous ! Les portes ouvrent à 19h30.",
    95,
  ),
  message(
    2,
    people.fatou,
    "Super, est-ce qu'il y a un parking sur place ?",
    80,
  ),
  message(
    3,
    people.koffi,
    "Oui, un parking gratuit juste derrière la salle. Pensez à votre billet QR.",
    75,
  ),
  message(4, people.awa, "Merci ! On peut venir avec des enfants ?", 12),
  message(
    5,
    people.koffi,
    "Bien sûr, l'entrée est libre pour les moins de 12 ans.",
    6,
  ),
];

const meta = {
  title: "Pages/Messagerie",
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
};

export default meta;

const Page = ({ initialMessages }) => (
  <main className={styles.page}>
    <ConversationHeader eventId={10} title="Nuit du Cinéma Africain" />
    <MessageClient
      eventId={10}
      token="demo"
      currentUserId={people.awa.id}
      currentUser={people.awa}
      organizerId={people.koffi.id}
      canChat
      initialMessages={initialMessages}
    />
  </main>
);

export const Conversation = {
  render: () => <Page initialMessages={MESSAGES} />,
};

export const Vide = { render: () => <Page initialMessages={[]} /> };
