import Script from "next/script";
import React from "react";

export function initMenuToggle() {
  <Script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB7F40ScgF_mzivb6E4itBxANpz3qdju2k&libraries=places" />;

  const btnLayout = document.getElementById("btnlayout");
  const menuLeft = document.getElementById("menu_left");
  console.log(btnLayout, menuLeft);

  if (btnLayout && menuLeft) {
    btnLayout.addEventListener("click", () => {
      const detEvents = document.querySelectorAll("#detevent");

      menuLeft.classList.toggle("menu_left_width");

      detEvents.forEach((detEvent) => {
        detEvent.classList.toggle("cachspan");
      });

      console.log("Bouton cliqué et classes togglées", detEvents);
    });
  }
}
