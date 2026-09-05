function isWeekly(ev) {
  var rule = String(ev.rule || "").toLowerCase();
  return /every\s+(mon|tue|wed|thu|fri|sat|sun)/.test(rule) || (/weekly/.test(rule) && !/monthly/.test(rule));
}
function paintCatalog() {
  var week = document.getElementById("catalogWeek");
  var occ = document.getElementById("catalogOcc");
  if (!week || !window.SEED) return;
  var events = window.SEED.events || [];
  week.innerHTML = "";
  events.filter(isWeekly).forEach(function (ev) {
    var div = document.createElement("div");
    div.className = "item";
    div.innerHTML = "<span></span>";
    div.querySelector("span").textContent = ev.day + " " + ev.time + " · " + ev.name;
    week.appendChild(div);
  });
  if (occ) {
    occ.innerHTML = "";
    var list = events.filter(function (ev) {
      return !isWeekly(ev) && window.eventThisWeek && window.eventThisWeek(ev);
    });
    if (!list.length) {
      occ.innerHTML = "<p class='note'>No occasional session locked to this week.</p>";
      return;
    }
    list.forEach(function (ev) {
      var div = document.createElement("div");
      div.className = "item";
      div.innerHTML = "<span></span>";
      div.querySelector("span").textContent = ev.day + " " + ev.time + " · " + ev.name;
      occ.appendChild(div);
    });
  }
}
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(paintCatalog, 0);
});
