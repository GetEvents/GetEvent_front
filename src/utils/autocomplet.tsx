"use client";

import type { Dispatch, SetStateAction } from "react";

type FormWithLocation = {
  location: string;
};

export function initMapAuto<T extends FormWithLocation>(
  setForm: Dispatch<SetStateAction<T>>,
) {
  const mapElement = document.getElementById("maps");
  const input = document.getElementById("pac_input") as HTMLInputElement | null;
  const card = document.getElementById("pac_card");
  const infowindowContent = document.getElementById("infowindow-content");

  if (!mapElement || !input || !card || !infowindowContent) {
    console.log(
      "Un ou plusieurs éléments requis sont introuvables dans le DOM.",
    );
    return;
  }

  const searchInput = input;

  // Initialisation de la carte
  const map = new google.maps.Map(mapElement, {
    center: { lat: 40.749933, lng: -73.98633 },
    zoom: 13,
    mapTypeControl: false,
  });

  // Positionner le champ de recherche sur la carte
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);

  // Configuration de l'autocomplete
  const autocomplete = new google.maps.places.Autocomplete(searchInput, {
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place && place.formatted_address) {
      // ✅ mettre à jour visuellement le champ
      searchInput.value = place.formatted_address;

      // ✅ mettre à jour React state pour que le champ contrôlé suive
      setForm((prev) => ({
        ...prev,
        location: place.formatted_address,
      }));
    }
  });

  autocomplete.bindTo("bounds", map);

  const infowindow = new google.maps.InfoWindow();
  infowindow.setContent(infowindowContent);

  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  // Lorsque l'utilisateur sélectionne un lieu
  autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      alert(`Aucun détail disponible pour : '${place.name}'`);
      return;
    }

    // Zoom sur l'endroit sélectionné
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    // Mettre à jour le marqueur et l'info window
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    const placeName =
      infowindowContent.querySelector<HTMLElement>("#place-name");
    const placeAddress =
      infowindowContent.querySelector<HTMLElement>("#place-address");

    if (placeName) {
      placeName.textContent = place.name ?? "";
    }
    if (placeAddress) {
      placeAddress.textContent = place.formatted_address ?? "";
    }

    infowindow.open(map, marker);
  });

  // Fonction pour activer les boutons de filtre d’autocomplétion
  function setupClickListener(id: string, types: string[]) {
    const radioButton = document.getElementById(id);

    if (radioButton) {
      radioButton.addEventListener("click", () => {
        autocomplete.setTypes(types);
        searchInput.value = "";
      });
    } else {
      console.warn(`Élément avec l’ID "${id}" introuvable.`);
    }
  }
  setupClickListener("changetype-all", []);
  setupClickListener("changetype-address", ["address"]);
  setupClickListener("changetype-establishment", ["establishment"]);
  setupClickListener("changetype-geocode", ["geocode"]);
  setupClickListener("changetype-cities", ["(cities)"]);
  setupClickListener("changetype-regions", ["(regions)"]);
}
