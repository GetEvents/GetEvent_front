// Données lues côté serveur pendant le rendu d'une page, mémorisées pour la
// durée de la requête (React `cache`) : le layout, generateMetadata et la
// page peuvent les demander chacun sans refaire d'appel à l'API.
// À utiliser seulement dans des composants serveur, pas dans le navigateur.
import { cache } from "react";
import { getUser } from "@/actions/auth/authActions";
import { getEventById } from "@/actions/event";

/** Utilisateur connecté (un seul appel à l'API par requête). */
export const getCurrentUser = cache(() => getUser());

/** Fiche d'un événement (un seul appel par requête et par id). */
export const getEventDetails = cache((id: number | string) =>
  getEventById(String(id)),
);
