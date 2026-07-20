"use client";

import { useEffect, useState } from "react";

type GoogleMapsLibrary = "marker" | "places";
type CallbackWindow = typeof window & {
  __getEventGoogleMapsReady?: () => void;
};

const SCRIPT_ID = "getevent-google-maps";
const REQUIRED_LIBRARIES: GoogleMapsLibrary[] = ["places", "marker"];
const LOAD_TIMEOUT_MS = 15_000;

let googleMapsPromise: Promise<void> | null = null;

export const getGoogleMapId = () =>
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_GOOGLE_MAP_ID) ||
  "DEMO_MAP_ID";

const isGoogleMapsReady = () =>
  Boolean(
    window.google?.maps?.Map &&
    window.google?.maps?.places?.Autocomplete &&
    window.google?.maps?.marker?.AdvancedMarkerElement,
  );

export function loadGoogleMapsApi(
  libraries: GoogleMapsLibrary[] = REQUIRED_LIBRARIES,
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (isGoogleMapsReady()) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY n'est pas configurée."),
    );
  }

  const requestedLibraries = Array.from(
    new Set([...REQUIRED_LIBRARIES, ...libraries]),
  ).sort();

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    const callbackWindow = window as CallbackWindow;
    let timeoutId: number | undefined;

    const cleanup = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      delete callbackWindow.__getEventGoogleMapsReady;
    };

    const succeed = () => {
      if (!isGoogleMapsReady()) {
        googleMapsPromise = null;
        cleanup();
        reject(
          new Error("Google Maps est chargé sans les bibliothèques requises."),
        );
        return;
      }

      cleanup();
      resolve();
    };

    const fail = () => {
      googleMapsPromise = null;
      cleanup();
      reject(new Error("Impossible de charger Google Maps JavaScript API."));
    };

    callbackWindow.__getEventGoogleMapsReady = succeed;
    timeoutId = window.setTimeout(fail, LOAD_TIMEOUT_MS);

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", succeed, { once: true });
      existingScript.addEventListener("error", fail, { once: true });
      return;
    }

    const params = new URLSearchParams({
      key: apiKey,
      libraries: requestedLibraries.join(","),
      v: "weekly",
      loading: "async",
      callback: "__getEventGoogleMapsReady",
    });
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.addEventListener("error", fail, { once: true });
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function useGoogleMaps(
  libraries: GoogleMapsLibrary[] = REQUIRED_LIBRARIES,
): boolean {
  const [ready, setReady] = useState(
    () => typeof window !== "undefined" && isGoogleMapsReady(),
  );
  const librariesKey = [...libraries].sort().join(",");

  useEffect(() => {
    let active = true;
    const requestedLibraries = librariesKey
      .split(",")
      .filter(Boolean) as GoogleMapsLibrary[];

    void loadGoogleMapsApi(requestedLibraries)
      .then(() => {
        if (active) setReady(true);
      })
      .catch((error) => {
        if (active) {
          setReady(false);
          console.error(error);
        }
      });

    return () => {
      active = false;
    };
  }, [librariesKey]);

  return ready;
}
