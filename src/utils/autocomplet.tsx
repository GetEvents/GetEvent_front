"use client";

import type { Dispatch, SetStateAction } from "react";
import { getGoogleMapId } from "@/hooks/useGoogleMaps";

type FormWithLocation = {
  location: string;
};

type InitMapAutoOptions = {
  variant?: "form" | "search";
};

const STYLE_ID = "getevent-place-autocomplete-styles";

// Le champ de lieu est un composant Google (<gmp-place-autocomplete>) : on
// l'habille comme les autres champs du site (mixin « field » du design).
// Formulaire : bordure, hauteur, survol et focus identiques aux champs.
// Recherche (bande de /events) : transparent, le conteneur fait le cadre.
const AUTOCOMPLETE_CSS = `
  [data-autocomplete-wrapper] {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }
  [data-autocomplete-wrapper='location-form'] {
    min-height: 3.4rem;
    padding: 0 1rem;
    border: 1px solid rgba(17, 17, 19, 0.2);
    border-radius: var(--ge-radius-control, 6px);
    background: var(--ge-paper-raised, #ffffff);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  [data-autocomplete-wrapper='location-form']:hover {
    border-color: rgba(17, 17, 19, 0.4);
  }
  [data-autocomplete-wrapper='location-form']:focus-within {
    border-color: var(--ge-ink, #111113);
    box-shadow: 0 0 0 3px rgba(0, 179, 255, 0.25);
  }
  [data-autocomplete-wrapper] gmp-place-autocomplete {
    display: block;
    width: 100%;
    color-scheme: light;
    background: transparent;
    color: var(--ge-ink, #111113);
    font: inherit;
  }
  [data-autocomplete-wrapper] gmp-place-autocomplete::part(input) {
    padding: 0;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
    color: var(--ge-ink, #111113);
    font: inherit;
  }
  [data-autocomplete-wrapper] gmp-place-autocomplete::part(focus-ring) {
    display: none !important;
  }
  /* Liste des suggestions : carte claire, coins et ombre du site. */
  [data-autocomplete-wrapper] gmp-place-autocomplete::part(prediction-list) {
    margin-top: 6px;
    border: 1px solid rgba(17, 17, 19, 0.12);
    border-radius: var(--ge-radius-card, 10px);
    box-shadow: 0 18px 40px rgba(17, 17, 19, 0.16);
    overflow: hidden;
  }
  [data-autocomplete-wrapper] gmp-place-autocomplete::part(prediction-item-selected) {
    background: rgba(0, 179, 255, 0.1);
  }
`;

function ensureAutocompleteStyles() {
  if (document.getElementById(STYLE_ID)) return;
  // Anciennes versions injectées à chaque ouverture : on les retire.
  document
    .querySelectorAll("style[data-autocomplete-styles]")
    .forEach((node) => node.remove());
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = AUTOCOMPLETE_CSS;
  document.head.appendChild(style);
}

export function initMapAuto<T extends FormWithLocation>(
  setForm: Dispatch<SetStateAction<T>>,
  options: InitMapAutoOptions = {},
) {
  const mapElement = document.getElementById("maps");
  const searchInput = document.getElementById(
    "pac_input",
  ) as HTMLInputElement | null;
  const infowindowContent = document.getElementById("infowindow-content");
  const maps = window.google?.maps;

  if (!mapElement || !searchInput || !infowindowContent) return;

  if (!maps?.Map || !maps.places?.PlaceAutocompleteElement) return;

  // Ancien champ (étape réouverte) : on retire aussi son cadre.
  const previous = document.getElementById("place-autocomplete");
  (previous?.closest("[data-autocomplete-wrapper]") ?? previous)?.remove();

  const variant = options.variant ?? "form";
  const wrapper = document.createElement("div");
  wrapper.setAttribute(
    "data-autocomplete-wrapper",
    variant === "search" ? "location-search" : "location-form",
  );
  ensureAutocompleteStyles();

  const map = new maps.Map(mapElement, {
    center: { lat: 40.749933, lng: -73.98633 },
    zoom: 13,
    mapId: getGoogleMapId(),
    mapTypeControl: false,
  });

  const autocomplete = new maps.places.PlaceAutocompleteElement({
    noInputIcon: true,
    noClearButton: true,
  });
  autocomplete.id = "place-autocomplete";
  autocomplete.placeholder =
    searchInput.placeholder || "Ville, salle ou adresse";
  autocomplete.value = searchInput.value;
  wrapper.appendChild(autocomplete);
  searchInput.hidden = true;
  searchInput.insertAdjacentElement("afterend", wrapper);

  const syncTypedValue = () => {
    const value = autocomplete.value ?? "";
    searchInput.value = value;
    setForm((previous) => ({ ...previous, location: value }));
  };
  autocomplete.addEventListener("input", syncTypedValue);

  const infowindow = new maps.InfoWindow();
  infowindow.setContent(infowindowContent);

  const marker = new maps.marker.AdvancedMarkerElement({
    map,
    title: "Lieu sélectionné",
  });

  const selectPlace = async (
    event: google.maps.places.PlacePredictionSelectEvent,
  ) => {
    infowindow.close();
    marker.map = null;

    const place = event.placePrediction.toPlace();
    await place.fetchFields({
      fields: ["displayName", "formattedAddress", "location", "viewport"],
    });

    if (!place.location) {
      alert(`Aucun détail disponible pour : '${place.displayName}'`);
      return;
    }

    const address = place.formattedAddress ?? place.displayName ?? "";
    searchInput.value = address;
    autocomplete.value = address;
    setForm((previous) => ({ ...previous, location: address }));

    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else {
      map.setCenter(place.location);
      map.setZoom(17);
    }

    marker.position = place.location;
    marker.map = map;

    const placeName =
      infowindowContent.querySelector<HTMLElement>("#place-name");
    const placeAddress =
      infowindowContent.querySelector<HTMLElement>("#place-address");

    if (placeName) placeName.textContent = place.displayName ?? "";
    if (placeAddress) placeAddress.textContent = place.formattedAddress ?? "";

    infowindow.open(map, marker);
  };
  const handlePlaceSelect = (event: Event) => {
    void selectPlace(event as google.maps.places.PlacePredictionSelectEvent);
  };
  autocomplete.addEventListener("gmp-select", handlePlaceSelect);

  return () => {
    autocomplete.removeEventListener("input", syncTypedValue);
    autocomplete.removeEventListener("gmp-select", handlePlaceSelect);
    autocomplete.remove();
    wrapper.remove();
    searchInput.hidden = false;
    marker.map = null;
  };
}
