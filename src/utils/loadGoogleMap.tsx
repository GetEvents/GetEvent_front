let isScriptLoaded = false;
let callbacks: Array<() => void> = [];

export function loadGoogleMapsScript(callback: () => void) {
  if (typeof window === "undefined") return;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return;

  // Si déjà chargé, exécute immédiatement
  if (isScriptLoaded && window.google) {
    callback();
    return;
  }

  // Si le script est en cours de chargement, empile la callback
  if (document.getElementById("google-maps-script")) {
    callbacks.push(callback);
    return;
  }

  // Sinon, charge le script
  callbacks.push(callback);
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.id = "google-maps-script";
  script.async = true;
  script.defer = true;
  script.onload = () => {
    isScriptLoaded = true;
    callbacks.forEach((cb) => cb());
    callbacks = [];
  };
  document.head.appendChild(script);
}
