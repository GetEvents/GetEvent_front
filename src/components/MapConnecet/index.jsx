import Script from "next/script";
import styles from "./style.module.scss";

const MapComponent = () => {
  return (
    <>
      {/* <Script src="/js/autocomplet.js" strategy="afterInteractive" /> */}

      <Script
        src="https://unpkg.com/leaflet/dist/leaflet.js"
        strategy="afterInteractive"
      />
      <Script src="/js/map_details.js" strategy="afterInteractive" />
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="afterInteractive"
      />
      <Script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB7F40ScgF_mzivb6E4itBxANpz3qdju2k&callback=initMap&v=weekly&libraries=marker" />

      {/* Votre composant de carte ici */}
      <div id="map" style={{ height: "500px" }} className={styles.map}></div>
    </>
  );
};

export default MapComponent;
