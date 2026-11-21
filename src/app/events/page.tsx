"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpDown, ChevronDown, SlidersHorizontal } from "lucide-react";
import EventCard from "@/components/ui/EventCart";
import NotificationModal from "@/components/NotificationModal/NotificationModal";
import { fetchGetNotifications } from "@/actions/notification";
import { NEW_NOTIFICATION_EVENT } from "@/components/Notification/notification-events";
import type { Event, EventFilters } from "@/actions/types/event";
import type { Notification } from "@/actions/types/notification";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useTicketsByUser } from "@/hooks/useParticipants";
import { initMapAuto } from "@/utils/autocomplet";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import style from "./style.module.scss";

const EVENTS_PER_PAGE = 6;

const categories = [
  { id: "all", label: "Tous les événements", img: "/icons/target.webp" },
  { id: "music", label: "Musique", img: "/icons/musical-note.webp" },
  { id: "sport", label: "Sports", img: "/icons/soccer-ball-variant.webp" },
  { id: "tech", label: "Technologie", img: "/icons/laptop.webp" },
  { id: "food", label: "Gastronomie", img: "/icons/vegetables.webp" },
  { id: "business", label: "Business", img: "/icons/briefcase.webp" },
  { id: "art", label: "Art & Culture", img: "/icons/palette.webp" },
  { id: "social", label: "Social", img: "/icons/people.webp" },
  { id: "education", label: "Éducation", img: "/icons/stack-of-books.webp" },
];

const quickCategories = categories.slice(0, 4);
const advancedCategories = categories.slice(4);

interface SearchOptions {
  category?: string;
  filter?: EventFilters["filter"];
}

interface Feedback {
  error: boolean;
  message: string;
}

const isEventExpired = (event: Event, now: number): boolean => {
  if (!event?.endDate) return false;
  const endDate = new Date(event.endDate);
  if (Number.isNaN(endDate.getTime())) return false;
  const endDateTime = new Date(endDate);
  if (event?.endTime) {
    const [hours = "00", minutes = "00"] = String(event.endTime).split(":");
    endDateTime.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  }
  return endDateTime.getTime() < now;
};

export default function Welcome() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [timelineFilter, setTimelineFilter] = useState<
    "upcoming" | "past" | "participating"
  >("upcoming");
  const [sortFilter, setSortFilter] =
    useState<EventFilters["filter"]>("recent");
  const [location, setLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [queryParams, setQueryParams] = useState<EventFilters>({
    page: 1,
    category: "all",
    filter: "recent",
    location: "",
  });

  const {
    data: queryEvents = [],
    isFetching,
    isLoading,
    error,
  } = useEvents(queryParams);

  const eventList = queryEvents;

  const effectiveFeedback =
    feedback || (error ? { error: true, message: error.message } : null);

  // Google Maps (~260 Ko, pour l'autocomplétion du lieu) n'est chargé
  // qu'une fois la liste affichée, pour ne pas la ralentir.
  const eventsReady = !isLoading;
  const googleMapsReady = useGoogleMaps(["places", "marker"], {
    enabled: eventsReady,
  });

  // L'utilisateur vient déjà du layout (AuthProvider) : pas de nouvel appel.
  // Les notifications attendent la liste des événements, car Next.js
  // exécute les actions serveur l'une après l'autre : elles passeraient
  // sinon avant l'affichage des événements.
  const userId = user?.id;
  useEffect(() => {
    if (!userId || !eventsReady) return undefined;
    let active = true;

    void fetchGetNotifications(20, 0).then((notificationResponse) => {
      if (!active) return;
      setNotifications(notificationResponse.notifications);
      setNotificationCount(
        notificationResponse.notifications.filter(
          (notification) => !notification.isRead,
        ).length,
      );
    });

    return () => {
      active = false;
    };
  }, [userId, eventsReady]);

  // Notification reçue en temps réel (voir RealtimeNotifications) : ajoutée
  // en tête de liste et comptée comme non lue, sans recharger la page.
  useEffect(() => {
    const handleNew = (event: globalThis.Event) => {
      const notification = (event as CustomEvent<Notification>).detail;
      if (!notification?.id) return;
      setNotifications((current) =>
        current.some((item) => item.id === notification.id)
          ? current
          : [notification, ...current],
      );
      if (!notification.isRead) setNotificationCount((count) => count + 1);
    };
    window.addEventListener(NEW_NOTIFICATION_EVENT, handleNew);
    return () => window.removeEventListener(NEW_NOTIFICATION_EVENT, handleNew);
  }, []);

  const isSearching = isFetching;
  // Squelette seulement s'il n'y a encore aucune donnée : pendant un
  // rafraîchissement en arrière-plan, la liste en cache reste affichée.
  const loading = isLoading;

  useEffect(() => {
    if (!googleMapsReady) return;

    return initMapAuto<{ location: string }>(
      (update) => {
        setLocation((currentLocation) => {
          const currentForm = { location: currentLocation };
          const nextForm =
            typeof update === "function" ? update(currentForm) : update;
          return nextForm.location;
        });
      },
      { variant: "search" },
    );
  }, [googleMapsReady]);

  const searchEvents = (options: SearchOptions = {}) => {
    const category = options.category ?? activeFilter;
    const filter = options.filter ?? sortFilter;

    setFeedback(null);
    setCurrentPage(1);
    setQueryParams({
      page: 1,
      search: searchQuery,
      category,
      filter,
      location,
    });
  };

  const [currentTime] = useState(Date.now);

  // Billets de l'utilisateur : après la liste, pour la même raison.
  const userTicketsQuery = useTicketsByUser(
    user?.id,
    Boolean(user?.id) && isAuthenticated && eventsReady,
  );

  const registeredEventIds = useMemo(() => {
    if (!isAuthenticated || !user?.id) return new Set<number>();
    const tickets = userTicketsQuery.data || [];
    const ids = new Set<number>();
    for (const t of tickets) {
      if (t.status !== "CANCELLED" && t.event?.id) {
        ids.add(Number(t.event.id));
      }
    }
    return ids;
  }, [isAuthenticated, user, userTicketsQuery.data]);

  const upcomingEvents = useMemo(() => {
    return eventList.filter((event) => {
      if (isEventExpired(event, currentTime)) return false;
      if (!isAuthenticated || !user?.id) return true;
      if (registeredEventIds.has(Number(event.id))) return false;
      if (Array.isArray(event.tickets)) {
        const isRegistered = event.tickets.some(
          (t) =>
            t.status !== "CANCELLED" &&
            Number(t.userId || (t.user as { id?: number })?.id) ===
              Number(user.id),
        );
        if (isRegistered) return false;
      }
      return true;
    });
  }, [eventList, currentTime, registeredEventIds, isAuthenticated, user]);

  const pastEvents = useMemo(
    () => eventList.filter((event) => isEventExpired(event, currentTime)),
    [eventList, currentTime],
  );

  const participatingEvents = useMemo(() => {
    if (!isAuthenticated || !user?.id) return [];
    const tickets = userTicketsQuery.data || [];
    const map = new Map<number, Event>();
    for (const t of tickets) {
      if (t.status === "CANCELLED") continue;
      const ev = t.event;
      if (ev && ev.id && !map.has(ev.id)) {
        const fullEvent = eventList.find((e) => e.id === ev.id) || ev;
        map.set(ev.id, fullEvent as Event);
      }
    }
    return Array.from(map.values());
  }, [isAuthenticated, user, userTicketsQuery.data, eventList]);

  const displayedParticipatingEvents = useMemo(() => {
    let list = participatingEvents;
    if (activeFilter && activeFilter !== "all") {
      list = list.filter((e) => e.category === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [participatingEvents, activeFilter, searchQuery]);

  const displayedEvents =
    timelineFilter === "past"
      ? pastEvents
      : timelineFilter === "participating"
        ? displayedParticipatingEvents
        : upcomingEvents;

  const totalPages = Math.max(
    1,
    Math.ceil(displayedEvents.length / EVENTS_PER_PAGE),
  );
  const visibleEvents = useMemo(() => {
    const start = (currentPage - 1) * EVENTS_PER_PAGE;
    return displayedEvents.slice(start, start + EVENTS_PER_PAGE);
  }, [currentPage, displayedEvents]);

  const handlePageChange = (pageNumber: number) => {
    const nextPage = Math.min(Math.max(pageNumber, 1), totalPages);
    setCurrentPage(nextPage);
    document
      .querySelector(`.${style.eventsSection}`)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main
        className={`${style.eventsPage} ${
          !isAuthenticated ? style.withPublicNavbar : ""
        } ${isAuthenticated ? style.withMobileSidebar : ""}`}
      >
        {isAuthenticated && (
          <div className={style.topNavBar}>
            <div className={style.navContainer}>
              <div className={style.navLeft}>
                <h2 className={style.navTitle}>DÉCOUVRIR</h2>
              </div>
              <div className={style.navRight}>
                {user?.role === "ORGANISATEUR" && (
                  <Link href="/events/new" className={style.createEventNavBtn}>
                    <span aria-hidden="true">+</span>
                    <span className={style.createEventLabel}>
                      Créer un événement
                    </span>
                  </Link>
                )}
                <button
                  type="button"
                  className={style.notificationBtn}
                  onClick={() => setShowNotifications(true)}
                  aria-label="Ouvrir les notifications"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {notificationCount > 0 && (
                    <span className={style.notificationDot}>
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className={style.heroSection}>
          <div className={style.heroContent}>
            <h1 className={style.heroTitle}>
              Trouvez votre prochaine{" "}
              <span className={style.highlight}>expérience</span>
            </h1>
            <p className={style.heroSubtitle}>
              Vivez de nouvelles expériences aujourd&apos;hui et trouvez votre
              prochaine aventure.
            </p>

            <div className={style.searchContainer}>
              <div className={style.searchGroup}>
                <div className={style.searchInput}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="search"
                    placeholder="Rechercher des événements..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void searchEvents();
                    }}
                  />
                </div>
                <div className={style.locationInput}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <input
                    type="text"
                    id="pac_input"
                    placeholder="Ville ou lieu"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className={style.searchButton}
                onClick={() => void searchEvents()}
                disabled={isSearching}
              >
                {isSearching ? "Recherche..." : "Rechercher"}
              </button>
            </div>

            <div id="pac_card" className={style.mapContainer}>
              <div id="maps" className="maps mb-3" />
              <div id="infowindow-content">
                <span id="place-name" className="title" />
                <br />
                <span id="place-address" />
              </div>
            </div>

            <div className={style.categoryFilters}>
              {quickCategories.map((category, index) => (
                <button
                  type="button"
                  key={category.id}
                  className={`${style.filterBtn} ${
                    activeFilter === category.id ? style.active : ""
                  }`}
                  onClick={() => {
                    setActiveFilter(category.id);
                    void searchEvents({ category: category.id });
                  }}
                >
                  <span className={style.filterIcon}>
                    <Image
                      src={category.img}
                      alt=""
                      width={25}
                      height={25}
                      // Les 4 catégories rapides sont visibles dès l'arrivée :
                      // les charger toutes immédiatement (la 4e restait vide).
                      priority={index < quickCategories.length}
                      // Icônes déjà réduites (public/icons, WebP 96 px) :
                      // servies telles quelles, sans passer par l'optimiseur.
                      unoptimized
                    />
                  </span>
                  {category.label}
                </button>
              ))}

              <details className={style.advancedFilters}>
                <summary
                  className={`${style.advancedFilterButton} ${
                    advancedCategories.some(
                      (category) => category.id === activeFilter,
                    )
                      ? style.active
                      : ""
                  }`}
                >
                  <SlidersHorizontal aria-hidden="true" />
                  <span>Filtres avancés</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={style.advancedChevron}
                  />
                </summary>

                <div className={style.advancedFilterMenu}>
                  <p className={style.advancedFilterTitle}>Catégories</p>
                  {advancedCategories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      className={`${style.advancedFilterOption} ${
                        activeFilter === category.id ? style.active : ""
                      }`}
                      onClick={(event) => {
                        setActiveFilter(category.id);
                        void searchEvents({ category: category.id });
                        event.currentTarget
                          .closest("details")
                          ?.removeAttribute("open");
                      }}
                    >
                      <Image
                        src={category.img}
                        alt=""
                        width={20}
                        height={20}
                        unoptimized
                      />
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className={style.eventsSection}>
          <div className={style.sectionHeader}>
            <div>
              <h2 className={style.sectionTitle}>
                {timelineFilter === "participating"
                  ? "Mes participations"
                  : timelineFilter === "past"
                    ? "Événements passés"
                    : "Événements à venir"}
              </h2>
              <p className={style.sectionSubtitle}>
                {loading
                  ? "Recherche des meilleures expériences..."
                  : timelineFilter === "participating"
                    ? displayedEvents.length === 0
                      ? "Vous ne participez à aucun événement pour le moment."
                      : `${displayedEvents.length} événement${
                          displayedEvents.length > 1 ? "s" : ""
                        } auquel${
                          displayedEvents.length > 1 ? "s" : ""
                        } vous participez`
                    : `${displayedEvents.length} événement${
                        displayedEvents.length > 1 ? "s" : ""
                      } ${
                        // « à venir » est invariable : seul « terminé » s'accorde.
                        timelineFilter === "past"
                          ? `terminé${displayedEvents.length > 1 ? "s" : ""}`
                          : "à venir"
                      }`}
              </p>
            </div>
            <div className={style.headerActions}>
              <div className={style.timelineToggle}>
                <button
                  type="button"
                  className={`${style.timelineBtn} ${
                    timelineFilter === "upcoming" ? style.active : ""
                  }`}
                  onClick={() => {
                    setTimelineFilter("upcoming");
                    setCurrentPage(1);
                  }}
                >
                  <span className={style.tabLabelDesktop}>À venir</span>
                  <span className={style.tabLabelMobile}>À venir</span>
                  <span className={style.timelineCount}>
                    {upcomingEvents.length}
                  </span>
                </button>
                <button
                  type="button"
                  className={`${style.timelineBtn} ${
                    timelineFilter === "past" ? style.active : ""
                  }`}
                  onClick={() => {
                    setTimelineFilter("past");
                    setCurrentPage(1);
                  }}
                >
                  <span className={style.tabLabelDesktop}>
                    Événements passés
                  </span>
                  <span className={style.tabLabelMobile}>Passés</span>
                  <span className={style.timelineCount}>
                    {pastEvents.length}
                  </span>
                </button>
                {(isAuthenticated || Boolean(user)) && (
                  <button
                    type="button"
                    className={`${style.timelineBtn} ${
                      timelineFilter === "participating" ? style.active : ""
                    }`}
                    onClick={() => {
                      setTimelineFilter("participating");
                      setCurrentPage(1);
                    }}
                  >
                    <span className={style.tabLabelDesktop}>
                      Mes participations
                    </span>
                    <span className={style.tabLabelMobile}>Inscrits</span>
                    <span className={style.timelineCount}>
                      {participatingEvents.length}
                    </span>
                  </button>
                )}
              </div>

              <div className={style.sortSelectWrapper}>
                <ArrowUpDown
                  size={15}
                  className={style.sortIcon}
                  aria-hidden="true"
                />
                <label htmlFor="event-sort" className={style.srOnly}>
                  Trier les événements
                </label>
                <select
                  id="event-sort"
                  value={sortFilter}
                  onChange={(event) => {
                    const filter = event.target.value as EventFilters["filter"];
                    setSortFilter(filter);
                    void searchEvents({ filter });
                  }}
                  className={style.sortSelect}
                >
                  <option value="recent">Plus récent</option>
                  <option value="oldest">Plus ancien</option>
                  <option value="popular">Plus populaire</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
                <ChevronDown
                  size={15}
                  className={style.sortChevron}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <EventCard
            message={effectiveFeedback}
            eventList={visibleEvents}
            loading={loading}
            current_user={user}
            state={effectiveFeedback}
            show={Boolean(effectiveFeedback)}
            handleClose={() => setFeedback(null)}
            emptyMessage={
              timelineFilter === "participating" ? (
                <>
                  Vous n&apos;êtes inscrit à aucun événement pour le moment.
                  <br />
                  Explorez les événements à venir et réservez vos places !
                </>
              ) : undefined
            }
          />

          {displayedEvents.length > EVENTS_PER_PAGE && (
            <div className={style.paginationContainer}>
              <button
                type="button"
                className={style.paginationArrow}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                ‹
              </button>
              <div className={style.paginationNumbers}>
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={`${style.paginationNumber} ${
                      page === currentPage ? style.active : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={style.paginationArrow}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                ›
              </button>
            </div>
          )}
        </section>
      </main>

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        setNotifications={setNotifications}
        setNotificationCount={setNotificationCount}
      />
    </>
  );
}
