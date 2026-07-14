import { act } from "react";
import { createRoot } from "react-dom/client";

export async function render(ui) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(ui);
  });

  return {
    container,
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
}

export async function click(element) {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    await Promise.resolve();
  });
}

export async function submit(element) {
  await act(async () => {
    element.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    await Promise.resolve();
  });
}

export async function change(element, value) {
  await act(async () => {
    const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
      prototype,
      "value",
    )?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.resolve();
  });
}

export function getByText(container, text) {
  const matcher =
    typeof text === "string"
      ? (value) => value === text
      : text instanceof RegExp
        ? (value) => text.test(value)
        : text;
  const element = Array.from(container.querySelectorAll("*")).find((node) =>
    matcher(node.textContent?.trim() || ""),
  );

  if (!element) {
    throw new Error(`Unable to find text: ${text}`);
  }

  return element;
}
