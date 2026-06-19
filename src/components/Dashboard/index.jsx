"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./style.module.scss";
import Link from "next/link";
import Chart from "chart.js/auto";
import { getEventByUser } from "@/actions/event";

import { getParticipantByEventId } from "@/actions/participant";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/ui/Loading";

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

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
export default function Dashboard({ count = null }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const chartRefBar = useRef(null);
  const chartRefDoughnut = useRef(null);

  // Data
  const [eventsList, setEventsList] = useState([]);
  const [participants, setParticipants] = useState([]);
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

  const fetchDashboardData = useCallback(async () => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setEventsList([]);
      setParticipants([]);
      setErrorMessage("Vous devez être connecté pour accéder au dashboard.");
      setLoading(false);
      return;
    }

    if (user.role !== "ORGANISATEUR" && user.role !== "ADMIN") {
      setEventsList([]);
      setParticipants([]);
      setErrorMessage("Cet espace est réservé aux organisateurs.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const eventsRes = await getEventByUser();
      // On s'assure que c'est bien la liste (selon l'API)
      const list = Array.isArray(eventsRes)
        ? eventsRes
        : Array.isArray(eventsRes?.events)
          ? eventsRes.events
          : [];
      setEventsList(list);

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
          const partRes = await getParticipantByEventId(ev.id);
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
              // 💰 Événement payant
              tTickets += soldCount;
              tRevenue += soldCount * price;
              eventRevenue = soldCount * price;
            } else {
              // 🆓 Événement gratuit
              freeRegistrations += soldCount;
              eventRevenue = 0;
            }

            allParticipants = [
              ...allParticipants,
              ...evParts.map((p) => ({
                ...p,
                eventTitle: ev.title,
                eventId: ev.id,
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
      setErrorMessage("Impossible de charger les données du dashboard.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, count, isAuthenticated, user]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const OverviewSection = ({ chartData }) => {
    useEffect(() => {
      if (
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
              label: "Revenus par événement (€)",
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
    }, [chartData]);

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
                  currency: "EUR",
                }).format(kpis.totalRevenue)}
              </div>
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
              <h3>Evénement Gratuit</h3>
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
          <EventsSection />
        </div>
      </>
    );
  };

  const EventsSection = () => {
    // Statut simple factice car manque dans getMyCreated
    const getStatus = (ev) => {
      if (new Date(ev.endDate || ev.startDate) < new Date()) return "terminé";
      return "publié"; // ou 'brouillon' si on a l'info
    };

    return (
      <div className={styles.table_card}>
        <div className={styles.table_header_actions}>
          <h3>Gérer les événements</h3>
          <div className={styles.filters}>
            <input type="text" placeholder="Rechercher un événement..." />
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
                <th>Date & Lieu</th>
                <th>Capacité</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eventsList.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Aucun événement trouvé
                  </td>
                </tr>
              )}
              {eventsList.map((ev) => {
                const status = getStatus(ev);
                return (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600, color: "#1a1a2e" }}>
                      {ev.title}
                    </td>
                    <td>
                      <div>
                        {new Date(ev.startDate).toLocaleDateString("fr-FR")}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                        {ev.location}
                      </div>
                    </td>
                    <td>{ev.capacity || "N/A"}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${status === "terminé" ? styles.status_finished : styles.status_published}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/events/${ev.id}`}
                          className={styles.view}
                          title="Voir"
                        >
                          {ICONS.view}
                        </Link>
                        <Link
                          href={`/events/editEvent/${ev.id}`}
                          className={styles.edit}
                          title="Modifier"
                        >
                          {ICONS.edit}
                        </Link>
                        <button className={styles.delete} title="Supprimer">
                          {ICONS.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ParticipantsSection = () => {
    const [selectedEventId, setSelectedEventId] = useState("all");

    // Filtre
    const filteredParticipants =
      selectedEventId === "all"
        ? participants
        : participants.filter((p) => p.eventId.toString() === selectedEventId);

    return (
      <div className={styles.table_card}>
        <div className={styles.table_header_actions}>
          <h3>Gérer les participants</h3>
          <div className={styles.filters}>
            <input type="text" placeholder="Rechercher (Nom, Email...)" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="all">Tous les événements</option>
              {eventsList.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.modern_table}>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Événement</th>
                <th>Type de Billet</th>
                <th>Statut</th>
                <th>Rôle / Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Aucun participant
                  </td>
                </tr>
              )}
              {filteredParticipants.map((part) => (
                <tr key={part.id}>
                  <td>
                    <div className={styles.participant_info}>
                      <div className={styles.avatar}>
                        {(
                          part.user?.prenom?.[0] ||
                          part.user?.nom?.[0] ||
                          "?"
                        ).toUpperCase()}
                      </div>
                      <div className={styles.details}>
                        <span className={styles.name}>
                          {part.user?.prenom} {part.user?.nom}
                        </span>
                        <span className={styles.email}>
                          {part.user?.email || "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{part.eventTitle}</td>
                  <td>
                    Standard{" "}
                    <small style={{ color: "#6c757d" }}>(Défaut)</small>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.status_paid}`}>
                      Validé
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <select
                        style={{
                          padding: "0.3rem",
                          borderRadius: "5px",
                          border: "1px solid #ced4da",
                        }}
                      >
                        <option value="participant">Participant</option>
                        <option value="vip">VIP</option>
                        <option value="staff">Staff</option>
                      </select>
                      <button
                        className={styles.delete}
                        title="Retirer"
                        style={{
                          border: "none",
                          background: "none",
                          color: "#dc3545",
                          cursor: "pointer",
                        }}
                      >
                        {ICONS.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (authLoading || loading) {
    return <Loading message="Chargement de l'événement..." />;
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
        <h1>Dashboard Organisateur</h1>
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
      </div>

      <div className={styles.tab_content}>
        {activeTab === "overview" && <OverviewSection chartData={chartData} />}
        {activeTab === "participants" && <ParticipantsSection />}
      </div>
    </div>
  );
}