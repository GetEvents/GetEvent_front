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
