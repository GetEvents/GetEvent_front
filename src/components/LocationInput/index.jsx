"use client";

import { useEffect, useRef } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

const LocationInput = ({
  value,
  onChange,
  name = "location",
  label = "Lieu de l'événement",
}) => {
  const containerRef = useRef(null);
  const googleMapsReady = useGoogleMaps(["places"]);

  useEffect(() => {
    if (!googleMapsReady || !containerRef.current) return;

    const autocomplete = new window.google.maps.places.PlaceAutocompleteElement(
      {
        noInputIcon: true,
        noClearButton: true,
      },
    );
    autocomplete.placeholder = label;
    autocomplete.value = value ?? "";
    autocomplete.style.width = "100%";
    autocomplete.style.colorScheme = "light";
    autocomplete.style.backgroundColor = "#ffffff";
    autocomplete.style.color = "#0f172a";
    autocomplete.style.border = "1px solid #d1d5db";
    autocomplete.style.borderRadius = "0.375rem";
    autocomplete.style.font = "inherit";
    containerRef.current.appendChild(autocomplete);

    const handleInput = () => {
      onChange({ target: { name, value: autocomplete.value ?? "" } });
    };
    const handleSelect = async ({ placePrediction }) => {
      const place = placePrediction.toPlace();
      await place.fetchFields({ fields: ["displayName", "formattedAddress"] });
      const address = place.formattedAddress ?? place.displayName ?? "";
      autocomplete.value = address;
      onChange({ target: { name, value: address } });
    };

    autocomplete.addEventListener("input", handleInput);
    autocomplete.addEventListener("gmp-select", handleSelect);

    return () => {
      autocomplete.removeEventListener("input", handleInput);
      autocomplete.removeEventListener("gmp-select", handleSelect);
      autocomplete.remove();
    };
  }, [googleMapsReady, label, name, onChange, value]);

  return (
    <div className="mb-3 pac_card">
      <label className="form-label">{label}</label>
      <div ref={containerRef} />
      <input type="hidden" className="form-control" name={name} value={value} />
    </div>
  );
};

export default LocationInput;
