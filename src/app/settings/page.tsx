"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Check, CreditCard, ShieldCheck, Trash2 } from "lucide-react";
import {
  changeCurrentPassword,
  deleteCurrentAccount,
} from "@/actions/auth/authActions";
import {
  createSellerAccountLink,
  getStripeOnboardingStatus,
} from "@/actions/payment";
import Profil from "@/components/profile";
import ProfilForm from "@/components/form/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import styles from "./style.module.scss";

type PasswordState = {
  newPassword: string;
  confirmPassword: string;
  error: string;
  success: string;
  loading: boolean;
};

type StripeStatus = "checking" | "onboarded" | "not_onboarded";

const initialPasswordState: PasswordState = {
  newPassword: "",
  confirmPassword: "",
  error: "",
  success: "",
  loading: false,
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [passwordState, setPasswordState] =
    useState<PasswordState>(initialPasswordState);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus>("checking");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const canConfigurePayments =
    user?.role === "ORGANISATEUR" || user?.role === "ADMIN";

  useEffect(() => {
    if (!canConfigurePayments) return;

    let cancelled = false;

    void getStripeOnboardingStatus()
      .then((result) => {
        if (cancelled) return;

        if (!result.success) {
          setStripeError(result.message);
          setStripeStatus("not_onboarded");
          return;
        }

        setStripeStatus(result.isComplete ? "onboarded" : "not_onboarded");
      })
      .catch(() => {
        if (!cancelled) {
          setStripeError("Impossible de vérifier le statut Stripe.");
          setStripeStatus("not_onboarded");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canConfigurePayments]);

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newPassword = passwordState.newPassword.trim();

    if (newPassword !== passwordState.confirmPassword.trim()) {
      setPasswordState((currentState) => ({
        ...currentState,
        error: "Les nouveaux mots de passe ne correspondent pas.",
        success: "",
      }));
      return;
    }

    setPasswordState((currentState) => ({
      ...currentState,
      error: "",
      success: "",
      loading: true,
    }));

    try {
      const result = await changeCurrentPassword(newPassword);

      if (result.error) {
        setPasswordState((currentState) => ({
          ...currentState,
          error: result.message,
          loading: false,
        }));
        return;
      }

      setPasswordState({
        ...initialPasswordState,
        success: result.message,
      });
    } catch {
      setPasswordState((currentState) => ({
        ...currentState,
        error: "Une erreur est survenue pendant la modification.",
        loading: false,
      }));
    }
  };

  const handleStripeConnect = async () => {
    if (stripeStatus === "onboarded" || stripeLoading) return;

    setStripeLoading(true);
    setStripeError("");

    try {
      const result = await createSellerAccountLink();

      if (!result.success || !result.accountLinkUrl) {
        setStripeError(result.message);
        return;
      }

      window.location.assign(result.accountLinkUrl);
    } catch {
      setStripeError("Impossible d'ouvrir la configuration Stripe.");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Supprimer définitivement votre compte et toutes vos données ?",
    );

    if (!confirmed || deleteLoading) return;

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const result = await deleteCurrentAccount();

      if (result.error) {
        setDeleteError(result.message);
        return;
      }

      window.location.assign("/");
    } catch {
      setDeleteError("Impossible de supprimer votre compte.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Paramètres du compte</h1>
          <p>Gérez votre profil, votre sécurité et vos paiements.</p>
        </header>

        <div className={styles.content}>
          <aside className={styles.profileColumn}>
            <div className={styles.card}>
              <Profil />
            </div>
          </aside>

          <div className={styles.settingsColumn}>
            <section className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2>Informations personnelles</h2>
              </div>
              <ProfilForm id />
            </section>

            {canConfigurePayments && (
              <section className={styles.card}>
                <div className={styles.sectionTitle}>
                  <CreditCard aria-hidden="true" />
                  <div>
                    <h2>Paiements Stripe</h2>
                    <p>
                      Configurez le compte qui recevra vos ventes de billets.
                    </p>
                  </div>
                </div>

                {stripeError && (
                  <p className={styles.message_error} role="alert">
                    {stripeError}
                  </p>
                )}

                <div className={styles.paymentRow}>
                  <div>
                    <h3>Compte de réception</h3>
                    <p>Associez votre compte bancaire à votre espace.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStripeConnect}
                    className={
                      stripeStatus === "onboarded"
                        ? styles.btn_success
                        : styles.btn_primary
                    }
                    disabled={
                      stripeLoading ||
                      stripeStatus === "checking" ||
                      stripeStatus === "onboarded"
                    }
                  >
                    {stripeStatus === "onboarded" && (
                      <Check aria-hidden="true" />
                    )}
                    {stripeStatus === "checking"
                      ? "Vérification..."
                      : stripeStatus === "onboarded"
                        ? "Compte configuré"
                        : stripeLoading
                          ? "Connexion..."
                          : "Configurer Stripe"}
                  </button>
                </div>
              </section>
            )}

            <section className={styles.card}>
              <div className={styles.sectionTitle}>
                <ShieldCheck aria-hidden="true" />
                <div>
                  <h2>Mot de passe</h2>
                  <p>Utilisez au moins huit caractères.</p>
                </div>
              </div>

              {passwordState.error && (
                <p className={styles.message_error} role="alert">
                  {passwordState.error}
                </p>
              )}
              {passwordState.success && (
                <p className={styles.message_success} role="status">
                  {passwordState.success}
                </p>
              )}

              <form
                className={styles.passwordForm}
                onSubmit={handlePasswordSubmit}
              >
                <div className={styles.form_group}>
                  <label htmlFor="new-password">Nouveau mot de passe</label>
                  <input
                    id="new-password"
                    type="password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    value={passwordState.newPassword}
                    onChange={(event) =>
                      setPasswordState((currentState) => ({
                        ...currentState,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="confirm-password">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    value={passwordState.confirmPassword}
                    onChange={(event) =>
                      setPasswordState((currentState) => ({
                        ...currentState,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                </div>
                <button
                  type="submit"
                  className={styles.btn_primary}
                  disabled={passwordState.loading}
                >
                  {passwordState.loading
                    ? "Mise à jour..."
                    : "Modifier le mot de passe"}
                </button>
              </form>
            </section>

            <section className={`${styles.card} ${styles.card_danger}`}>
              <div className={styles.sectionTitle}>
                <Trash2 aria-hidden="true" />
                <div>
                  <h2>Supprimer le compte</h2>
                  <p>Cette action effacera définitivement vos données.</p>
                </div>
              </div>

              {deleteError && (
                <p className={styles.message_error} role="alert">
                  {deleteError}
                </p>
              )}

              <button
                type="button"
                className={styles.btn_danger}
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                <Trash2 aria-hidden="true" />
                {deleteLoading ? "Suppression..." : "Supprimer mon compte"}
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
