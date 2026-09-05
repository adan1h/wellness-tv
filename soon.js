function allEvents() {
  var extra = [];
  try { extra = JSON.parse(localStorage.getItem("wtv-published-v1") || "[]"); } catch (e) {}
  return extra.concat((window.SEED && window.SEED.events) || []).filter(function (ev) {
    return window.eventThisWeek ? window.eventThisWeek(ev) : false;
  });
}
function evDayName(ev) {
  var d = String(ev.day || "").toLowerCase();
  if (d.indexOf("mon") === 0) return "Monday";
  if (d.indexOf("tue") === 0) return "Tuesday";
  if (d.indexOf("wed") === 0) return "Wednesday";
  if (d.indexOf("thu") === 0) return "Thursday";
  if (d.indexOf("fri") === 0) return "Friday";
  if (d.indexOf("sat") === 0) return "Saturday";
  if (d.indexOf("sun") === 0) return "Sunday";
  return "";
}
function daysLeftThisWeek() {
  var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var d = new Date().getDay();
  var out = [];
  for (var i = d + 1; i <= 6; i++) out.push(names[i]);
  return out;
}
function loadLikesSoon() {
  try { return JSON.parse(localStorage.getItem("wtv-likes-v1") || "{}"); }
  catch (e) { return {}; }
}
function saveLikesSoon(map) { localStorage.setItem("wtv-likes-v1", JSON.stringify(map)); }
function makeSessionRow(ev, likes) {
  var row = document.createElement("div");
  row.className = "cr";
  row.innerHTML = "<b></b><div class=\"cr-body\"><strong></strong><em></em><i></i></div><button class=\"like\" type=\"button\"></button>";
  row.querySelector("b").textContent = ev.time || "";
  row.querySelector("strong").textContent = ev.name;
  row.querySelector("em").textContent = ev.venue || ev.city || "";
  row.querySelector("i").textContent = ev.price || "Free";
  var btn = row.querySelector(".like");
  var on = !!likes[ev.id];
  btn.textContent = on ? "\u2665" : "\u2661";
  if (on) btn.classList.add("on");
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    likes[ev.id] = !likes[ev.id];
    saveLikesSoon(likes);
    btn.classList.toggle("on", likes[ev.id]);
    btn.textContent = likes[ev.id] ? "\u2665" : "\u2661";
    if (likes[ev.id] && typeof armAlarm === "function") armAlarm(ev);
  });
  row.addEventListener("click", function () {
    var sheet = document.getElementById("sheet");
    if (!sheet) return;
    document.getElementById("sName").textContent = ev.name;
    document.getElementById("sWhen").textContent = (ev.rule || ev.day) + " · " + ev.time;
    document.getElementById("sWhere").textContent = (ev.venue || "") + " · " + (ev.address || ev.city || "");
    document.getElementById("sPrice").textContent = (ev.price || "Free") + " · " + (ev.capacity || "");
    document.getElementById("sLink").href = ev.instagram || "#";
    sheet.classList.add("open");
  });
  return row;
}
function paintSoon() {
  var root = document.getElementById("soon");
  if (!root) return;
  var events = allEvents();
  var likes = loadLikesSoon();
  var days = daysLeftThisWeek();
  root.innerHTML = "<h3>COMING UP</h3>";
  var shown = 0;
  days.forEach(function (day) {
    var list = events.filter(function (ev) { return evDayName(ev) === day; });
    if (!list.length) return;
    shown += 1;
    var wrap = document.createElement("details");
    wrap.className = "soon-day";
    var sum = document.createElement("summary");
    sum.textContent = day.toUpperCase() + " · " + list.length;
    wrap.appendChild(sum);
    var box = document.createElement("div");
    box.className = "log soon-log";
    list.forEach(function (ev) { box.appendChild(makeSessionRow(ev, likes)); });
    wrap.appendChild(box);
    root.appendChild(wrap);
  });
  if (!shown) {
    var empty = document.createElement("p");
    empty.className = "soon-row";
    empty.textContent = "Week is closed after today.";
    root.appendChild(empty);
  }
}
document.addEventListener("DOMContentLoaded", paintSoon);
