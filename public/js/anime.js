(function () {
  "use strict";

  function hideAfterDelay(selector, delay) {
    var element = document.querySelector(selector);
    if (!element) return;

    window.setTimeout(function () {
      element.style.display = "none";
    }, delay);
  }

  function initializeDropdowns() {
    document.querySelectorAll(".titre").forEach(function (button) {
      button.addEventListener("click", function () {
        var currentDropdown = button.parentElement;
        if (!currentDropdown) return;

        document.querySelectorAll(".sous-faq").forEach(function (dropdown) {
          if (dropdown !== currentDropdown) {
            dropdown.classList.remove("open");
          }
        });

        currentDropdown.classList.toggle("open");
      });
    });

    document.querySelectorAll(".dropdownp_btn").forEach(function (button) {
      button.addEventListener("click", function () {
        var currentDropdown = button.parentElement;
        var chevron = button.querySelector(".chevron");
        if (!currentDropdown) return;

        document.querySelectorAll(".dropdownp").forEach(function (dropdown) {
          if (dropdown !== currentDropdown) {
            dropdown.classList.remove("open");
          }
        });

        currentDropdown.classList.toggle("open");
        chevron?.classList.toggle("retate");
      });
    });
  }

  function initialize() {
    hideAfterDelay("#message", 10000);
    hideAfterDelay("#succes", 10000);
    initializeDropdowns();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  window.toggleVisibility = function toggleVisibility() {
    var paragraph = document.getElementById("paragraphe");
    var toggleContainer = document.getElementById("cacher");
    if (!paragraph || !toggleContainer) return;

    paragraph.classList.toggle("nothidden");
    paragraph.classList.toggle("hidden");
    toggleContainer.textContent = paragraph.classList.contains("hidden")
      ? "Voir tout"
      : "Voir moins";
  };
})();
