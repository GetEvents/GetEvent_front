"use client";

import type { Dispatch, SetStateAction } from "react";
import { getGoogleMapId } from "@/hooks/useGoogleMaps";

type FormWithLocation = {
  location: string;
};

type InitMapAutoOptions = {
  variant?: "form" | "search";
};

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

  document.getElementById("place-autocomplete")?.remove();

  const variant = options.variant ?? "form";
  const wrapper = document.createElement("div");
  wrapper.setAttribute(
    "data-autocomplete-wrapper",
    variant === "search" ? "location-search" : "location-form",
  );
  wrapper.className = variant === "search" ? "" : "form-control";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.width = "100%";
  wrapper.style.minHeight = variant === "search" ? "auto" : "44px";
  wrapper.style.padding = variant === "search" ? "0" : "0.75rem 0.9rem";
  wrapper.style.border = variant === "search" ? "none" : "1px solid #d1d5db";
  wrapper.style.borderRadius = variant === "search" ? "0" : "0.5rem";
  wrapper.style.backgroundColor =
    variant === "search" ? "transparent" : "#ffffff";
  wrapper.style.boxShadow = "none";
  wrapper.style.transition =
    variant === "search"
      ? "none"
      : "border-color 0.2s ease, box-shadow 0.2s ease";

  const style = document.createElement("style");
  style.setAttribute("data-autocomplete-styles", variant);
  style.textContent = `
    [data-autocomplete-wrapper='location-form'] { position: relative; background: #fff; border: 1px solid #d1d5db; border-radius: 0.5rem; box-shadow: none; }
    [data-autocomplete-wrapper='location-form'] gmp-place-autocomplete::part(input) {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
      background: transparent !important;
    }
    [data-autocomplete-wrapper='location-form'] gmp-place-autocomplete::part(focus-ring) {
      display: none !important;
    }
    [data-autocomplete-wrapper='location-search'] { position: relative; background: transparent; border: none; border-radius: 0; box-shadow: none; }
    [data-autocomplete-wrapper='location-search'] gmp-place-autocomplete::part(input) {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
      background: transparent !important;
    }
    [data-autocomplete-wrapper='location-search'] gmp-place-autocomplete::part(focus-ring) {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

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
  autocomplete.placeholder = searchInput.placeholder || "Rechercher un lieu";
  autocomplete.style.width = "100%";
  autocomplete.style.display = "block";
  autocomplete.style.colorScheme = "light";
  autocomplete.style.backgroundColor = "transparent";
  autocomplete.style.color = "#0f172a";
  autocomplete.style.border = "0 solid transparent";
  autocomplete.style.borderRadius = "0";
  autocomplete.style.boxShadow = "none";
  autocomplete.style.outline = "none";
  autocomplete.style.padding = "0";
  autocomplete.style.font = "inherit";
  autocomplete.style.lineHeight = "1.5";
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
    searchInput.hidden = false;
    marker.map = null;
  };
}
