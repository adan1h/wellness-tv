function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}
document.addEventListener("DOMContentLoaded", function () {
  var dark = document.getElementById("heroBadge");
  if (dark && dark.textContent === "DARK") {
    setText("heroSub", "No live window this hour. The week still runs below.");
    setText("heroTitle", "DARK · IN THE BAY");
  }
  var today = document.getElementById("credits");
  if (today && today.querySelector(".cr-empty")) {
    today.querySelector(".cr-empty").textContent = "No weekly session left today. Open COMING UP.";
  }
  var soon = document.getElementById("soon");
  if (soon && soon.querySelector(".soon-row") && !soon.querySelector(".soon-day")) {
    soon.querySelector(".soon-row").textContent = "The rest of this week is still locking.";
  }
});
