import TicketQRCode from "./TicketQRCode";

const meta = {
  title: "Events/TicketQRCode",
  component: TicketQRCode,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    value: "GETEVENT-TICKET-2026-0001",
  },
};

export default meta;

export const Default = {};

export const LongTicketValue = {
  args: {
    value:
      "GETEVENT|EVENT:42|PARTICIPATION:108|USER:25|SIGNATURE:demo-storybook",
  },
};
