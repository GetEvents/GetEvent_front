"use client";

import { useActionState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input/input";
import { forgotPassword } from "@/actions/auth/authActions";
import styles from "./style.module.scss";

const initialState = null;

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPassword,
    initialState,
  );

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

      <form action={formAction} className={styles.form}>
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
          disabled={pending}
        >
          {pending ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>
    </div>
  );
}
