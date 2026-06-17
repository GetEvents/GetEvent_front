"use client";

import { useEffect, useRef, useState } from "react";

interface EventMapProps {
  title: string;
  location: string;
}

export default function EventMap({ title, location }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasMapConfig = Boolean(location && apiKey);

  useEffect(() => {
    if (!hasMapConfig) return;

    const loadGoogleMapsScript = async () => {
      if (window.google) return;

      await new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
          'script[data-google-maps="true"]',
        );

        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(), {
            once: true,
          });
          existingScript.addEventListener("error", () => reject(), {
            once: true,
          });
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.dataset.googleMaps = "true";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 48.8566, lng: 2.3522 },
          zoom: 13,
        });
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: location }, (results, status) => {
          if (status !== "OK" || !results?.[0]) {
            setUnavailable(true);
            return;
          }

          const coordinates = results[0].geometry.location;
          const marker = new google.maps.Marker({
            map,
            position: coordinates,
            title: title || "Événement",
            animation: google.maps.Animation.DROP,
          });
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="max-width:220px"><strong>${title}</strong><p>${location}</p></div>`,
          });

          marker.addListener("click", () =>
            infoWindow.open({ map, anchor: marker }),
          );
          map.setCenter(coordinates);
          map.setZoom(15);
        });
      } catch {
        setUnavailable(true);
      }
    };

    void initMap();
  }, [apiKey, hasMapConfig, location, title]);

  if (!hasMapConfig || unavailable) {
    return (
      <div
        style={{
          display: "grid",
          minHeight: 200,
          placeItems: "center",
          padding: 24,
          borderRadius: 10,
          background: "#f1f5f9",
          textAlign: "center",
        }}
      >
        <div>
          <p>{location}</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir dans Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      aria-label={`Carte de ${location}`}
      style={{ width: "100%", height: 200, borderRadius: 10 }}
    />
  );
}
