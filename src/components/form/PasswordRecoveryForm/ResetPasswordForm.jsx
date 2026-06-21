"use client";

import { useEffect } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input/input";
import { useResetPassword } from "@/hooks/useAuthMutations";
import styles from "./style.module.scss";

export default function ResetPasswordForm({ token }) {
  const mutation = useResetPassword();
  const state = mutation.data;
  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(new FormData(event.currentTarget));
  };

  useEffect(() => {
    if (!state?.error && state?.redirect) {
      const timeout = window.setTimeout(() => {
        window.location.href = state.redirect;
      }, 1500);

      return () => window.clearTimeout(timeout);
    }
  }, [state]);

  return (
    <div className={styles.container}>
      <Link href="/auth/login" className={styles.backLink}>
        ← Retour à la connexion
      </Link>

      <div className={styles.header}>
        <h1>Nouveau mot de passe</h1>
        <p>Choisissez un mot de passe d’au moins 8 caractères.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="hidden" name="token" value={token} />

        <Input
          name="password"
          label="Nouveau mot de passe"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          name="passwordConfirmation"
          label="Confirmer le mot de passe"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />

        {state?.message && (
          <p
            className={`${styles.message} ${
              state.error ? styles.error : styles.success
            }`}
            role="status"
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={mutation.isPending || !token}
        >
          {mutation.isPending ? "Modification..." : "Modifier le mot de passe"}
        </button>
      </form>
    </div>
  );
}
