// Correcting the variable name for clarity
const btnLayout = document.getElementById("btnlayout");
const menulef = document.getElementById("menu_left");

btnLayout.addEventListener("click", () => {
  // Uncomment the line below if you want to prevent any default behavior
  // event.preventDefault();

  // Selecting elements correctly. Use forEach to iterate over NodeList.
  const detEvents = document.querySelectorAll("#detevent");

  menulef.classList.toggle("menu_left_width");

  // Loop through each selected element and toggle the class
  detEvents.forEach((detEvent) => {
    detEvent.classList.toggle("cachspan");
  });
});

// linens.forEach((link) => {
//     link.addEventListener("click", (event) => {
//         event.preventDefault(); // Empêche le chargement de la page
//     });
// });
