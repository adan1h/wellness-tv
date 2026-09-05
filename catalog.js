function isWeekly(ev) {
  var rule = String(ev.rule || "").toLowerCase();
  return /every\s+(mon|tue|wed|thu|fri|sat|sun)/.test(rule) || (/weekly/.test(rule) && !/monthly/.test(rule));
}
function paintCatalog() {
  var week = document.getElementById("catalogWeek");
  var occ = document.getElementById("catalogOcc");
  if (!week || !window.SEED) return;
  var events = window.SEED.events || [];
  var off = window.offIdsThisWeek ? window.offIdsThisWeek() : [];
  week.innerHTML = "";
  events.filter(isWeekly).forEach(function (ev) {
    var div = document.createElement("div");
    div.className = "item";
    var span = document.createElement("span");
    var dark = off.indexOf(ev.id) >= 0;
    span.textContent = (dark ? "OFF · " : "") + ev.day + " " + ev.time + " · " + ev.name;
    var btn = document.createElement("button");
    btn.className = "del";
    btn.textContent = dark ? "Restore" : "Off this week";
    btn.onclick = function () {
      window.setOffThisWeek(ev.id, !dark);
      paintCatalog();
    };
    div.appendChild(span);
    div.appendChild(btn);
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
      var span = document.createElement("span");
      span.textContent = ev.day + " " + ev.time + " · " + ev.name;
      var btn = document.createElement("button");
      btn.className = "del";
      btn.textContent = "Off this week";
      btn.onclick = function () {
        window.setOffThisWeek(ev.id, true);
        paintCatalog();
      };
      div.appendChild(span);
      div.appendChild(btn);
      occ.appendChild(div);
    });
  }
}
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(paintCatalog, 0);
});
