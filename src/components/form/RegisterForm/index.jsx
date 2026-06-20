"use client";
import Input from "@/components/ui/Input/input";
import Button from "@/components/ui/button/button";
import { editProfil, getUser, register } from "@/actions/auth/authActions";
import { useActionState, useEffect, useState, React } from "react";
import style from "./style.module.scss";
import Link from "next/link";
import { useNotification } from "@/components/Notification/NotificationProvider";

const initialState = {
  message: "",
  error: false,
  redirect: null,
};

const Register = ({ id }) => {
  const action = id ? editProfil : register;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [defaultForm, setDefaultForm] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [step, setStep] = useState(1);
  const { notify } = useNotification();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (state?.message) {
      notify(state.message, state?.error ? "error" : "success");
    }

    if (!state?.error && state?.redirect) {
      window.location.href = state.redirect;
    }

    if (id) {
      const fetchData = async () => {
        try {
          const response = await getUser();

          if (response?.user) {
            setDefaultForm({
              nom: response.user.nom || "",
              prenom: response.user.prenom || "",
              email: response.user.email || "",
              role: response.user.role || "",
              date_naissance: formatDate(response.user.date_naissance),
            });
          }
        } catch (err) {
          console.error("Erreur chargement user", err);
        }
      };
      fetchData();
    }
  }, [id, notify, state]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && name === "photo") {
      setDefaultForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setDefaultForm((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    }
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  return (
    <div className={style.forminscription}>
      <div
        className={`${id ? "" : style.container} ${id ? style.forminfoModif : style.forminfo}`}
      >
        {!id ? (
          <>
            {/* Header avec boutons Retour et Créez votre compte */}
            <div className={style.formHeader}>
              <Link href="/" className={style.backButton}>
                <svg
                  className={style.backArrow}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Retour
              </Link>
              <Link href="/auth/login" className={style.createAccountButton}>
                Se connecter
              </Link>
            </div>

            {/* Titre et sous-titre */}
            <div className={style.formact}>
              <div className={style.stepIndicator}>
                <span
                  className={`${style.stepDot} ${step >= 1 ? style.active : ""}`}
                ></span>
                <span
                  className={`${style.stepLine} ${step >= 2 ? style.active : ""}`}
                ></span>
                <span
                  className={`${style.stepDot} ${step >= 2 ? style.active : ""}`}
                ></span>
              </div>
              <h2>{step === 1 ? "Commençons" : "Sécurité"}</h2>
              <p>
                Étape {step} sur 2 :{" "}
                {step === 1 ? "Parlez-nous de vous" : "Configurez vos accès"}
              </p>
            </div>

            {step === 1 && (
              <>
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
                <div className={style.separator}>
                  <div className={style.separatorLine}></div>
                  <span className={style.separatorText}>OU</span>
                  <div className={style.separatorLine}></div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className={style.formactEdit}>
            <p>Paramètres du profil</p>
            <hr />
          </div>
        )}

        <form className={style.form} action={formAction}>
          <div className={`${id ? style.formStyel : ""}`}>
            {!id ? (
              <>
                {step === 1 ? (
                  <div className={style.stepContent}>
                    {/* Photo de profil */}
                    <div className={style.photoUploadSection}>
                      <div className={style.photoPreviewContainer}>
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Aperçu"
                            className={style.photoPreview}
                          />
                        ) : (
                          <div className={style.photoPlaceholder}>
                            <svg
                              className={style.photoIcon}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p>Ajouter votre photo</p>
                          </div>
                        )}
                      </div>
                      <label htmlFor="photo-input" className={style.photoLabel}>
                        <input
                          id="photo-input"
                          name="photo"
                          type="file"
                          accept="image/*"
                          onChange={handleChange}
                          className={style.photoInput}
                        />
                        {photoPreview
                          ? "Changer la photo"
                          : "Sélectionner une photo"}
                      </label>
                    </div>

                    <div className={style.nameRow}>
                      <div className={style.inputHalf}>
                        <Input
                          name="prenom"
                          label="Prénom"
                          type="text"
                          handleChange={handleChange}
                          value={defaultForm.prenom}
                        />
                      </div>
                      <div className={style.inputHalf}>
                        <Input
                          name="nom"
                          label="Nom"
                          type="text"
                          handleChange={handleChange}
                          value={defaultForm.nom}
                        />
                      </div>
                    </div>
                    <div className={style.inputFull}>
                      <Input
                        name="date_naissance"
                        label="Date de naissance"
                        type="date"
                        handleChange={handleChange}
                        value={defaultForm.date_naissance}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={nextStep}
                      className={style.nextButton || style.submitButton}
                    >
                      Suivant →
                    </button>
                  </div>
                ) : (
                  <div className={style.stepContent}>
                    <div className={style.inputFull}>
                      <Input
                        name="email"
                        label="Adresse mail"
                        type="email"
                        value={defaultForm.email}
                        handleChange={handleChange}
                      />
                    </div>
                    <div className={style.inputFull}>
                      <Input
                        name="role"
                        label="Rôle"
                        type="select"
                        value={defaultForm.role}
                        handleChange={handleChange}
                        options={[
                          { value: "ORGANISATEUR", label: "Organisateur" },
                          { value: "PARTICIPANT", label: "Participant" },
                        ]}
                      />
                    </div>
                    <div className={style.passwordRow}>
                      <div className={style.inputHalf}>
                        <Input
                          name="password"
                          label="Mot de passe"
                          handleChange={handleChange}
                          type="password"
                        />
                      </div>
                      <div className={style.inputHalf}>
                        <Input
                          name="passwordConfime"
                          label="Confirmer"
                          handleChange={handleChange}
                          type="password"
                        />
                      </div>
                    </div>
                    <div className={style.stepActions}>
                      <button
                        type="button"
                        onClick={prevStep}
                        className={style.backStepButton}
                      >
                        ← Retour
                      </button>
                      <button
                        type="submit"
                        className={style.submitButton}
                        disabled={pending}
                      >
                        {pending ? "Inscription..." : "S'inscrire"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <Input
                    name="nom"
                    label="Nom"
                    type="text"
                    handleChange={handleChange}
                    value={defaultForm.nom}
                    required
                  />
                  <Input
                    name="prenom"
                    label="Prenom"
                    type="text"
                    handleChange={handleChange}
                    value={defaultForm.prenom}
                    required
                  />
                </div>
                <div>
                  <Input
                    name="date_naissance"
                    label="Anniversaire"
                    type="date"
                    handleChange={handleChange}
                    value={defaultForm.date_naissance}
                    required
                  />
                  <Input
                    name="role"
                    label="Rôle"
                    type="select"
                    value={defaultForm.role}
                    handleChange={handleChange}
                    required
                    options={[
                      { value: "ORGANISATEUR", label: "Organisateur" },
                      { value: "PARTICIPANT", label: "Participant" },
                    ]}
                  />
                </div>
                <div>
                  <Input
                    label="Photo de profil"
                    type="file"
                    handleChange={handleChange}
                    name="photo"
                    value={defaultForm.photo}
                  />
                  <Input
                    name="email"
                    label="Email"
                    type="email"
                    value={defaultForm.email}
                    handleChange={handleChange}
                    disabled={!!id}
                    required
                  />
                </div>
              </>
            )}
          </div>

          {id && (
            <Button
              label={pending ? "Enregistrement..." : "Modifier"}
              type="submit"
            />
          )}

          {!id && (
            <p className={style.loginLink}>
              Déjà un compte ? <Link href="/auth/login">Connectez-vous</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
