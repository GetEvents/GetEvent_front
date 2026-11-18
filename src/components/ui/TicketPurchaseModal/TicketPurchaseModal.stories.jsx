import TicketPurchaseModal from "./index";

const baseEvent = {
  id: 10,
  title: "Nuit du Cinéma Africain",
  image: "/heroImg.png",
  startDate: "2027-01-01T00:00:00.000Z",
  startTime: "20:00",
  location: "Ave Jean-Paul II, Cotonou, Bénin",
  capacity: 500,
  paymentRequired: true,
  paymentPrice: 500,
  currency: "XOF",
};

const meta = {
  title: "UI/TicketPurchaseModal",
  component: TicketPurchaseModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    isLoading: false,
    alreadyRegisteredCount: 0,
    event: baseEvent,
  },
  argTypes: {
    onClose: { action: "close" },
    onConfirm: { action: "confirm" },
  },
};

export default meta;

export const Payant = {};

export const Gratuit = {
  args: {
    event: { ...baseEvent, paymentRequired: false, paymentPrice: 0 },
  },
};

export const DejaInscrit = {
  args: { alreadyRegisteredCount: 2 },
};

export const EnCours = {
  args: { isLoading: true },
};
