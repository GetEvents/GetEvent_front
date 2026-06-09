var mess = document.querySelector("#message");
var suc = document.querySelector("#succes");

setTimeout(() => {
  suc.style.display = "none";
}, 10000);

setTimeout(() => {
  mess.style.display = "none";
}, 10000);

document.addEventListener("DOMContentLoaded", function () {
  console.log("BONJOUR");

  let dropdownBtns = document.querySelectorAll(".dropdownp_btn");
  let faqbnt = document.querySelectorAll(".titre");
  console.log("les drop ", dropdownBtns);

  (faqbnt.forEach(function (btnf) {
    btnf.addEventListener("click", function () {
      let parentDropdown = this.parentElement;
      let faqaffiches = document.querySelectorAll(".sous-faq");
      faqaffiches.forEach(function (faqaffiche) {
        if (faqaffiche != parentDropdown) {
          faqaffiche.classList.remove("open");
        }
      });
      parentDropdown.classList.toggle("open");
    });
  }),
    dropdownBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        let parentDropdown = this.parentElement;
        let dropdowns = document.querySelectorAll(".dropdownp");
        let parentDropdownt = this.firstElementChild.lastElementChild;
        let retote = document.querySelectorAll(".chevron");

        // Fermer les autres dropdowns
        dropdowns.forEach(function (dropdown) {
          if (dropdown !== parentDropdown) {
            dropdown.classList.remove("open");
          }
        });
        retote.forEach(function (retotes) {
          if (retotes !== parentDropdownt) {
            retotes.classList.toggle("retateh");
          }
        });

        // Toggle la classe "open" sur le dropdown actuel
        parentDropdown.classList.toggle("open");
        parentDropdownt.classList.toggle("retate");
      });
    }));
});
window.toggleVisibility = function toggleVisibility() {
  var paragraphe = document.getElementById("paragraphe");
  var cacher = document.getElementById("cacher");
  console.log("uv");
  paragraphe.classList.toggle("nothidden");
  paragraphe.classList.toggle("hidden");
  if (paragraphe.classList.contains("hidden")) {
    cacher.innerHTML = "<a href='#' onclick='toggleVisibility()'>Voir moin</a>";
  } else {
    cacher.innerHTML = "<a href='#' onclick='toggleVisibility()'>Voir tout</a>";
  }
};
