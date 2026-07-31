// Toggles the mobile nav menu open/closed. Same script is included on
// every page since every page has the same navbar markup.
document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("navMobile");

  if (!toggleButton || !mobileMenu) return;

  toggleButton.addEventListener("click", function () {
    mobileMenu.classList.toggle("open");
  });

  // Clicking a link closes the menu, so it doesn't stay open after navigating.
  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenu.classList.remove("open");
    });
  });
});
