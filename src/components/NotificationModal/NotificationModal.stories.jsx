import { useState } from "react";
import NotificationModal from "./NotificationModal";

// Dates relatives à aujourd'hui, pour voir les groupes « Aujourd'hui »,
// « Hier » et plus anciens.
const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

const sampleNotifications = [
  {
    id: 1,
    title: "Participation confirmée",
    message:
      "Votre billet QR code est disponible pour Nuit du Cinéma Africain.",
    type: "success",
    isRead: false,
    createdAt: minutesAgo(3),
  },
  {
    id: 2,
    title: "Nouveau message",
    message: "L'organisateur a publié une information importante.",
    type: "info",
    isRead: false,
    createdAt: minutesAgo(95),
  },
  {
    id: 3,
    title: "Événement bientôt complet",
    message: "Plus que 12 places pour Forum des Jeunes Entrepreneurs.",
    type: "warning",
    isRead: true,
    createdAt: minutesAgo(60 * 26),
  },
  {
    id: 4,
    title: "Paiement échoué",
    message: "Le paiement Mobile Money n'a pas abouti. Vous pouvez réessayer.",
    type: "error",
    isRead: true,
    createdAt: minutesAgo(60 * 24 * 4),
  },
];

function NotificationModalStory({ initialNotifications }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationCount, setNotificationCount] = useState(
    initialNotifications.filter((notification) => !notification.isRead).length,
  );

  return (
    <div style={{ minHeight: 520 }}>
      <p>Notifications non lues : {notificationCount}</p>
      <NotificationModal
        isOpen
        onClose={() => {}}
        notifications={notifications}
        setNotifications={setNotifications}
        setNotificationCount={setNotificationCount}
      />
    </div>
  );
}

const meta = {
  title: "Components/NotificationModal",
  component: NotificationModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const WithNotifications = {
  render: () => (
    <NotificationModalStory initialNotifications={sampleNotifications} />
  ),
};

export const Empty = {
  render: () => <NotificationModalStory initialNotifications={[]} />,
};
