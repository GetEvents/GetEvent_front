import { useState } from "react";
import NotificationModal from "./NotificationModal";

const sampleNotifications = [
  {
    id: 1,
    title: "Participation confirmée",
    message: "Votre billet QR code est disponible pour l'événement.",
    type: "success",
    isRead: false,
    createdAt: "2026-07-06T10:30:00.000Z",
  },
  {
    id: 2,
    title: "Nouveau message",
    message: "L'organisateur a publié une information importante.",
    type: "info",
    isRead: true,
    createdAt: "2026-07-06T09:15:00.000Z",
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
