"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  LogOut,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { canSellTickets } from "@/lib/payment-countries";
import Profil from "@/components/profile";
import ProfilForm from "@/components/form/RegisterForm";
import DelectModal from "@/components/DelectModal";
import { useAuth } from "@/hooks/useAuth";
import {
  useChangePassword,
  useDeleteAccount,
  useLogout,
} from "@/hooks/useAuthMutations";
import styles from "./style.module.scss";

type PasswordState = {
  newPassword: string;
  confirmPassword: string;
  error: string;
  success: string;
  loading: boolean;
};

const initialPasswordState: PasswordState = {
  newPassword: "",
  confirmPassword: "",
  error: "",
  success: "",
  loading: false,
};

function SettingsSkeleton() {
  return (
    <main
      className={styles.page}
      aria-busy="true"
      aria-label="Chargement des paramètres"
    >
      <div className={styles.container}>
        <div className={styles.skeletonHeader} />
        <div className={`${styles.content} ${styles.inner}`}>
          <aside className={styles.profileColumn}>
            <div className={`${styles.card} ${styles.skeletonProfile}`} />
          </aside>
          <div className={styles.settingsColumn}>
            {[240, 180, 220].map((height) => (
              <div
                className={`${styles.card} ${styles.skeletonCard}`}
                style={{ minHeight: height }}
                key={height}
              >
                <span className={styles.skeletonTitle} />
                <span className={styles.skeletonLine} />
                <span className={styles.skeletonLineShort} />
                <span className={styles.skeletonControl} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [passwordState, setPasswordState] =
    useState<PasswordState>(initialPasswordState);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const logoutMutation = useLogout();
  const changePasswordMutation = useChangePassword();
  const deleteAccountMutation = useDeleteAccount();

  const handleLogOut = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      router.push("/auth/login");
    }
  };

  const canConfigurePayments =
    user?.role === "ORGANISATEUR" || user?.role === "ADMIN";

  // Ventes de billets : encaissées par FedaPay, réservées aux pays autorisés.
  const salesAllowed = canSellTickets(user?.pays);

  const sections = [
    { id: "profil", label: "Profil", icon: UserRound },
    ...(canConfigurePayments
      ? [{ id: "paiements", label: "Paiements", icon: CreditCard }]
      : []),
    { id: "securite", label: "Sécurité", icon: ShieldCheck },
    { id: "compte", label: "Compte", icon: Trash2 },
  ];

  if (authLoading) return <SettingsSkeleton />;

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
      const result = await changePasswordMutation.mutateAsync(newPassword);

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
        error: "Impossible de modifier le mot de passe.",
        loading: false,
      }));
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteAccountMutation.isPending) return;

    setDeleteError("");

    try {
      const result = await deleteAccountMutation.mutateAsync();

      if (result.error) {
        setDeleteError(result.message);
        setIsDeleteModalOpen(false);
        return;
      }

      setIsDeleteModalOpen(false);
      window.location.assign("/");
    } catch {
      setDeleteError("Impossible de supprimer votre compte.");
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.inner}>
            <p className={styles.eyebrow}>Votre espace</p>
            <h1>Paramètres du compte</h1>
            <p>Gérez votre profil, votre sécurité et vos paiements.</p>
          </div>
        </header>

        <div className={`${styles.content} ${styles.inner}`}>
          <aside className={styles.profileColumn}>
            <div className={`${styles.card} ${styles.profileCard}`}>
              <Profil />
            </div>
            {/* Raccourcis vers les sections (pastilles sur mobile). */}
            <nav className={styles.sectionNav} aria-label="Sections">
              {sections.map(({ id, label, icon: Icon }) => (
                <a key={id} href={`#${id}`} className={styles.sectionLink}>
                  <Icon aria-hidden="true" />
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <div className={styles.settingsColumn}>
            <section id="profil" className={styles.card}>
              <div className={styles.sectionTitle}>
                <UserRound aria-hidden="true" />
                <div>
                  <h2>Informations personnelles</h2>
                  <p>
                    Mettez à jour les informations visibles sur votre profil.
                  </p>
                </div>
              </div>
              <ProfilForm id />
            </section>

            {canConfigurePayments && (
              <section id="paiements" className={styles.card}>
                <div className={styles.sectionTitle}>
                  <CreditCard aria-hidden="true" />
                  <div>
                    <h2>Paiements</h2>
                    <p>
                      Comment vos ventes de billets sont encaissées et
                      reversées.
                    </p>
                  </div>
                </div>

                <dl className={styles.paymentList}>
                  <div className={styles.paymentRow}>
                    <dt>Encaissement</dt>
                    <dd>
                      FedaPay : Mobile Money et carte bancaire. Aucun compte à
                      configurer.
                    </dd>
                  </div>
                  <div className={styles.paymentRow}>
                    <dt>Billets payants</dt>
                    <dd>
                      {salesAllowed ? (
                        <span className={styles.status_ok}>
                          <CheckCircle2 aria-hidden="true" />
                          Disponible
                        </span>
                      ) : (
                        <span className={styles.status_warning}>
                          <TriangleAlert aria-hidden="true" />
                          Réservé aux organisateurs basés au Bénin
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className={styles.paymentRow}>
                    <dt>Solde et retraits</dt>
                    <dd>
                      <Link href="/dashboard" className={styles.inlineLink}>
                        Voir le tableau de bord
                        <ArrowUpRight aria-hidden="true" />
                      </Link>
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            <section id="securite" className={styles.card}>
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

            <section
              id="compte"
              className={`${styles.card} ${styles.card_danger}`}
            >
              <div className={styles.sectionTitle}>
                <Trash2 aria-hidden="true" />
                <div>
                  <h2>Compte</h2>
                  <p>Session et suppression de votre compte.</p>
                </div>
              </div>

              {deleteError && (
                <p className={styles.message_error} role="alert">
                  {deleteError}
                </p>
              )}

              {/* Déconnexion : ici seulement sur mobile (sinon barre latérale). */}
              <div className={`${styles.accountRow} ${styles.mobileOnly}`}>
                <div>
                  <h3>Déconnexion</h3>
                  <p>Fermer votre session sur cet appareil.</p>
                </div>
                <button
                  type="button"
                  className={styles.btn_logout}
                  onClick={handleLogOut}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut aria-hidden="true" />
                  {logoutMutation.isPending
                    ? "Déconnexion..."
                    : "Se déconnecter"}
                </button>
              </div>

              <div className={styles.accountRow}>
                <div>
                  <h3>Supprimer le compte</h3>
                  <p>Efface définitivement votre profil et vos données.</p>
                </div>
                <button
                  type="button"
                  className={styles.btn_danger}
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={deleteAccountMutation.isPending}
                >
                  <Trash2 aria-hidden="true" />
                  {deleteAccountMutation.isPending
                    ? "Suppression..."
                    : "Supprimer mon compte"}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <DelectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteAccount}
        eventTitle=""
        isLoading={deleteAccountMutation.isPending}
        title="Supprimer votre compte"
        message="Voulez-vous vraiment supprimer définitivement votre compte et l'ensemble de vos données ? Cette action est irréversible."
        confirmLabel="Supprimer définitivement"
        loadingLabel="Suppression en cours..."
      />
    </main>
  );
}
