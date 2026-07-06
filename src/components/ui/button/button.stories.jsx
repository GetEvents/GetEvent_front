import Button from "./index";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    label: "Créer un événement",
    type: "button",
  },
  argTypes: {
    onClick: { action: "clicked" },
  },
};

export default meta;

export const Default = {};

export const WithChildren = {
  args: {
    children: "Voir les détails",
    label: undefined,
  },
};

export const Disabled = {
  args: {
    label: "Chargement...",
    disabled: true,
  },
};
