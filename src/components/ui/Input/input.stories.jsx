import Input from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360, maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Text = {
  args: {
    label: "Nom de l'événement",
    name: "title",
    id: "title",
    type: "text",
    required: true,
    defaultValue: "Concert GetEvent",
  },
};

export const Email = {
  args: {
    label: "Adresse mail",
    name: "email",
    id: "email",
    type: "email",
    defaultValue: "participant@getevent.test",
  },
};

export const Password = {
  args: {
    label: "Mot de passe",
    name: "password",
    id: "password",
    type: "password",
    defaultValue: "motdepasse123",
  },
};

export const Select = {
  args: {
    label: "Rôle",
    name: "role",
    id: "role",
    type: "select",
    defaultValue: "ORGANISATEUR",
    options: [
      { value: "ORGANISATEUR", label: "Organisateur" },
      { value: "PARTICIPANT", label: "Participant" },
    ],
  },
};

export const Textarea = {
  args: {
    label: "Description",
    name: "description",
    id: "description",
    type: "textarea",
    value: "Une soirée organisée avec billetterie et QR code.",
  },
};
