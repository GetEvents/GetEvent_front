// Pays où les organisateurs peuvent vendre des billets (codes ISO 3166-1).
// Même règle que le backend (GetEvent_back/src/utils/payment-countries.js),
// qui refuse de toute façon un événement payant hors de ces pays.
export const TICKET_SALES_COUNTRIES = ["BJ"];

/** Pays non renseigné : autorisé (les versements utilisent le Bénin). */
export const canSellTickets = (pays?: string | null) =>
  !pays || TICKET_SALES_COUNTRIES.includes(String(pays).trim().toUpperCase());
