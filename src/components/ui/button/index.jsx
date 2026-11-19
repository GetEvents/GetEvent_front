"use client";

import styles from "./Button.module.scss";

const VARIANTS = {
  primary: styles.primary,
  white: styles.white,
  accent: styles.accent,
  "outline-dark": styles.outlineDark,
  "outline-light": styles.outlineLight,
};

/**
 * Bouton du design « affiche ».
 *
 * Sans `variant`, le bouton n'a aucun style propre (comportement historique :
 * la page fournit son `className`). Avec `variant`, il prend le style partagé.
 *
 * @param {object} props
 * @param {"primary"|"white"|"accent"|"outline-dark"|"outline-light"} [props.variant]
 * @param {"sm"|"md"|"lg"} [props.size="md"]
 * @param {boolean} [props.block] Pleine largeur.
 */
export default function Button({
  label,
  children,
  variant,
  size = "md",
  block = false,
  className = "",
  ...buttonProps
}) {
  const classes = variant
    ? [
        VARIANTS[variant],
        size !== "md" && styles[size],
        block && styles.block,
        className,
      ]
        .filter(Boolean)
        .join(" ")
    : className || undefined;

  return (
    <button className={classes} {...buttonProps}>
      {children || label}
    </button>
  );
}
