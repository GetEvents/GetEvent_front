"use client";

import Link from "next/link";
import Input from "@/components/ui/Input/input";
import { useForgotPassword } from "@/hooks/useAuthMutations";
import styles from "./style.module.scss";

export default function ForgotPasswordForm() {
  const mutation = useForgotPassword();
  const state = mutation.data;
  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(new FormData(event.currentTarget));
  };

  return (
    <div className={styles.container}>
      <Link href="/auth/login" className={styles.backLink}>
        ← Retour à la connexion
      </Link>

      <div className={styles.header}>
        <h1>Mot de passe oublié ?</h1>
        <p>
          Saisissez votre adresse e-mail. Nous vous enverrons un lien pour
          choisir un nouveau mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          name="email"
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
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
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>
    </div>
  );
}
