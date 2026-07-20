"use client";

import style from "./style.module.scss";
import Button from "@/components/ui/button";
import Input from "@/components/ui/Input/input";
import { useEffect, useRef, useState } from "react";
import { useCreateEvent, useEvent, useUpdateEvent } from "@/hooks/useEvents";
import { initMapAuto } from "@/utils/autocomplet";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification/NotificationProvider";
const CreatEvent = ({ id }) => {
  const googleMapsReady = useGoogleMaps(["places", "marker"]);
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const mutation = id ? updateMutation : createMutation;
  const state = mutation.data;
  const pending = mutation.isPending;
  const eventQuery = useEvent(id ? Number(id) : 0);
  const router = useRouter();

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
    if (currentStep === 2 && googleMapsReady) initMapAuto(setForm);
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
        startDate: eventData.startDate ?? "",
        startTime: eventData.startTime ?? "",
        endDate: eventData.endDate ?? "",
        endTime: eventData.endTime ?? "",
        location: eventData.location ?? "",
        isOnline: eventData.isOnline ?? false,
        capacity: eventData.capacity ?? 0,
        isFree: !eventData.paymentRequired,
        paymentPrice: eventData.paymentPrice ?? "",
      });
      setImagePreviewUrl(eventData.image ?? null);
    }
  }, [eventQuery.data, id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
  return (
    <div className={`${style.fullPageForm}`}>
      <div
        className={`${style.formContainer} ${currentStep === 3 ? style.fullWidthStep : ""}`}
      >
        {/* COLONNE GAUCHE: FORMULAIRE */}
        <div className={`${style.formColumn}`}>
          <div className={style.formHeader}>
            <div className={style.headerTop}>
              <button
                type="button"
                className={style.backButton}
                onClick={() => router.back()}
                title="Retour"
              >
                ← Retour
              </button>
              <div>
                {id != null ? (
                  <h1>Modification d&apos;événements</h1>
                ) : (
                  <h1>Créer un nouvel événement</h1>
                )}
                <p className={style.subtitle}>
                  Remplissez les informations étape par étape
                </p>
              </div>
            </div>
          </div>

          <form className={style.formContent} onSubmit={handleSubmit}>
            {/* ÉTAPE 1: GÉNÉRAL */}
            {currentStep === 1 && (
              <div>
                <h3 className="mb-3">📝 Général</h3>
                <p className="text-muted mb-4">
                  Renseignez les informations générales de votre événement
                </p>

                <div className={style.formRow}>
                  <div className="mb-3">
                    <Input
                      label="Titre de l'événement"
                      type="text"
                      name="title"
                      placeholder="Ex: Conférence Tech 2024"
                      required
                      value={form.title}
                      handleChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      Catégorie
                    </label>
                    <select
                      id="category"
                      name="category"
                      className={`form-select ${style.selectInput}`}
                      value={form.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      <option value="tech">Technologie</option>
                      <option value="business">Affaires</option>
                      <option value="art">Art & Culture</option>
                      <option value="sport">Sport</option>
                      <option value="social">Social</option>
                      <option value="education">Éducation</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <div className={style.descriptionHeader}>
                    <label htmlFor="description" className="form-label">
                      Description de l&apos;événement
                    </label>
                    <span className={style.charCount}>
                      {form.description.length}
                    </span>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    className={style.descriptionInput}
                    placeholder="Décrivez votre événement en détail pour vos participants..."
                    required
                    value={form.description}
                    onChange={handleInputChange}
                    rows="5"
                  />
                  <p className={style.descriptionHint}>
                    ✨ Une bonne description aide les participants à comprendre
                    votre événement
                  </p>
                </div>
                {!id && (
                  <div className={style.localizationHeader}>
                    <h5 className={style.locTitle}>🎟️ Billetterie</h5>
                    <div className={style.toggleContainer}>
                      <input
                        type="checkbox"
                        id="isFree"
                        name="isFree"
                        checked={form.isFree}
                        onChange={handleInputChange}
                        className={style.toggleInput}
                      />
                      <label htmlFor="isFree" className={style.toggleLabel}>
                        {form.isFree ? "Événement gratuit" : "Événement payant"}
                        <span className={style.toggleSlider}></span>
                        <span className={style.toggleText}></span>
                      </label>
                    </div>
                  </div>
                )}

                {!id && !form.isFree && (
                  <div className="mb-3">
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
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="imageInput" className="form-label">
                    Image de couverture
                  </label>
                  <label
                    htmlFor="imageInput"
                    className={style.imageUploadZone}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleEventImageChange(file);
                    }}
                    style={{ cursor: "pointer", display: "block" }}
                  >
                    {eventImage ? (
                      <div className={style.imagePreviewContainer}>
                        {imagePreviewUrl && (
                          <img
                            src={imagePreviewUrl}
                            alt="Aperçu"
                            className={style.imagePreview}
                          />
                        )}
                        <div className={style.imageInfo}>
                          <p className={style.fileName}>{eventImage.name}</p>
                          <p className={style.fileSize}>
                            {(eventImage.size / 1024).toFixed(2)} KB
                          </p>
                          <button
                            type="button"
                            className={style.changeBtn}
                            onClick={(e) => {
                              // e.preventDefault() to avoid double-firing the label click
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
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className={style.uploadText}>
                          Glissez votre image ici ou cliquez pour sélectionner
                        </p>
                        <p className={style.uploadSubtext}>
                          Formats acceptés: JPG, PNG, WebP (Max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="imageInput"
                      type="file"
                      className={style.hiddenInput}
                      accept="photo/*"
                      onChange={(e) =>
                        handleEventImageChange(e.target.files[0])
                      }
                    />
                  </label>
                </div>
              </div>
            )}

            {/* ÉTAPE 2: LOGISTIQUE */}
            {currentStep === 2 && (
              <div>
                <h3 className="mb-3">🗓️ Logistique de l&apos;événement</h3>
                <p className="text-muted mb-4">
                  Définissez quand et où votre événement aura lieu
                </p>

                <h5 className="mt-4 mb-3">📅 Temporalité</h5>
                <div className={style.formodifdiv}>
                  <div className={style.fordivI}>
                    <div className="mb-3">
                      <Input
                        label="Date de début"
                        type="date"
                        name="startDate"
                        required
                        value={formatDate(form.startDate)}
                        handleChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <Input
                        label="Heure de début"
                        type="time"
                        name="startTime"
                        required
                        value={formatTime(form.startTime)}
                        handleChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className={style.fordivI}>
                    <div className="mb-3">
                      <Input
                        label="Date de fin"
                        type="date"
                        name="endDate"
                        required
                        value={formatDate(form.endDate)}
                        handleChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <Input
                        label="Heure de fin"
                        type="time"
                        name="endTime"
                        required
                        value={formatTime(form.endTime)}
                        handleChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className={style.localizationHeader}>
                  <h5 className={style.locTitle}>📍 Localisation</h5>
                  <div className={style.toggleContainer}>
                    <input
                      type="checkbox"
                      id="isOnline"
                      name="isOnline"
                      checked={form.isOnline}
                      onChange={(e) =>
                        setForm({ ...form, isOnline: e.target.checked })
                      }
                      className={style.toggleInput}
                    />
                    <label htmlFor="isOnline" className={style.toggleLabel}>
                      {form.isOnline
                        ? "Événement en ligne"
                        : "Événement en présentiel"}

                      <span className={style.toggleSlider}></span>
                      <span className={style.toggleText}></span>
                    </label>
                  </div>
                </div>

                {!form.isOnline && (
                  <div>
                    <div className={`pac_card mb-3`} id="pac_card">
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
                    <div id="maps" className="maps mb-3"></div>
                    <div id="infowindow-content">
                      <span id="place-name" className="title"></span>
                      <br />
                      <span id="place-address"></span>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <Input
                    label="Capacité"
                    type="number"
                    name="capacity"
                    required
                    value={form.capacity}
                    handleChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* ÉTAPE 3: CONFIRMATION */}
            {currentStep === 3 && (
              <div>
                <h3 className="mb-3">✅ Confirmation</h3>
                <p className="text-muted mb-4">
                  Vérifiez les informations avant de finaliser
                </p>
                <div className={style.confirmMessage}>
                  <p>
                    ✓ Toutes les informations sont à jour dans le résumé
                    ci-dessous
                  </p>
                </div>

                {/* Récapitulatif complet */}
                <div className={style.recapFullPage}>
                  <div className={style.recapSection}>
                    <h6 className={style.sectionTitle}>Général</h6>
                    <div className={style.recapItem}>
                      <span className={style.label}>Titre:</span>
                      <p className={style.value}>
                        {form.title || "Non renseigné"}
                      </p>
                    </div>
                    <div className={style.recapItem}>
                      <span className={style.label}>Catégorie:</span>
                      <p className={style.value}>
                        {form.category || "Non sélectionnée"}
                      </p>
                    </div>
                    <div className={style.recapItem}>
                      <span className={style.label}>Description:</span>
                      <p className={`${style.value} ${style.descValue}`}>
                        {form.description || "Non renseignée"}
                      </p>
                    </div>
                    {eventImage && (
                      <div className={style.recapItem}>
                        <span className={style.label}>Image:</span>
                        <p className={`${style.value} ${style.success}`}>
                          ✓ {eventImage.name}
                        </p>
                        {imagePreviewUrl && (
                          <div className={style.imagePreview}>
                            <img
                              src={imagePreviewUrl}
                              alt="Aperçu de l'image"
                              className={style.previewImage}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={style.recapSection}>
                    <h6 className={style.sectionTitle}>Logistique</h6>
                    <div className={style.recapItem}>
                      <span className={style.label}>Type:</span>
                      <p className={style.value}>
                        {form.isOnline ? "🌐 En ligne" : "📍 En présentiel"}
                      </p>
                    </div>
                    <div className={style.recapItem}>
                      <span className={style.label}>Date de début:</span>
                      <p className={style.value}>
                        {formatDate(form.startDate) || "Non renseignée"}
                      </p>
                    </div>
                    <div className={style.recapItem}>
                      <span className={style.label}>Heure de début:</span>
                      <p className={style.value}>
                        {formatTime(form.startTime) || "Non renseignée"}
                      </p>
                    </div>
                    <div className={style.recapItem}>
                      <span className={style.label}>Date de fin:</span>
                      <p className={style.value}>
                        {formatDate(form.endDate) || "Non renseignée"}
                      </p>
                    </div>
                    <div className={style.recapItem}>
                      <span className={style.label}>Heure de fin:</span>
                      <p className={style.value}>
                        {formatTime(form.endTime) || "Non renseignée"}
                      </p>
                    </div>
                    {!form.isOnline && (
                      <div className={style.recapItem}>
                        <span className={style.label}>Lieu:</span>
                        <p className={style.value}>
                          {form.location || "Non renseigné"}
                        </p>
                      </div>
                    )}
                    <div className={style.recapItem}>
                      <span className={style.label}>Capacité:</span>
                      <p className={style.value}>
                        {form.capacity || "Non renseignée"} personnes
                      </p>
                    </div>
                    {!id && (
                      <div className={style.recapItem}>
                        <span className={style.label}>Billetterie:</span>
                        <p className={style.value}>
                          {form.isFree
                            ? "Gratuit"
                            : `${form.paymentPrice || "0"} FCFA`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Input type="hidden" name="id" value={event?.id} />

            {/* Navigation Buttons */}
            <div
              className={`mt-5 d-flex gap-2 justify-content-between ${style.navButtons}`}
            >
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    className={`btn btn-outline-secondary ${style.btnNav}`}
                    label="← Précédent"
                    onClick={handlePrevStep}
                  />
                )}
              </div>

              <div className={style.stepInfo}>
                <small>Étape {currentStep} sur 3</small>
              </div>

              <div>
                {currentStep < 3 && (
                  <Button
                    type="button"
                    className={`btn btn-primary ${style.btnNav}`}
                    label="Suivant →"
                    onClick={handleNextStep}
                  />
                )}

                {currentStep === 3 && (
                  <Button
                    type="submit"
                    className={`btn btn-success ${style.btnSubmit}`}
                    label={id ? "✓ Modifier" : "✓ Créer l'événement"}
                    disabled={pending}
                  />
                )}
              </div>
            </div>
          </form>
        </div>

        {/* COLONNE DROITE: RÉCAPITULATIF */}
        {currentStep !== 3 && (
          <div className={`${style.recapColumn}`}>
            <div className={`${style.recapStatic}`}>
              <div className={style.recapCard}>
                {/* Image Section */}
                <div className={style.recapImageContainer}>
                  {imagePreviewUrl ? (
                    <>
                      <img
                        src={imagePreviewUrl}
                        alt="Aperçu de l'événement"
                        className={style.recapCardImage}
                      />
                      <div className={style.livePreviewBadge}>
                        <span>👁️ Aperçu en direct</span>
                      </div>
                    </>
                  ) : (
                    <div className={style.recapImagePlaceholder}>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <p>Image à venir</p>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className={style.recapCardContent}>
                  {/* Title */}
                  <h2 className={style.recapCardTitle}>
                    {form.title || "Titre de l'événement"}
                  </h2>

                  {/* Description */}
                  {form.description && (
                    <p className={style.recapCardDescription}>
                      {form.description}
                    </p>
                  )}

                  {/* Date & Heure */}
                  {form.startDate && (
                    <div className={style.recapInfoBlock}>
                      <div className={style.recapInfoHeader}>
                        <span className={style.recapInfoIcon}>📅</span>
                        <h6 className={style.recapInfoTitle}>Date & Heure</h6>
                      </div>
                      <div className={style.recapInfoContent}>
                        <p className={style.recapInfoDate}>
                          {new Date(form.startDate).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                        <p className={style.recapInfoTime}>
                          {formatTime(form.startTime)} —{" "}
                          {formatTime(form.endTime) || "À définir"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {!form.isOnline && form.location && (
                    <div className={style.recapInfoBlock}>
                      <div className={style.recapInfoHeader}>
                        <span className={style.recapInfoIcon}>📍</span>
                        <h6 className={style.recapInfoTitle}>Lieu</h6>
                      </div>
                      <div className={style.recapInfoContent}>
                        <p className={style.recapInfoText}>{form.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <hr className={style.recapDivider} />

                  {/* Type d'accès */}
                  <div className={style.recapInfoBlock}>
                    <div className={style.recapInfoHeader}>
                      <span className={style.recapInfoIcon}>🔓</span>
                      <h6 className={style.recapInfoTitle}>
                        Type d&apos;accès
                      </h6>
                    </div>
                    <p className={style.recapAccessType}>Public</p>
                  </div>

                  {/* Capacity */}
                  {form.capacity && (
                    <div className={style.recapInfoBlock}>
                      <div className={style.recapInfoHeader}>
                        <span className={style.recapInfoIcon}>👥</span>
                        <h6 className={style.recapInfoTitle}>Capacité</h6>
                      </div>
                      <p className={style.recapCapacity}>
                        {form.capacity} personnes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatEvent;
