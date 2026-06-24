"use client";
import Input from "@/components/ui/Input/input";
import Button from "@/components/ui/button/button";
import { useMemo, useState, React } from "react";
import countryList from "react-select-country-list";
import PhoneInput, {
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import Image from "next/image";
import { TriangleAlert } from "lucide-react";
import style from "./style.module.scss";
import Link from "next/link";
import { useNotification } from "@/components/Notification/NotificationProvider";
import { useAuth } from "@/hooks/useAuth";
import { useRegister, useUpdateProfile } from "@/hooks/useAuthMutations";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const getProfileForm = (user) => ({
  nom: user?.nom || "",
  prenom: user?.prenom || "",
  email: user?.email || "",
  numero: user?.numero || "",
  pays: user?.pays || "",
  role: user?.role || "",
  date_naissance: formatDate(user?.date_naissance),
});

const emptyForm = {
  ...getProfileForm(null),
  password: "",
  passwordConfime: "",
  photo: null,
};

const getPhoneCountry = (phoneNumber) => {
  if (!phoneNumber) return undefined;

  try {
    return parsePhoneNumber(phoneNumber)?.country;
  } catch {
    return undefined;
  }
};

const PhoneNumberField = ({ value, country, onChange, required = false }) => (
  <div className={style.phoneField}>
    <label htmlFor="numero">Numéro de téléphone</label>
    <PhoneInput
      key={country || "international"}
      id="numero"
      name="numero"
      country={country || undefined}
      international={Boolean(country)}
      withCountryCallingCode={Boolean(country)}
      countryCallingCodeEditable={false}
      value={value || undefined}
      onChange={(phoneNumber) => onChange(phoneNumber || "")}
      useNationalFormatForDefaultCountryValue={false}
      placeholder="Votre numéro de téléphone"
      autoComplete="tel"
      required={required}
    />
  </div>
);

const Register = ({ id }) => {
  const { user } = useAuth();
  const registerMutation = useRegister();
  const updateProfileMutation = useUpdateProfile();
  const mutation = id ? updateProfileMutation : registerMutation;
  const [defaultForm, setDefaultForm] = useState(() =>
    id ? getProfileForm(user) : emptyForm,
  );
  const [photoPreview, setPhotoPreview] = useState(null);
  const [step, setStep] = useState(1);
  const { notify } = useNotification();
  const countryOptions = useMemo(() => {
    const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });

    return countryList()
      .getData()
      .map((country) => ({
        value: country.value,
        label: regionNames.of(country.value) || country.label,
      }))
      .sort((firstCountry, secondCountry) =>
        firstCountry.label.localeCompare(secondCountry.label, "fr"),
      );
  }, []);
  const organizerPaymentUnavailable =
    !id &&
    defaultForm.role === "ORGANISATEUR" &&
    Boolean(defaultForm.pays) &&
    defaultForm.pays !== "BJ";
  const organizerContactMissing =
    !id &&
    defaultForm.role === "ORGANISATEUR" &&
    (!defaultForm.pays || !defaultForm.numero);
  const phoneCountry = getPhoneCountry(defaultForm.numero);
  const organizerPhoneCountryMismatch =
    !id &&
    defaultForm.role === "ORGANISATEUR" &&
    Boolean(defaultForm.pays) &&
    Boolean(defaultForm.numero) &&
    Boolean(phoneCountry) &&
    phoneCountry !== defaultForm.pays;
  const expectedCallingCode = defaultForm.pays
    ? `+${getCountryCallingCode(defaultForm.pays)}`
    : "";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (organizerContactMissing) {
      notify(
        "Le pays et le numéro de téléphone sont obligatoires pour un organisateur.",
        "error",
      );
      return;
    }

    if (defaultForm.numero && !isValidPhoneNumber(defaultForm.numero)) {
      notify("Veuillez saisir un numéro de téléphone valide.", "error");
      return;
    }

    if (organizerPhoneCountryMismatch) {
      notify(
        `L'indicatif du numéro doit correspondre au pays sélectionné (${expectedCallingCode}).`,
        "error",
      );
      return;
    }

    const formData = new FormData(event.currentTarget);

    Object.entries(defaultForm).forEach(([name, value]) => {
      if (value instanceof File) {
        formData.set(name, value);
      } else if (typeof value === "string") {
        formData.set(name, value);
      }
    });

    mutation.mutate(formData, {
      onSuccess: (result) => {
        notify(result.message, result.error ? "error" : "success");
        if (!id && !result.error && result.redirect) {
          window.location.href = result.redirect;
        }
      },
      onError: () =>
        notify("Impossible d'enregistrer les informations.", "error"),
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "pays") {
      setDefaultForm((currentForm) => ({
        ...currentForm,
        pays: value,
        numero: currentForm.pays === value ? currentForm.numero : "",
      }));
      return;
    }

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

  const nextStep = () => {
    const requiredProfileFields = [
      defaultForm.prenom,
      defaultForm.nom,
      defaultForm.email,
      defaultForm.date_naissance,
      defaultForm.password,
      defaultForm.passwordConfime,
      defaultForm.photo,
    ];

    if (requiredProfileFields.some((value) => !value)) {
      notify("Veuillez remplir tous les champs de cette étape.", "error");
      return;
    }

    if (defaultForm.password.length < 8) {
      notify("Le mot de passe doit contenir au moins 8 caractères.", "error");
      return;
    }

    if (defaultForm.password !== defaultForm.passwordConfime) {
      notify("Les mots de passe ne correspondent pas.", "error");
      return;
    }

    setStep(2);
  };
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
              <h2>{step === 1 ? "Commençons" : "Finalisation"}</h2>
              <p>
                Étape {step} sur 2 :{" "}
                {step === 1
                  ? "Identité et accès"
                  : "Choisissez votre type de compte"}
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

        <form
          className={`${style.form} ${id ? style.profileEditForm : ""}`}
          onSubmit={handleSubmit}
        >
          <div className={`${id ? style.profileFields : ""}`}>
            {!id ? (
              <>
                {step === 1 ? (
                  <div className={style.stepContent}>
                    {/* Photo de profil */}
                    <div className={style.photoUploadSection}>
                      <div className={style.photoPreviewContainer}>
                        {photoPreview ? (
                          <Image
                            src={photoPreview}
                            alt="Aperçu"
                            width={160}
                            height={160}
                            unoptimized
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
                          required
                        />
                      </div>
                      <div className={style.inputHalf}>
                        <Input
                          name="nom"
                          label="Nom"
                          type="text"
                          handleChange={handleChange}
                          value={defaultForm.nom}
                          required
                        />
                      </div>
                    </div>
                    <div className={style.inputFull}>
                      <Input
                        name="email"
                        label="Adresse mail"
                        type="email"
                        value={defaultForm.email}
                        handleChange={handleChange}
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className={style.inputFull}>
                      <Input
                        name="date_naissance"
                        label="Date de naissance"
                        type="date"
                        handleChange={handleChange}
                        value={defaultForm.date_naissance}
                        required
                      />
                    </div>
                    <div className={style.passwordRow}>
                      <div className={style.inputHalf}>
                        <Input
                          name="password"
                          label="Mot de passe"
                          type="password"
                          value={defaultForm.password}
                          handleChange={handleChange}
                          autoComplete="new-password"
                          minLength={8}
                          required
                        />
                      </div>
                      <div className={style.inputHalf}>
                        <Input
                          name="passwordConfime"
                          label="Confirmer le mot de passe"
                          type="password"
                          value={defaultForm.passwordConfime}
                          handleChange={handleChange}
                          autoComplete="new-password"
                          minLength={8}
                          required
                        />
                      </div>
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
                        name="role"
                        label="Rôle"
                        type="select"
                        value={defaultForm.role}
                        handleChange={handleChange}
                        options={[
                          { value: "ORGANISATEUR", label: "Organisateur" },
                          { value: "PARTICIPANT", label: "Participant" },
                        ]}
                        required
                      />
                    </div>
                    <div className={style.nameRow}>
                      <div className={style.inputHalf}>
                        <Input
                          name="pays"
                          label="Pays"
                          type="select"
                          handleChange={handleChange}
                          value={defaultForm.pays}
                          options={countryOptions}
                          autoComplete="country"
                          required={defaultForm.role === "ORGANISATEUR"}
                        />
                      </div>
                      <div className={style.inputHalf}>
                        <PhoneNumberField
                          value={defaultForm.numero}
                          country={defaultForm.pays}
                          required={defaultForm.role === "ORGANISATEUR"}
                          onChange={(phoneNumber) =>
                            setDefaultForm((currentForm) => ({
                              ...currentForm,
                              numero: phoneNumber,
                            }))
                          }
                        />
                      </div>
                    </div>
                    {organizerPaymentUnavailable && (
                      <div className={style.paymentCountryWarning} role="alert">
                        <TriangleAlert aria-hidden="true" />
                        <p>
                          Les paiements ne sont pas encore disponibles dans ce
                          pays. Vous pourrez créer des événements gratuits, mais
                          pas vendre de billets pour le moment.
                        </p>
                      </div>
                    )}
                    {organizerContactMissing && (
                      <div
                        className={style.organizerContactWarning}
                        role="alert"
                      >
                        <TriangleAlert aria-hidden="true" />
                        <p>
                          Le pays et le numéro de téléphone sont obligatoires
                          pour créer un compte organisateur.
                        </p>
                      </div>
                    )}
                    {organizerPhoneCountryMismatch && (
                      <div
                        className={style.organizerContactWarning}
                        role="alert"
                      >
                        <TriangleAlert aria-hidden="true" />
                        <p>
                          L&apos;indicatif du numéro doit correspondre au pays
                          sélectionné ({expectedCallingCode}).
                        </p>
                      </div>
                    )}
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
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Inscription..." : "S'inscrire"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={style.profileRow}>
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
                <div className={style.profileRow}>
                  <Input
                    name="date_naissance"
                    label="Anniversaire"
                    type="date"
                    handleChange={handleChange}
                    value={defaultForm.date_naissance}
                    required
                  />
                  <Input
                    name="pays"
                    label="Pays"
                    type="select"
                    value={defaultForm.pays}
                    handleChange={handleChange}
                    options={countryOptions}
                    required={defaultForm.role === "ORGANISATEUR"}
                  />
                </div>
                <div className={style.profileRow}>
                  <PhoneNumberField
                    value={defaultForm.numero}
                    country={defaultForm.pays}
                    required={defaultForm.role === "ORGANISATEUR"}
                    onChange={(phoneNumber) =>
                      setDefaultForm((currentForm) => ({
                        ...currentForm,
                        numero: phoneNumber,
                      }))
                    }
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
                <div className={`${style.profileRow} ${style.profileRowMedia}`}>
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
              label={mutation.isPending ? "Enregistrement..." : "Modifier"}
              type="submit"
              className={style.profileSaveButton}
              disabled={mutation.isPending}
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
