// map.js

// Initialiser la carte Google Maps et définir les vues par défaut
var map;
var pathname = window.location.pathname; // "/event_detail/5"

// Extraire l'ID en supposant que l'ID est le dernier segment de l'URL
var segments = pathname.split("/"); // ["", "event_detail", "5"]
var eventId = segments[segments.length - 1]; // "5"

// Convertir en entier si nécessaire
eventId = parseInt(eventId);

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
    zoom: 13,
  });

  // Appeler la fonction pour récupérer les données au chargement de la page
  fetchEvents();
}

// Fonction pour récupérer les données depuis l'API
function fetchEvents() {
  fetch(
    `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/event/getEventById?id=${eventId}`,
  )
    .then((response) => response.json())
    .then((data) => {
      displayEvents(data.data); // Passe les données à une fonction pour les afficher
    })
    .catch((error) => console.error("Erreur:", error));
}

// Fonction pour géocoder une adresse avec Google Maps Geocoding API et ajouter un marqueur
function geocodeAddress(address, popupText, titre) {
  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: address }, function (results, status) {
    if (status === "OK") {
      var location = results[0].geometry.location;
      var marker = new google.maps.Marker({
        title: titre,
        map: map,
        position: location,
        animation: google.maps.Animation.BOUNCE, // Animation de rebond
        //   icon: {
        //       url: "URL_DE_VOTRE_IMAGE", // Remplacez ceci par l'URL de votre image
        //       scaledSize: new google.maps.Size(50, 50) // Taille personnalisée
        //   }
      });

      var infowindow = new google.maps.InfoWindow({
        content:
          "<div style='width:200px; text-align:center;  font-weight: 400;'>" +
          "<p>" +
          "Lieu de l'évènement " +
          "</p>" +
          "<p>" +
          popupText +
          "</p>" +
          "</div>",
      });

      marker.addListener("click", function () {
        infowindow.open(map, marker);
      });

      marker.addListener("click", function () {
        infowindow.open(map, marker);
      });
      // Zoomer sur la position de l'utilisateur
      map.setZoom(15);
      map.setCenter(location);
    } else {
      console.error("Erreur lors du géocodage : " + status);
    }
  });
}

// Fonction pour afficher les événements sur la carte
function displayEvents(event) {
  // evenes.forEach(event => {
  geocodeAddress(
    event.location,
    `<br>${event.location}`,
    `<b>${event.name}</b>`,
  );
  //   });
}

// Charger la carte après le chargement de la page
document.addEventListener("DOMContentLoaded", initMap);
