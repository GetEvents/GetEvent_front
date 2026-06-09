"use client";
import Input from "@/components/ui/Input/input";
import { login } from "@/actions/auth/authActions";
import { useActionState, useEffect, React } from "react";
import style from "./style.module.scss";
import Link from "next/link";
import { useNotification } from "@/components/Notification/NotificationProvider";

const initialState = {
  message: "",
};

const Login = () => {
  const [state, formAction, pending] = useActionState(login, initialState);
  const { notify } = useNotification();

  useEffect(() => {
    if (state?.message) {
      notify(state.message, state?.error ? "error" : "success");
    }

    if (!state?.error && state.redirect) {
      window.location.href = state.redirect;
    }
  }, [notify, state]);

  return (
    <div className={style.forminscription}>
      <div className={`${style.container} ${style.forminfo}`}>
        {/* Header avec boutons Retour et S'inscrire */}
        <div className={style.formHeader}>
          <Link href="/" className={style.backButton}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour
          </Link>
          <Link href="/auth/register" className={style.createAccountButton}>
            Créez votre compte
          </Link>
        </div>

        {/* Titre et sous-titre */}
        <div className={style.formact}>
          <h2>Bienvenue</h2>
          <p>
            Connectez-vous pour accéder à votre espace et gérer vos événements
          </p>
        </div>

        {/* Bouton Google */}
        <button
          type="button"
          className={style.googleButton}
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3001"}/api/auth/google`;
          }}
        >
          <svg className={style.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </button>

        {/* Séparateur OU */}
        <div className={style.separator}>
          <div className={style.separatorLine}></div>
          <span className={style.separatorText}>OU</span>
          <div className={style.separatorLine}></div>
        </div>

        <form className={style.form} action={formAction}>
          {/* Email */}
          <div className={style.inputFull}>
            <Input name="email" label="Adresse mail" type="email" required />
          </div>

          {/* Mot de passe avec icône œil */}
          <div className={style.inputFull}>
            <Input
              name="password"
              label="Mot de passe"
              type="password"
              required
            />
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            className={style.submitButton}
            disabled={pending}
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>

          <p className={style.registerLink}>
            Vous n&apos;avez pas de compte ?{" "}
            <Link href="/auth/register">Inscrivez-vous</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
