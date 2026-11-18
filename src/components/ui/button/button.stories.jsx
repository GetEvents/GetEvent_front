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
    variant: {
      control: "select",
      options: [
        undefined,
        "primary",
        "white",
        "accent",
        "outline-dark",
        "outline-light",
      ],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
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

// ---- Design « affiche » -------------------------------------------------------

export const Primary = { args: { variant: "primary" } };

export const Accent = { args: { variant: "accent" } };

export const OutlineDark = {
  args: { variant: "outline-dark", label: "Voir les événements" },
};

const darkBackground = (Story) => (
  <div style={{ padding: 24, background: "#1c1c1e" }}>
    <Story />
  </div>
);

export const White = {
  args: { variant: "white" },
  decorators: [darkBackground],
};

export const OutlineLight = {
  args: { variant: "outline-light", label: "Je participe" },
  decorators: [darkBackground],
};

export const Sizes = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} size="sm" label="Petit" />
      <Button {...args} label="Moyen" />
      <Button {...args} size="lg" label="Grand" />
    </div>
  ),
  args: { variant: "primary" },
};
