"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./style.module.scss";
import Link from "next/link";
import Chart from "chart.js/auto";
import { eventQueries, useDeleteEvent } from "@/hooks/useEvents";

import {
  participantKeys,
  participantQueries,
  useUnsubscribeParticipant,
} from "@/hooks/useParticipants";
import { useAuth } from "@/hooks/useAuth";
import {
  getOrganizerBalance,
  getRefunds,
  updateRefundStatus,
} from "@/actions/payment";
import { usePayout } from "@/hooks/usePayout";
import DelectModal from "@/components/DelectModal";
import TicketQRCodeLecteur from "@/app/events/[id]/TicketQRCodeLecteur";

// --- STYLES/ICONS ---
const ICONS = {
  view: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
    </svg>
  ),
  edit: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
      <path
        fillRule="evenodd"
        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
      />
    </svg>
  ),
  delete: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
      <path
        fillRule="evenodd"
        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
      />
    </svg>
  ),
  calendar: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  ),
  ticket: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
      />
    </svg>
  ),
  money: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  users: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
      />
    </svg>
  ),
};

const COLORS = ["#0b5ed7", "#17a2b8", "#28a745", "#ffc107", "#dc3545"];

const normalizeSearchValue = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function SearchableEventsSection({ eventsList, isDeleting, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");

  const visibleEventsList = useMemo(() => {
    const normalizedSearchTerm = normalizeSearchValue(searchTerm.trim());

    if (!normalizedSearchTerm) return eventsList;

    return eventsList.filter((event) => {
      const searchableValue = normalizeSearchValue(
        [
          event.title,
          event.description,
          event.location,
          event.category,
          event.startDate,
          event.endDate,
        ].join(" "),
      );

      return searchableValue.includes(normalizedSearchTerm);
    });
  }, [eventsList, searchTerm]);

  const getStatus = (event) => {
    if (new Date(event.endDate || event.startDate) < new Date()) {
      return "terminé";
    }

    return "publié";
  };

  return (
    <div className={styles.table_card}>
      <div className={styles.table_header_actions}>
        <h3>Gérer les événements</h3>
        <div className={styles.filters}>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un événement..."
            aria-label="Rechercher un événement"
          />
          <Link
            href="/events/createvent"
            className="btn btn-primary"
            style={{
              backgroundColor: "#0b5ed7",
              color: "white",
              padding: "0.4rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            + Créer
          </Link>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className={styles.modern_table}>
          <thead>
            <tr>
              <th>Titre de l&apos;événement</th>
              <th>Date &amp; lieu</th>
              <th>Capacité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleEventsList.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Aucun événement trouvé
                </td>
              </tr>
            ) : (
              visibleEventsList.map((event) => {
                const status = getStatus(event);

                return (
                  <tr key={event.id}>
                    <td style={{ fontWeight: 600, color: "#1a1a2e" }}>
                      {event.title}
                    </td>
                    <td>
                      <div>
                        {new Date(event.startDate).toLocaleDateString("fr-FR")}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                        {event.location}
                      </div>
                    </td>
                    <td>{event.capacity || "N/A"}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          status === "terminé"
                            ? styles.status_finished
                            : styles.status_published
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/events/${event.id}`}
                          className={styles.view}
                          title="Voir"
                        >
                          {ICONS.view}
                        </Link>
                        <Link
                          href={`/events/editEvent/${event.id}`}
                          className={styles.edit}
                          title="Modifier"
                        >
                          {ICONS.edit}
                        </Link>
                        <button
                          type="button"
                          className={styles.delete}
                          title="Supprimer"
                          onClick={() => onDelete(event)}
                          disabled={isDeleting}
                        >
                          {ICONS.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UnsubscribeParticipantModal({
  participant,
  reason,
  isLoading,
  errorMessage,
  onReasonChange,
  onClose,
  onConfirm,
}) {
  if (!participant) return null;

  const participantName =
    [participant.user?.prenom, participant.user?.nom]
      .filter(Boolean)
      .join(" ") ||
    participant.user?.email ||
    "Participant";

  return (
    <div
      className={styles.unsubscribe_overlay}
      onClick={isLoading ? undefined : onClose}
    >
      <div
        className={styles.unsubscribe_modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsubscribe-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="unsubscribe-modal-title">Retirer le participant</h3>

        <dl className={styles.unsubscribe_details}>
          <div>
            <dt>Participant</dt>
            <dd>{participantName}</dd>
          </div>
          <div>
            <dt>Événement</dt>
            <dd>{participant.eventTitle || "Événement"}</dd>
          </div>
        </dl>

        {participant.eventPaymentRequired && (
          <p className={styles.unsubscribe_notice} role="status">
            Cet événement est payant. Le retrait du participant créera une
            demande de remboursement en attente de traitement.
          </p>
        )}

        <label
          className={styles.unsubscribe_label}
          htmlFor="unsubscribe-reason"
        >
          Raison de la désinscription
        </label>
        <textarea
          id="unsubscribe-reason"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="Expliquez la raison du retrait..."
          rows={4}
          required
          disabled={isLoading}
          autoFocus
        />

        {errorMessage && (
          <p className={styles.unsubscribe_error} role="alert">
            {errorMessage}
          </p>
        )}

        <div className={styles.unsubscribe_actions}>
          <button type="button" onClick={onClose} disabled={isLoading}>
            Annuler
          </button>
          <button
            type="button"
            className={styles.unsubscribe_confirm}
            onClick={onConfirm}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "Désinscription..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ParticipantsSection = React.memo(function ParticipantsSection({
  participants,
  eventsList,
  participantActionMessage,
  isUnsubscribing,
  setSelectedParticipantToRemove,
}) {
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("all");

  const filteredParticipants = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(participantSearch.trim());

    return participants.filter((participant) => {
      const matchesEvent =
        selectedEventId === "all" ||
        String(participant.eventId) === selectedEventId;

      if (!matchesEvent) return false;
      if (!normalizedSearch) return true;

      const firstName = participant.user?.prenom;
      const lastName = participant.user?.nom;
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const reverseFullName = [lastName, firstName].filter(Boolean).join(" ");
      const phoneNumber =
        participant.user?.telephone ||
        participant.user?.phone ||
        participant.user?.phoneNumber ||
        participant.user?.numeroTelephone ||
        participant.user?.tel ||
        participant.telephone;
      const ticketType =
        participant.ticketType ||
        participant.ticket?.type ||
        participant.paymentMethod ||
        "Standard";
      const status =
        participant.status || participant.paymentStatus || "Validé";

      const searchableValue = normalizeSearchValue(
        [
          firstName,
          lastName,
          fullName,
          reverseFullName,
          participant.user?.email,
          phoneNumber,
          participant.eventTitle,
          ticketType,
          status,
        ].join(" "),
      );

      return searchableValue.includes(normalizedSearch);
    });
  }, [participantSearch, participants, selectedEventId]);

  return (
    <div className={styles.table_card}>
      <div className={styles.table_header_actions}>
        <h3>Gérer les participants</h3>
        <div className={styles.filters}>
          <input
            type="search"
            value={participantSearch}
            onChange={(event) => setParticipantSearch(event.target.value)}
            placeholder="Rechercher un participant..."
            aria-label="Rechercher un participant"
          />
          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            aria-label="Filtrer par événement"
          >
            <option value="all">Tous les événements</option>
            {eventsList.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(participantActionMessage?.type === "success" ||
        participantActionMessage?.type === "refund") && (
        <p
          className={
            participantActionMessage.type === "refund"
              ? styles.participant_refund
              : styles.participant_success
          }
          role="status"
        >
          {participantActionMessage.message}
        </p>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className={styles.modern_table}>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Événement</th>
              <th>Type de billet</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Aucun participant trouvé
                </td>
              </tr>
            ) : (
              filteredParticipants.map((participant) => {
                const ticketType =
                  participant.ticketType ||
                  participant.ticket?.type ||
                  participant.paymentMethod ||
                  "Standard";
                const status =
                  participant.status || participant.paymentStatus || "Validé";

                return (
                  <tr key={participant.id}>
                    <td>
                      <div className={styles.participant_info}>
                        <div className={styles.avatar}>
                          {(
                            participant.user?.prenom?.[0] ||
                            participant.user?.nom?.[0] ||
                            "?"
                          ).toUpperCase()}
                        </div>
                        <div className={styles.details}>
                          <span className={styles.name}>
                            {participant.user?.prenom} {participant.user?.nom}
                          </span>
                          <span className={styles.email}>
                            {participant.user?.email || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{participant.eventTitle}</td>
                    <td>{ticketType}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.status_paid}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.delete}
                          title="Retirer"
                          aria-label={`Retirer ${
                            participant.user?.prenom || "ce participant"
                          }`}
                          onClick={() =>
                            setSelectedParticipantToRemove(participant)
                          }
                          disabled={isUnsubscribing}
                        >
                          {ICONS.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

function RefundsSection({ refunds, message, isUpdating, onUpdate }) {
  const [providerReferences, setProviderReferences] = useState({});

  return (
    <section className={styles.table_card}>
      <div className={styles.table_header_actions}>
        <h3>Demandes de remboursement</h3>
      </div>

      {message && (
        <p
          className={
            message.type === "error"
              ? styles.refund_admin_error
              : styles.participant_success
          }
          role="status"
        >
          {message.message}
        </p>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className={styles.modern_table}>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Événement</th>
              <th>Montant</th>
              <th>Motif</th>
              <th>Statut</th>
              <th>Traitement</th>
            </tr>
          </thead>
          <tbody>
            {refunds.length === 0 ? (
              <tr>
                <td colSpan="6">Aucune demande de remboursement.</td>
              </tr>
            ) : (
              refunds.map((refund) => {
                const participant = refund.ticket?.user;
                const participantName =
                  [participant?.prenom, participant?.nom]
                    .filter(Boolean)
                    .join(" ") ||
                  participant?.email ||
                  "Participant";

                return (
                  <tr key={refund.id}>
                    <td>{participantName}</td>
                    <td>{refund.ticket?.event?.title || "Événement"}</td>
                    <td>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: refund.currency || "XOF",
                        maximumFractionDigits: 0,
                      }).format(refund.amount)}
                    </td>
                    <td>{refund.reason || "Aucun motif"}</td>
                    <td>{refund.status}</td>
                    <td>
                      {refund.status === "PENDING" ? (
                        <div className={styles.refund_admin_actions}>
                          <input
                            type="text"
                            value={providerReferences[refund.id] || ""}
                            onChange={(event) =>
                              setProviderReferences((current) => ({
                                ...current,
                                [refund.id]: event.target.value,
                              }))
                            }
                            placeholder="Référence FedaPay"
                            disabled={isUpdating}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onUpdate(
                                refund.id,
                                "COMPLETED",
                                providerReferences[refund.id]?.trim(),
                              )
                            }
                            disabled={
                              isUpdating ||
                              !providerReferences[refund.id]?.trim()
                            }
                          >
                            Remboursé
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdate(refund.id, "FAILED")}
                            disabled={isUpdating}
                          >
                            Échec
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdate(refund.id, "REJECTED")}
                            disabled={isUpdating}
                          >
                            Rejeter
                          </button>
                        </div>
                      ) : (
                        refund.providerRefundId || "Traité"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
function DashboardSkeleton() {
  return (
    <div
      className={`${styles.dashboard_container} ${styles.dashboard_skeleton}`}
      aria-busy="true"
      aria-label="Chargement du tableau de bord"
    >
      <div className={styles.skeleton_header}>
        <span className={styles.skeleton_heading} />
        <span className={styles.skeleton_subheading} />
      </div>
      <div className={styles.skeleton_tabs} />
      <div className={styles.kpi_grid}>
        {Array.from({ length: 6 }, (_, index) => (
          <div className={styles.kpi_card} key={index} aria-hidden="true">
            <span className={styles.skeleton_icon} />
            <div className={styles.skeleton_kpi_text}>
              <span className={styles.skeleton_label} />
              <span className={styles.skeleton_value} />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.charts_section}>
        {Array.from({ length: 2 }, (_, index) => (
          <div className={styles.chart_card} key={index} aria-hidden="true">
            <span className={styles.skeleton_chart_title} />
            <span className={styles.skeleton_chart} />
          </div>
        ))}
      </div>
      <div className={`${styles.table_card} ${styles.skeleton_table}`}>
        <span className={styles.skeleton_chart_title} />
        {Array.from({ length: 5 }, (_, index) => (
          <span className={styles.skeleton_row} key={index} />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ count = null }) {
  const deleteEventMutation = useDeleteEvent();
  const payoutMutation = usePayout();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [scannerEventId, setScannerEventId] = useState("");
  const [selectedParticipantToRemove, setSelectedParticipantToRemove] =
    useState(null);
  const [unsubscribeReason, setUnsubscribeReason] = useState("");
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [participantActionMessage, setParticipantActionMessage] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const chartRefBar = useRef(null);
  const chartRefDoughnut = useRef(null);

  // Data
  const [eventsList, setEventsList] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [organizerBalance, setOrganizerBalance] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMessage, setPayoutMessage] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [refundActionMessage, setRefundActionMessage] = useState(null);
  const [isUpdatingRefund, setIsUpdatingRefund] = useState(false);
  const [kpis, setKpis] = useState({
    totalEvents: 0,
    activeEvents: 0,
    draftEvents: 0,
    finishedEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
    totalParticipants: 0,
    averageFillRate: 0,
    freeRegistrations: 0,
  });
  const [chartData, setChartData] = useState({
    labels: [],
    revenues: [],
    participantsCounts: [],
  });
  const unsubscribeMutation = useUnsubscribeParticipant();

  const fetchDashboardData = useCallback(async () => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setEventsList([]);
      setParticipants([]);
      setOrganizerBalance(null);
      setRefunds([]);
      setErrorMessage("Vous devez être connecté pour accéder au dashboard.");
      setLoading(false);
      return;
    }

    if (user.role !== "ORGANISATEUR" && user.role !== "ADMIN") {
      setEventsList([]);
      setParticipants([]);
      setOrganizerBalance(null);
      setRefunds([]);
      setErrorMessage("Cet espace est réservé aux organisateurs.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const [eventsRes, balanceResult, refundsResult] = await Promise.all([
        queryClient.fetchQuery(eventQueries.mine()),
        getOrganizerBalance(),
        user.role === "ADMIN"
          ? getRefunds()
          : Promise.resolve({ success: true, refunds: [] }),
      ]);
      setOrganizerBalance(
        balanceResult.success
          ? {
              balance: balanceResult.balance ?? 0,
              reservedBalance: balanceResult.reservedBalance ?? 0,
              availableBalance: balanceResult.availableBalance ?? 0,
              currency: balanceResult.currency || "XOF",
            }
          : null,
      );
      setRefunds(refundsResult.success ? refundsResult.refunds : []);
      // On s'assure que c'est bien la liste (selon l'API)
      const list = Array.isArray(eventsRes)
        ? eventsRes
        : Array.isArray(eventsRes?.events)
          ? eventsRes.events
          : [];
      setEventsList(list);
      setScannerEventId((currentEventId) =>
        list.some((event) => String(event.id) === currentEventId)
          ? currentEventId
          : String(list[0]?.id || ""),
      );

      // Met à jour le compteur global du parent si la prop existe
      if (typeof count === "function") {
        count(list.length);
      }

      // Calcul des KPIs
      let tEvents = list.length;
      let aEvents = 0,
        dEvents = 0,
        fEvents = 0;
      let tTickets = 0,
        tRevenue = 0,
        tCapacity = 0;
      let freeRegistrations = 0;

      let pSalesByEvent = [];
      let allParticipants = [];

      for (const ev of list) {
        // Status mockup simple
        const isExpired = new Date(ev.endDate || ev.startDate) < new Date();
        if (isExpired) fEvents++;
        else aEvents++; // Note: ajouter condition brouillon si API le gère.

        // Capacity
        tCapacity += Number.parseInt(ev.capacity || 0, 10);

        let eventRevenue = 0;
        let eventParticipants = 0;

        try {
          const partRes = await queryClient.fetchQuery(
            participantQueries.byEvent(Number(ev.id)),
          );
          if (
            partRes &&
            !partRes.error &&
            partRes.participant &&
            Array.isArray(partRes.participant.data)
          ) {
            const evParts = partRes.participant.data;
            eventParticipants = evParts.length;

            const soldCount = evParts.length;
            const price = Number.parseFloat(ev.paymentPrice) || 0;
            if (price > 0) {
              // Événement payant
              tTickets += soldCount;
              tRevenue += soldCount * price;
              eventRevenue = soldCount * price;
            } else {
              // Événement gratuit
              freeRegistrations += soldCount;
              eventRevenue = 0;
            }

            allParticipants = [
              ...allParticipants,
              ...evParts.map((p) => ({
                ...p,
                eventTitle: ev.title,
                eventId: ev.id,
                eventPaymentRequired: Boolean(ev.paymentRequired),
                eventPaymentPrice: ev.paymentPrice,
              })),
            ];
          }
        } catch {
          const price = Number.parseFloat(ev.paymentPrice) || 0;
          if (price > 0 && ev.participantsCount) {
            tTickets += ev.participantsCount;
            tRevenue += ev.participantsCount * price;
            eventRevenue = ev.participantsCount * price;
            eventParticipants = ev.participantsCount;
          }
        }

        pSalesByEvent.push({
          title: ev.title,
          revenue: eventRevenue,
          participants: eventParticipants,
        });
      }

      setParticipants(allParticipants);
      setChartData({
        labels: pSalesByEvent.map((s) =>
          s.title.length > 12 ? s.title.substring(0, 16) + "..." : s.title,
        ),
        revenues: pSalesByEvent.map((s) => s.revenue),
        participantsCounts: pSalesByEvent.map((s) => s.participants),
      });
      setKpis({
        totalEvents: tEvents,
        activeEvents: aEvents,
        draftEvents: dEvents,
        finishedEvents: fEvents,
        totalTickets: tTickets,
        totalRevenue: tRevenue,
        totalParticipants:
          allParticipants.length > 0 ? allParticipants.length : tTickets,
        averageFillRate:
          tCapacity > 0 ? Math.round((tTickets / tCapacity) * 100) : 0,
        freeRegistrations,
      });
    } catch {
      setOrganizerBalance(null);
      setRefunds([]);
      setErrorMessage("Impossible de charger les données du dashboard.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, count, isAuthenticated, queryClient, user]);

  useEffect(() => {
    // The async loader owns the dashboard's initial client-side data lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setEventToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete?.id || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await deleteEventMutation.mutateAsync(
        Number(eventToDelete.id),
      );

      if (response.error) {
        setErrorMessage(
          response.message || "Impossible de supprimer l'événement.",
        );
        return;
      }

      setEventsList((currentEvents) =>
        currentEvents.filter((event) => event.id !== eventToDelete.id),
      );
      setEventToDelete(null);
      void fetchDashboardData();
    } catch {
      setErrorMessage("Impossible de supprimer l'événement.");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeUnsubscribeModal = () => {
    if (isUnsubscribing) return;

    setSelectedParticipantToRemove(null);
    setUnsubscribeReason("");

    if (participantActionMessage?.type === "error") {
      setParticipantActionMessage(null);
    }
  };

  const handleConfirmUnsubscribe = async () => {
    const reason = unsubscribeReason.trim();

    if (!selectedParticipantToRemove || isUnsubscribing) return;

    setIsUnsubscribing(true);
    setParticipantActionMessage(null);

    try {
      const result = await unsubscribeMutation.mutateAsync({
        participantId: selectedParticipantToRemove.id,
        eventId: selectedParticipantToRemove.eventId,
        reason,
      });

      if (result.error) {
        setParticipantActionMessage({
          type: "error",
          message:
            result.message || "Impossible de désinscrire ce participant.",
        });
        return;
      }

      const removedParticipantId = selectedParticipantToRemove.id;
      const removedEventId = selectedParticipantToRemove.eventId;

      setParticipants((currentParticipants) =>
        currentParticipants.filter(
          (participant) =>
            !(
              String(participant.id) === String(removedParticipantId) &&
              String(participant.eventId) === String(removedEventId)
            ),
        ),
      );
      setKpis((currentKpis) => ({
        ...currentKpis,
        totalParticipants: Math.max(0, currentKpis.totalParticipants - 1),
      }));
      setSelectedParticipantToRemove(null);
      setUnsubscribeReason("");
      setParticipantActionMessage({
        type: result.refundRequired ? "refund" : "success",
        message:
          result.message ||
          (result.refundRequired
            ? "Le participant a été retiré. La demande de remboursement est en attente."
            : "Le participant a bien été désinscrit."),
      });
      if (user.role === "ADMIN" && result.refundRequired) {
        const refreshedRefunds = await getRefunds();
        if (refreshedRefunds.success) {
          setRefunds(refreshedRefunds.refunds);
        }
      }
      void queryClient.invalidateQueries({
        queryKey: participantKeys.byEvent(Number(removedEventId)),
      });
      void queryClient.invalidateQueries({
        queryKey: participantKeys.byUser(),
      });
    } catch {
      setParticipantActionMessage({
        type: "error",
        message: "Une erreur est survenue pendant la désinscription.",
      });
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const handleRefundUpdate = async (id, status, providerRefundId) => {
    if (isUpdatingRefund) return;

    setIsUpdatingRefund(true);
    setRefundActionMessage(null);

    try {
      const result = await updateRefundStatus({
        id,
        status,
        providerRefundId,
      });

      if (!result.success || !result.refund) {
        setRefundActionMessage({ type: "error", message: result.message });
        return;
      }

      setRefunds((currentRefunds) =>
        currentRefunds.map((refund) =>
          refund.id === id ? { ...refund, ...result.refund } : refund,
        ),
      );
      setRefundActionMessage({ type: "success", message: result.message });
    } catch {
      setRefundActionMessage({
        type: "error",
        message: "Impossible de traiter cette demande de remboursement.",
      });
    } finally {
      setIsUpdatingRefund(false);
    }
  };

  const handlePayoutRequest = async (event) => {
    event.preventDefault();
    if (payoutMutation.isPending) return;

    const amount = Number(payoutAmount);
    const availableBalance = Number(organizerBalance?.availableBalance ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      setPayoutMessage({
        type: "error",
        message: "Saisissez un montant de retrait valide.",
      });
      return;
    }

    if (amount > availableBalance) {
      setPayoutMessage({
        type: "error",
        message: "Le solde disponible est insuffisant pour ce retrait.",
      });
      return;
    }

    setPayoutMessage(null);

    try {
      const result = await payoutMutation.mutateAsync(amount);

      if (!result.success) {
        setPayoutMessage({ type: "error", message: result.message });
        return;
      }

      const refreshedBalance = await getOrganizerBalance();
      if (refreshedBalance.success) {
        setOrganizerBalance({
          balance: refreshedBalance.balance ?? 0,
          reservedBalance: refreshedBalance.reservedBalance ?? 0,
          availableBalance: refreshedBalance.availableBalance ?? 0,
          currency: refreshedBalance.currency || "XOF",
        });
      }

      setPayoutAmount("");
      setPayoutMessage({ type: "success", message: result.message });
    } catch {
      setPayoutMessage({
        type: "error",
        message: "Impossible d'effectuer ce retrait.",
      });
    }
  };

  useEffect(() => {
    if (
      activeTab !== "overview" ||
      !chartRefBar.current ||
      !chartRefDoughnut.current ||
      chartData.labels.length === 0
    )
      return;

    const ctxBar = chartRefBar.current.getContext("2d");
    const ctxPie = chartRefDoughnut.current.getContext("2d");

    const barChart = new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Revenus par événement (FCFA)",
            data: chartData.revenues,
            backgroundColor: "rgba(11, 94, 215, 0.6)",
            borderColor: "rgb(11, 94, 215)",
            borderWidth: 1,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: "#1a1a2e" },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "#f1f3f5" } },
          x: { grid: { display: false } },
        },
      },
    });

    const pieChart = new Chart(ctxPie, {
      type: "doughnut",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Nombre de participants",
            data: chartData.participantsCounts,
            backgroundColor: COLORS,
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, padding: 15 },
          },
          tooltip: { backgroundColor: "#1a1a2e" },
        },
        cutout: "70%",
      },
    });

    return () => {
      barChart.destroy();
      pieChart.destroy();
    };
  }, [activeTab, chartData]);

  const renderOverviewSection = () => {
    return (
      <>
        <div className={styles.kpi_grid}>
          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>{ICONS.calendar}</div>
            <div className={styles.kpi_info}>
              <h3>Événements Total</h3>
              <div className={styles.kpi_value}>
                {kpis.totalEvents}
                <span className={`${styles.kpi_status} ${styles.active}`}>
                  {kpis.activeEvents} actifs
                </span>
              </div>
            </div>
          </div>

          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>{ICONS.ticket}</div>
            <div className={styles.kpi_info}>
              <h3>Billets Vendus</h3>
              <div className={styles.kpi_value}>
                {kpis.totalTickets}
                <span className={styles.kpi_status}>
                  {kpis.averageFillRate}% rempli
                </span>
              </div>
            </div>
          </div>

          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>{ICONS.money}</div>
            <div className={styles.kpi_info}>
              <h3>Revenus Générés</h3>
              <div className={styles.kpi_value}>
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "XOF",
                  maximumFractionDigits: 0,
                }).format(kpis.totalRevenue)}
              </div>
            </div>
          </div>

          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>{ICONS.money}</div>
            <div className={styles.kpi_info}>
              <h3>Solde disponible</h3>
              <div className={styles.kpi_value}>
                {organizerBalance
                  ? new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: organizerBalance.currency,
                      maximumFractionDigits: 0,
                    }).format(organizerBalance.availableBalance)
                  : "Indisponible"}
                {organizerBalance?.reservedBalance > 0 && (
                  <span className={styles.kpi_status}>
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: organizerBalance.currency,
                      maximumFractionDigits: 0,
                    }).format(organizerBalance.reservedBalance)}{" "}
                    réservés
                  </span>
                )}
              </div>
              {organizerBalance && (
                <form
                  className={styles.payout_form}
                  onSubmit={handlePayoutRequest}
                >
                  <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={payoutAmount}
                    onChange={(event) => setPayoutAmount(event.target.value)}
                    placeholder="Montant à retirer"
                    disabled={payoutMutation.isPending}
                  />
                  <button
                    type="submit"
                    disabled={
                      payoutMutation.isPending ||
                      Number(organizerBalance.availableBalance ?? 0) <= 0
                    }
                  >
                    {payoutMutation.isPending ? "Retrait..." : "Retirer"}
                  </button>
                </form>
              )}
              {payoutMessage && (
                <p
                  className={`${styles.payout_message} ${
                    payoutMessage.type === "success"
                      ? styles.success
                      : styles.error
                  }`}
                >
                  {payoutMessage.message}
                </p>
              )}
            </div>
          </div>

          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>{ICONS.users}</div>
            <div className={styles.kpi_info}>
              <h3>Participants</h3>
              <div className={styles.kpi_value}>{kpis.totalParticipants}</div>
            </div>
          </div>
          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>{ICONS.users}</div>
            <div className={styles.kpi_info}>
              <h3>Participants pour l&apos;Événement Gratuit</h3>
              <div className={styles.kpi_value}>{kpis.freeRegistrations}</div>
            </div>
          </div>
        </div>
        <div className={styles.charts_section}>
          <div className={styles.chart_card}>
            <h3>📈 Revenus par événement</h3>
            <div className={styles.chart_wrapper}>
              <canvas ref={chartRefBar}></canvas>
            </div>
          </div>

          <div className={styles.chart_card}>
            <h3>👥 Répartition des participants</h3>
            <div className={styles.chart_wrapper}>
              <canvas ref={chartRefDoughnut}></canvas>
            </div>
          </div>
        </div>

        {/* Ajout de la section des événements ici */}
        <div style={{ marginTop: "2rem" }}>
          <SearchableEventsSection
            eventsList={eventsList}
            isDeleting={isDeleting}
            onDelete={setEventToDelete}
          />
        </div>
      </>
    );
  };

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (errorMessage) {
    return (
      <div className={styles.dashboard_container}>
        <div className={styles.dashboard_header}>
          <h1>Dashboard Organisateur</h1>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.dashboard_header}>
        <h1>
          {user.role === "ADMIN"
            ? "Dashboard administrateur"
            : "Dashboard Organisateur"}
        </h1>
        <p>Suivez l&apos;activité de vos événements en un coup d&apos;œil.</p>
      </div>

      <div className={styles.tabs_nav}>
        <button
          className={`${styles.tab_btn} ${activeTab === "overview" ? styles.active : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Vue d&apos;ensemble
        </button>
        <button
          className={`${styles.tab_btn} ${activeTab === "participants" ? styles.active : ""}`}
          onClick={() => setActiveTab("participants")}
        >
          Participants
        </button>
        <button
          className={`${styles.tab_btn} ${activeTab === "scanner" ? styles.active : ""}`}
          onClick={() => setActiveTab("scanner")}
        >
          Contrôle des billets
        </button>
        {user.role === "ADMIN" && (
          <button
            className={`${styles.tab_btn} ${activeTab === "refunds" ? styles.active : ""}`}
            onClick={() => setActiveTab("refunds")}
          >
            Remboursements
          </button>
        )}
      </div>

      <div className={styles.tab_content}>
        {activeTab === "overview" && renderOverviewSection()}
        {activeTab === "participants" && (
          <ParticipantsSection
            participants={participants}
            eventsList={eventsList}
            participantActionMessage={participantActionMessage}
            isUnsubscribing={isUnsubscribing}
            setSelectedParticipantToRemove={setSelectedParticipantToRemove}
          />
        )}
        {activeTab === "scanner" && (
          <section className={styles.scanner_section}>
            <header className={styles.scanner_header}>
              <h2>Scanner un billet</h2>
              <p>
                Présentez le QR code du participant devant la caméra pour
                valider son entrée.
              </p>
            </header>
            {eventsList.length > 0 ? (
              <>
                <label className={styles.scanner_event_select}>
                  <span>Événement contrôlé</span>
                  <select
                    value={scannerEventId}
                    onChange={(event) => setScannerEventId(event.target.value)}
                  >
                    {eventsList.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </label>

                {scannerEventId && (
                  <TicketQRCodeLecteur
                    key={scannerEventId}
                    eventId={Number(scannerEventId)}
                  />
                )}
              </>
            ) : (
              <p className={styles.scanner_empty}>
                Créez d’abord un événement pour pouvoir contrôler ses billets.
              </p>
            )}
          </section>
        )}
        {activeTab === "refunds" && user.role === "ADMIN" && (
          <RefundsSection
            refunds={refunds}
            message={refundActionMessage}
            isUpdating={isUpdatingRefund}
            onUpdate={handleRefundUpdate}
          />
        )}
      </div>

      <DelectModal
        isOpen={Boolean(eventToDelete)}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        eventTitle={eventToDelete?.title}
        isLoading={isDeleting}
      />

      <UnsubscribeParticipantModal
        participant={selectedParticipantToRemove}
        reason={unsubscribeReason}
        isLoading={isUnsubscribing}
        errorMessage={
          participantActionMessage?.type === "error"
            ? participantActionMessage.message
            : ""
        }
        onReasonChange={setUnsubscribeReason}
        onClose={closeUnsubscribeModal}
        onConfirm={handleConfirmUnsubscribe}
      />
    </div>
  );
}
