import React from "react";
import { useEffect, useRef } from "react";
interface EventMapProps {
  title: string;
  location: string;
}

export default function EventMap({ title, location }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Retourner si pas de location
    if (!location) {
      console.warn("EventMap: location est manquant");
      return;
    }

    // Charger Google Maps script dynamiquement
    const loadGoogleMapsScript = async () => {
      if (window.google) return Promise.resolve();
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB7F40ScgF_mzivb6E4itBxANpz3qdju2k`;
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();

        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
          zoom: 13,
        });

        const geocoder = new google.maps.Geocoder();
        console.log("Localisation de l'événement:", location);

        geocoder.geocode({ address: location }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const coordinates = results[0].geometry.location;
            const marker = new google.maps.Marker({
              map,
              position: coordinates,
              title: title || "Événement",
              animation: google.maps.Animation.BOUNCE,
            });

            // Arrêter l'animation après 3 secondes
            setTimeout(() => {
              marker.setAnimation(null);
            }, 5000);

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="width:200px; text-align:center;">
                  <p><strong>${title || "Événement"}</strong></p>
                  <p>${location}</p>
                </div>
              `,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });

            map.setZoom(15);
            map.setCenter(coordinates);
          } else {
            console.error("Erreur de géocodage:", status);
          }
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la carte:", error);
      }
    };

    initMap();
  }, [location, title]);

  return (
    <div
      id="map"
      ref={mapRef}
      style={{
        width: "100%",
        height: "200px",
        borderRadius: "10px",
      }}
    />
  );
}
