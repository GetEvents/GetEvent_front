"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import EventCard from "@/components/ui/EventCart";
import NotificationModal from "@/components/NotificationModal/NotificationModal";
import { fetchGetNotifications } from "@/actions/notification";
import { getTokenFromCookie, getUser } from "@/actions/auth/authActions";
import type { Event, EventFilters } from "@/actions/types/event";
import type { Notification } from "@/actions/types/notification";
import { useAuth } from "@/hooks/useAuth";
import { useEvents, fetchEvents } from "@/hooks/useEvents";
import { initMapAuto } from "@/utils/autocomplet";
import { loadGoogleMapsScript } from "@/utils/loadGoogleMap";
import style from "./style.module.scss";

const EVENTS_PER_PAGE = 6;

const categories = [
  { id: "all", label: "Tous les événements", img: "/target.png" },
  { id: "music", label: "Musique", img: "/musical-note.png" },
  { id: "sport", label: "Sports", img: "/soccer-ball-variant.png" },
  { id: "tech", label: "Technologie", img: "/laptop.png" },
  { id: "food", label: "Gastronomie", img: "/vegetables.png" },
  { id: "business", label: "Business", img: "/briefcase.png" },
  { id: "art", label: "Art & Culture", img: "/palette.png" },
  { id: "social", label: "Social", img: "/people.png" },
  { id: "education", label: "Éducation", img: "/stack-of-books.png" },
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

export default function Welcome() {
  const { user, setUser, setToken, isAuthenticated } = useAuth();
  const [extraEvents, setExtraEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortFilter, setSortFilter] =
    useState<EventFilters["filter"]>("recent");
  const [location, setLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  const eventList = useMemo(
    () => [...queryEvents, ...extraEvents],
    [queryEvents, extraEvents],
  );

  const effectiveFeedback =
    feedback || (error ? { error: true, message: error.message } : null);

  useEffect(() => {
    const loadUser = async () => {
      const [userResponse, token] = await Promise.all([
        getUser(),
        getTokenFromCookie(),
      ]);

      setUser(userResponse?.user || null);
      setToken(token || null);

      if (token) {
        const notificationResponse = await fetchGetNotifications(20, 0);
        setNotifications(notificationResponse.notifications);
        setNotificationCount(
          notificationResponse.notifications.filter(
            (notification) => !notification.isRead,
          ).length,
        );
      }
    };

    void loadUser();
  }, [setToken, setUser]);

  const isSearching = isFetching || isLoadingMore;
  const loading = (isLoading || isFetching) && !isLoadingMore;

  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (window.google?.maps) {
        initMapAuto<{ location: string }>((update) => {
          setLocation((currentLocation) => {
            const currentForm = { location: currentLocation };
            const nextForm =
              typeof update === "function" ? update(currentForm) : update;
            return nextForm.location;
          });
        });
      }
    });
  }, []);

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

  const handleLoadMore = async () => {
    setIsLoadingMore(true);

    try {
      const response = await fetchEvents({
        page: Math.ceil(eventList.length / 10) + 1,
        search: searchQuery,
        category: activeFilter,
        location,
        filter: sortFilter,
      });
      setExtraEvents((previous) => [...previous, ...response]);
    } catch (error) {
      setFeedback({
        error: true,
        message:
          error instanceof Error
            ? error.message
            : "Impossible de charger plus d'événements.",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(eventList.length / EVENTS_PER_PAGE));
  const visibleEvents = useMemo(() => {
    const start = (currentPage - 1) * EVENTS_PER_PAGE;
    return eventList.slice(start, start + EVENTS_PER_PAGE);
  }, [currentPage, eventList]);

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
        }`}
      >
        {isAuthenticated && (
          <div className={style.topNavBar}>
            <div className={style.navContainer}>
              <div className={style.navLeft}>
                <h2 className={style.navTitle}>DÉCOUVRIR</h2>
              </div>
              <div className={style.navRight}>
                {user?.role === "ORGANISATEUR" && (
                  <Link
                    href="/events/createvent"
                    className={style.createEventNavBtn}
                  >
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
                      priority={index < 3}
                      quality={90}
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
                      <Image src={category.img} alt="" width={20} height={20} />
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
              <h2 className={style.sectionTitle}>Événements à venir</h2>
              <p className={style.sectionSubtitle}>
                {loading
                  ? "Recherche des meilleures expériences..."
                  : `${eventList.length} événement${eventList.length > 1 ? "s" : ""} trouvé${eventList.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className={style.headerActions}>
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
                <option value="popular">Plus populaire</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
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
          />

          {eventList.length > EVENTS_PER_PAGE && (
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

          <div className={style.loadMoreContainer}>
            <button
              type="button"
              className={style.loadMoreBtn}
              onClick={() => void handleLoadMore()}
              disabled={isSearching}
            >
              {isSearching ? "Chargement..." : "Charger plus d'événements"}
            </button>
          </div>
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
