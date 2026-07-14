"use client";

export default function Button({ label, children, ...buttonProps }) {
  return <button {...buttonProps}>{children || label}</button>;
}
