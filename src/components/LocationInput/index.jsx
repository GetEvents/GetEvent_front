// components/LocationInput/index.js
"use client";
import { useEffect, useRef } from "react";

const LocationInput = ({
  value,
  onChange,
  name = "location",
  label = "Lieu de l'événement",
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
    );
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        onChange({ target: { name, value: place.formatted_address } });
      }
    });
  }, [name, onChange]);

  return (
    <div className="mb-3 pac_card">
      <label className="form-label">{label}</label>
      <input
        ref={inputRef}
        type="text"
        className="form-control"
        name={name}
        value={value}
        onChange={onChange}
        id="pac_input"
        required
      />
    </div>
  );
};

export default LocationInput;
