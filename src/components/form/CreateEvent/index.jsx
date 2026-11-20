"use client";

import style from "./style.module.scss";
import Button from "@/components/ui/button";
import Input from "@/components/ui/Input/input";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Eye,
  Globe,
  ImageUp,
  LockOpen,
  MapPin,
  Sparkles,
  Ticket,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useCreateEvent, useEvent, useUpdateEvent } from "@/hooks/useEvents";
import { initMapAuto } from "@/utils/autocomplet";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification/NotificationProvider";
import { useAuth } from "@/hooks/useAuth";
import { canSellTickets } from "@/lib/payment-countries";

const CATEGORIES = [
  { value: "tech", label: "Technologie" },
  { value: "business", label: "Affaires" },
  { value: "art", label: "Art & Culture" },
  { value: "sport", label: "Sport" },
  { value: "social", label: "Social" },
  { value: "education", label: "Éducation" },
  { value: "other", label: "Autre" },
];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map(({ value, label }) => [value, label]),
);

// Les trois étapes du formulaire (suivi dans l'en-tête + titre de l'étape).
const STEPS = [
  {
    title: "Général",
    hint: "Titre, description, affiche",
    heading: "Les informations",
    text: "Ce que les participants verront en premier sur la fiche.",
  },
  {
    title: "Logistique",
    hint: "Dates, lieu, jauge",
    heading: "Quand et où",
    text: "Définissez les horaires, le lieu et le nombre de places.",
  },
  {
    title: "Confirmation",
    hint: "Vérification finale",
    heading: "Tout est bon ?",
    text: "Vérifiez les informations avant de publier.",
  },
];

// Formulaire de création / modification d'événement en 3 étapes, avec un
// aperçu en direct façon billet.
const CreateEvent = ({ id }) => {
  const googleMapsReady = useGoogleMaps(["places", "marker"]);
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const mutation = id ? updateMutation : createMutation;
  const state = mutation.data;
  const pending = mutation.isPending;
  const eventQuery = useEvent(id ? Number(id) : 0);
  const router = useRouter();
  const { user } = useAuth();
  // Vente de billets réservée aux organisateurs des pays pris en charge
  // (le backend refuse aussi un événement payant hors de ces pays).
  const ticketSalesBlocked = !canSellTickets(user?.pays);

  const [currentStep, setCurrentStep] = useState(1);
  const [eventImage, setEventImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const imagePreviewUrlRef = useRef(null);
  const [event, setEvent] = useState(null);
  const { notify } = useNotification();
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    image: null,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    isOnline: false,
    capacity: 0,
    isFree: true,
    paymentPrice: "",
  });
  const formatTime = (timeString) => {
    if (!timeString) return "00:00";

    // Cas ISO (ex: 2026-02-15T01:01:00.000Z)
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      if (!Number.isNaN(date.getTime())) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`; // HH:MM (heure locale)
      }
    }

    // Cas HH:MM ou HH:MM:SS
    const [hour = "00", minute = "00"] = timeString.split(":");
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  };
  const handleEventImageChange = (file) => {
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
    }

    const nextPreviewUrl = file ? URL.createObjectURL(file) : null;
    imagePreviewUrlRef.current = nextPreviewUrl;
    setEventImage(file || null);
    setImagePreviewUrl(nextPreviewUrl);
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentStep === 2 && googleMapsReady) return initMapAuto(setForm);
  }, [currentStep, googleMapsReady]);

  // Charger l'événement uniquement au montage du composant
  useEffect(() => {
    if (state?.message) {
      notify(state.message, state?.error ? "error" : "success");

      if (!state?.error && state.redirect) {
        window.location.href = state.redirect;
      }
    }
  }, [notify, state?.error, state?.message, state?.redirect]);

  // Charger les détails de l'événement en mode édition (une seule fois)
  useEffect(() => {
    if (id && eventQuery.data) {
      const eventData = eventQuery.data?.event ?? eventQuery.data;
      if (!eventData) return;

      // Hydrate the editable form once the asynchronous event query has resolved.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEvent(eventData);
      setForm({
        title: eventData.title ?? "",
        category: eventData.category ?? "",
        description: eventData.description ?? "",
        image: eventData.image ?? null,
        startDate: formatDate(eventData.startDate),
        startTime: formatTime(eventData.startTime || eventData.startDate),
        endDate: formatDate(eventData.endDate),
        endTime: formatTime(eventData.endTime || eventData.endDate),
        location: eventData.location ?? "",
        isOnline: Boolean(eventData.isOnline),
        capacity: eventData.capacity ?? 0,
        isFree: !eventData.paymentRequired,
        paymentPrice: eventData.paymentPrice ?? "",
      });
      setImagePreviewUrl(eventData.image ?? null);
    }
  }, [eventQuery.data, id]);

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si l'événement est payant, sauvegarder les données dans localStorage
    if (!form.isFree && eventImage) {
      try {
        // Convertir l'image en base64
        const reader = new FileReader();
        const imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(eventImage);
        });

        const eventData = {
          title: form.title,
          startDate: form.startDate,
          startTime: form.startTime,
          endDate: form.endDate,
          endTime: form.endTime,
          location: form.isOnline ? "" : form.location,
          capacity: form.capacity,
          description: form.description,
          category: form.category,
          paymentPrice: form.paymentPrice,
          photo: imageBase64,
          imageName: eventImage.name,
          imageType: eventImage.type,
        };
        localStorage.setItem("pending_event_data", JSON.stringify(eventData));
      } catch (error) {
        console.error("Erreur sauvegarde localStorage:", error);
      }
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("startDate", form.startDate);
    formData.append("startTime", form.startTime);
    formData.append("endDate", form.endDate);
    formData.append("endTime", form.endTime);
    formData.append("location", form.isOnline ? "" : form.location);
    formData.append("isOnline", form.isOnline);
    formData.append("capacity", form.capacity);
    formData.append("isFree", form.isFree);
    if (!form.isFree) {
      formData.append("paymentPrice", form.paymentPrice);
    }
    if (event?.id) formData.append("id", event.id);
    if (eventImage) formData.append("photo", eventImage);

    mutation.mutate(formData);
  };
  const hasCapacity = Number(form.capacity) > 0;
  const categoryLabel = CATEGORY_LABELS[form.category] || "";
  const priceLabel = form.isFree
    ? "Gratuit"
    : `${Number(form.paymentPrice || 0).toLocaleString("fr-FR")} FCFA`;
  const previewDate = form.startDate
    ? new Date(form.startDate).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className={style.page}>
      {/* ---- En-tête sombre + étapes ---- */}
      <header className={style.hero}>
        <div className={style.heroTop}>
          <button
            type="button"
            className={style.backButton}
            onClick={() => router.back()}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour
          </button>
          <span className={style.heroChip}>
            {id ? "Modification" : "Nouvel événement"}
          </span>
        </div>

        <p className={style.heroKicker}>Espace organisateur</p>
        <h1 className={style.heroTitle}>
          {id ? "Modifier" : "Créer"}{" "}
          <span className={style.heroOutline}>
            {id ? "l'événement" : "un événement"}
          </span>
        </h1>
        <p className={style.heroSubtitle}>
          Trois étapes : les informations, la logistique, puis la vérification
          avant publication.
        </p>

        <ol className={style.stepper}>
          {STEPS.map((step, index) => {
            const number = index + 1;
            const state =
              number === currentStep
                ? style.stepCurrent
                : number < currentStep
                  ? style.stepDone
                  : "";
            return (
              <li
                key={step.title}
                className={`${style.step} ${state}`}
                aria-current={number === currentStep ? "step" : undefined}
              >
                <span className={style.stepNumber}>
                  {number < currentStep ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    String(number).padStart(2, "0")
                  )}
                </span>
                <span className={style.stepName}>{step.title}</span>
                <span className={style.stepHint}>{step.hint}</span>
              </li>
            );
          })}
        </ol>
      </header>

      <div
        className={`${style.layout} ${currentStep === 3 ? style.layoutFull : ""}`}
      >
        {/* ---- Formulaire ---- */}
        <div className={style.formColumn}>
          <form className={style.form} onSubmit={handleSubmit}>
            <div className={style.stepHead}>
              <p className={style.stepKicker}>
                Étape {String(currentStep).padStart(2, "0")} / 03
              </p>
              <h2 className={style.stepTitle}>
                {STEPS[currentStep - 1].heading}
              </h2>
              <p className={style.stepText}>{STEPS[currentStep - 1].text}</p>
            </div>

            {/* ÉTAPE 1 : GÉNÉRAL */}
            {currentStep === 1 && (
              <div className={style.stepBody}>
                <div className={style.formRow}>
                  <Input
                    label="Titre de l'événement"
                    type="text"
                    name="title"
                    placeholder="Ex : Nuit du Cinéma Africain"
                    required
                    value={form.title}
                    handleChange={handleInputChange}
                  />

                  <div>
                    <label htmlFor="category" className={style.fieldLabel}>
                      Catégorie
                    </label>
                    <select
                      id="category"
                      name="category"
                      className={style.selectInput}
                      value={form.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className={style.labelRow}>
                    <label htmlFor="description" className={style.fieldLabel}>
                      Description
                    </label>
                    <span className={style.charCount}>
                      {form.description.length} caractères
                    </span>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    className={style.descriptionInput}
                    placeholder="Programme, artistes, intervenants, ce qu'il faut savoir avant de venir…"
                    required
                    value={form.description}
                    onChange={handleInputChange}
                    rows="6"
                  />
                  <p className={style.fieldHint}>
                    <Sparkles size={14} aria-hidden="true" />
                    Une bonne description aide les participants à se décider.
                  </p>
                </div>

                {!id && (
                  <div className={style.optionRow}>
                    <div className={style.optionText}>
                      <h3 className={style.optionTitle}>
                        <Ticket size={16} aria-hidden="true" />
                        Billetterie
                      </h3>
                      <p className={style.optionHint}>
                        {ticketSalesBlocked || form.isFree
                          ? "Entrée gratuite, billet QR offert."
                          : "Billets payants via Mobile Money ou carte."}
                      </p>
                    </div>
                    <div className={style.switch}>
                      <input
                        type="checkbox"
                        id="isFree"
                        name="isFree"
                        checked={ticketSalesBlocked || form.isFree}
                        onChange={handleInputChange}
                        disabled={ticketSalesBlocked}
                        aria-describedby={
                          ticketSalesBlocked
                            ? "ticket-sales-blocked"
                            : undefined
                        }
                        className={style.switchInput}
                      />
                      <label htmlFor="isFree" className={style.switchLabel}>
                        <span className={style.switchText}>
                          {ticketSalesBlocked || form.isFree
                            ? "Gratuit"
                            : "Payant"}
                        </span>
                        <span
                          className={style.switchTrack}
                          aria-hidden="true"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {!id && ticketSalesBlocked && (
                  <div
                    id="ticket-sales-blocked"
                    className={style.salesCountryWarning}
                    role="note"
                  >
                    <TriangleAlert aria-hidden="true" />
                    <p>
                      La vente de billets n&apos;est disponible que pour les
                      organisateurs basés au Bénin. Vous pouvez créer un
                      événement gratuit.
                    </p>
                  </div>
                )}

                {!id && !ticketSalesBlocked && !form.isFree && (
                  <Input
                    label="Prix du billet (FCFA)"
                    type="number"
                    name="paymentPrice"
                    required
                    min="0"
                    step="0.01"
                    value={form.paymentPrice}
                    handleChange={handleInputChange}
                  />
                )}

                <div>
                  <span className={style.fieldLabel}>Image de couverture</span>
                  <label
                    htmlFor="imageInput"
                    className={`${style.uploadZone} ${eventImage ? style.uploadZoneFilled : ""}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleEventImageChange(file);
                    }}
                  >
                    {eventImage ? (
                      <div className={style.uploadFile}>
                        {imagePreviewUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imagePreviewUrl}
                            alt="Aperçu de l'image choisie"
                            className={style.uploadThumb}
                          />
                        )}
                        <div className={style.uploadInfo}>
                          <p className={style.fileName}>{eventImage.name}</p>
                          <p className={style.fileSize}>
                            {(eventImage.size / 1024).toFixed(0)} Ko
                          </p>
                          <button
                            type="button"
                            className={style.changeBtn}
                            onClick={(e) => {
                              // Évite le double déclenchement du label.
                              e.preventDefault();
                              document.getElementById("imageInput").click();
                            }}
                          >
                            Changer l&apos;image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={style.uploadPrompt}>
                        <span className={style.uploadIcon} aria-hidden="true">
                          <ImageUp size={26} />
                        </span>
                        <p className={style.uploadText}>
                          Glissez votre affiche ici ou cliquez pour choisir
                        </p>
                        <p className={style.uploadSubtext}>
                          JPG, PNG ou WebP — 5 Mo maximum
                        </p>
                      </div>
                    )}
                    <input
                      id="imageInput"
                      type="file"
                      className={style.hiddenInput}
                      accept="image/*"
                      onChange={(e) =>
                        handleEventImageChange(e.target.files[0])
                      }
                    />
                  </label>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : LOGISTIQUE */}
            {currentStep === 2 && (
              <div className={style.stepBody}>
                <h3 className={style.groupTitle}>
                  <CalendarDays size={16} aria-hidden="true" />
                  Dates et horaires
                </h3>
                <div className={style.dateGrid}>
                  <Input
                    label="Date de début"
                    type="date"
                    name="startDate"
                    required
                    value={formatDate(form.startDate)}
                    handleChange={handleInputChange}
                  />
                  <Input
                    label="Heure de début"
                    type="time"
                    name="startTime"
                    required
                    value={formatTime(form.startTime)}
                    handleChange={handleInputChange}
                  />
                  <Input
                    label="Date de fin"
                    type="date"
                    name="endDate"
                    required
                    value={formatDate(form.endDate)}
                    handleChange={handleInputChange}
                  />
                  <Input
                    label="Heure de fin"
                    type="time"
                    name="endTime"
                    required
                    value={formatTime(form.endTime)}
                    handleChange={handleInputChange}
                  />
                </div>

                <div className={style.optionRow}>
                  <div className={style.optionText}>
                    <h3 className={style.optionTitle}>
                      <MapPin size={16} aria-hidden="true" />
                      Localisation
                    </h3>
                    <p className={style.optionHint}>
                      {form.isOnline
                        ? "Les participants rejoignent en ligne."
                        : "Indiquez l'adresse du lieu."}
                    </p>
                  </div>
                  <div className={style.switch}>
                    <input
                      type="checkbox"
                      id="isOnline"
                      name="isOnline"
                      checked={form.isOnline}
                      onChange={(e) =>
                        setForm({ ...form, isOnline: e.target.checked })
                      }
                      className={style.switchInput}
                    />
                    <label htmlFor="isOnline" className={style.switchLabel}>
                      <span className={style.switchText}>
                        {form.isOnline ? "En ligne" : "Présentiel"}
                      </span>
                      <span className={style.switchTrack} aria-hidden="true" />
                    </label>
                  </div>
                </div>

                {!form.isOnline && (
                  <div>
                    <div className="pac_card" id="pac_card">
                      <Input
                        label="Lieu de l'événement"
                        type="text"
                        name="location"
                        id="pac_input"
                        required={!form.isOnline}
                        value={form.location}
                        handleChange={handleInputChange}
                      />
                    </div>
                    <div id="maps" className="maps"></div>
                    <div id="infowindow-content" className={style.mapInfo}>
                      <span id="place-name" className="title"></span>
                      <br />
                      <span id="place-address"></span>
                    </div>
                  </div>
                )}

                <h3 className={style.groupTitle}>
                  <Users size={16} aria-hidden="true" />
                  Jauge
                </h3>
                <Input
                  label="Capacité (nombre de places)"
                  type="number"
                  name="capacity"
                  required
                  value={form.capacity}
                  handleChange={handleInputChange}
                />
              </div>
            )}

            {/* ÉTAPE 3 : CONFIRMATION */}
            {currentStep === 3 && (
              <div className={style.stepBody}>
                <div className={style.confirmMessage}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <p>
                    Relisez le récapitulatif : vous pourrez encore modifier
                    l&apos;événement après sa publication.
                  </p>
                </div>

                <div className={style.recapGrid}>
                  <section className={style.recapPanel}>
                    <h3 className={style.recapPanelTitle}>
                      <span>01</span> Général
                    </h3>
                    {imagePreviewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreviewUrl}
                        alt="Image de couverture"
                        className={style.recapImage}
                      />
                    )}
                    <dl className={style.recapList}>
                      <div>
                        <dt>Titre</dt>
                        <dd>{form.title || "Non renseigné"}</dd>
                      </div>
                      <div>
                        <dt>Catégorie</dt>
                        <dd>{categoryLabel || "Non sélectionnée"}</dd>
                      </div>
                      <div className={style.recapListFull}>
                        <dt>Description</dt>
                        <dd className={style.recapDescription}>
                          {form.description || "Non renseignée"}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section className={style.recapPanel}>
                    <h3 className={style.recapPanelTitle}>
                      <span>02</span> Logistique
                    </h3>
                    <dl className={style.recapList}>
                      <div>
                        <dt>Format</dt>
                        <dd>
                          {form.isOnline ? (
                            <>
                              <Globe size={14} aria-hidden="true" /> En ligne
                            </>
                          ) : (
                            <>
                              <MapPin size={14} aria-hidden="true" /> Présentiel
                            </>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>Capacité</dt>
                        <dd>
                          {hasCapacity
                            ? `${form.capacity} places`
                            : "Non renseignée"}
                        </dd>
                      </div>
                      <div>
                        <dt>Début</dt>
                        <dd>
                          {formatDate(form.startDate) || "—"} ·{" "}
                          {form.startTime ? formatTime(form.startTime) : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Fin</dt>
                        <dd>
                          {formatDate(form.endDate) || "—"} ·{" "}
                          {form.endTime ? formatTime(form.endTime) : "—"}
                        </dd>
                      </div>
                      {!form.isOnline && (
                        <div className={style.recapListFull}>
                          <dt>Lieu</dt>
                          <dd>{form.location || "Non renseigné"}</dd>
                        </div>
                      )}
                      {!id && (
                        <div className={style.recapListFull}>
                          <dt>Billetterie</dt>
                          <dd className={style.recapPrice}>{priceLabel}</dd>
                        </div>
                      )}
                    </dl>
                  </section>
                </div>
              </div>
            )}

            <Input type="hidden" name="id" value={event?.id} />

            {/* Navigation */}
            <div className={style.navButtons}>
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline-dark"
                    onClick={handlePrevStep}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Précédent
                  </Button>
                )}
              </div>

              <p className={style.stepInfo}>Étape {currentStep} sur 3</p>

              <div>
                {currentStep < 3 && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNextStep}
                  >
                    Suivant
                    <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                )}

                {currentStep === 3 && (
                  <Button type="submit" variant="accent" disabled={pending}>
                    <Check size={18} aria-hidden="true" />
                    {pending
                      ? "Enregistrement…"
                      : id
                        ? "Enregistrer"
                        : "Publier l'événement"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* ---- Aperçu en direct (étapes 1 et 2) ---- */}
        {currentStep !== 3 && (
          <aside className={style.previewColumn} aria-label="Aperçu en direct">
            <div className={style.preview}>
              <div className={style.previewVisual}>
                {imagePreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreviewUrl}
                    alt=""
                    className={style.previewImage}
                  />
                ) : (
                  <div className={style.previewPlaceholder}>
                    <ImageUp size={30} aria-hidden="true" />
                    <span>Votre affiche ici</span>
                  </div>
                )}
                <span className={style.previewBadge}>
                  <Eye size={13} aria-hidden="true" />
                  Aperçu en direct
                </span>
                {categoryLabel && (
                  <span className={style.previewCategory}>{categoryLabel}</span>
                )}
              </div>

              <div className={style.previewBody}>
                <h2 className={style.previewTitle}>
                  {form.title || "Titre de l'événement"}
                </h2>

                <ul className={style.previewMeta}>
                  <li>
                    <CalendarDays size={15} aria-hidden="true" />
                    <span>
                      {previewDate ? (
                        <>
                          {previewDate}
                          {form.startTime && (
                            <small>
                              {formatTime(form.startTime)}
                              {form.endTime && ` — ${formatTime(form.endTime)}`}
                            </small>
                          )}
                        </>
                      ) : (
                        "Date à définir"
                      )}
                    </span>
                  </li>
                  <li>
                    {form.isOnline ? (
                      <Globe size={15} aria-hidden="true" />
                    ) : (
                      <MapPin size={15} aria-hidden="true" />
                    )}
                    <span>
                      {form.isOnline
                        ? "En ligne"
                        : form.location || "Lieu à définir"}
                    </span>
                  </li>
                </ul>

                {form.description && (
                  <p className={style.previewDescription}>{form.description}</p>
                )}
              </div>

              {/* Talon du billet */}
              <div className={style.previewStub}>
                <div>
                  <span className={style.stubLabel}>Accès</span>
                  <span className={style.stubValue}>
                    <LockOpen size={13} aria-hidden="true" /> Public
                  </span>
                </div>
                <div>
                  <span className={style.stubLabel}>Places</span>
                  <span className={style.stubValue}>
                    {hasCapacity ? form.capacity : "—"}
                  </span>
                </div>
                {!id && (
                  <div>
                    <span className={style.stubLabel}>Prix</span>
                    <span className={style.stubPrice}>{priceLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;
