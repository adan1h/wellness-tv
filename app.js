const LIKES_KEY = "wtv-likes-v1";
var DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Weekend"];
var mapRef = null;
var markers = {};
function dayKey(ev) {
  var d = (ev.day || "").toLowerCase();
  if (d.indexOf("mon") === 0) return "Monday";
  if (d.indexOf("tue") === 0) return "Tuesday";
  if (d.indexOf("wed") === 0) return "Wednesday";
  if (d.indexOf("thu") === 0 && d.indexOf("sun") === -1) return "Thursday";
  if (d.indexOf("fri") === 0) return "Friday";
  if (d.indexOf("sat") === 0) return "Saturday";
  if (d.indexOf("sun") === 0) return "Sunday";
  return "Weekend";
}
function todayName() {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}
function timeSort(a, b) { return String(a.time || "").localeCompare(String(b.time || "")); }
function loadLikes() {
  try { return JSON.parse(localStorage.getItem(LIKES_KEY) || "{}"); }
  catch { return {}; }
}
function saveLikes(map) { localStorage.setItem(LIKES_KEY, JSON.stringify(map)); }
function heart(on) { return on ? "\u2665" : "\u2661"; }
function bindImg(img) { img.addEventListener("error", function () { img.style.opacity = "0.15"; }); }
function emptyBox(text) {
  var p = document.createElement("p");
  p.className = "empty";
  p.textContent = text;
  return p;
}
function selectCard(id) {
  document.querySelectorAll(".card").forEach(function (c) {
    c.classList.toggle("sel", c.getAttribute("data-id") === id);
  });
  var m = markers[id];
  if (mapRef && m) {
    mapRef.setView(m.getLatLng(), 13);
    m.openPopup();
  }
}
function makeCard(ev, likes, openSheet) {
  var el = document.createElement("article");
  el.className = "card";
  el.setAttribute("data-id", ev.id);
  var on = !!likes[ev.id];
  el.innerHTML = "<img alt=\"\" /><div><h4></h4><div class=\"meta\"></div><div class=\"price\"></div></div><button class=\"like\" type=\"button\"></button>";
  var img = el.querySelector("img");
  img.src = ev.image; bindImg(img);
  el.querySelector("h4").textContent = ev.name;
  el.querySelector(".meta").textContent = ev.time + " \u00b7 " + ev.city;
  el.querySelector(".price").textContent = ev.price + " \u00b7 " + ev.capacity;
  var btn = el.querySelector(".like");
  if (on) btn.classList.add("on");
  btn.textContent = heart(on);
  el.addEventListener("click", function () {
    selectCard(ev.id);
    openSheet(ev);
  });
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    likes[ev.id] = !likes[ev.id];
    saveLikes(likes);
    btn.classList.toggle("on", likes[ev.id]);
    btn.textContent = heart(!!likes[ev.id]);
  });
  return el;
}
function main() {
  var data = JSON.parse(JSON.stringify(window.SEED));
  var extra = [];
  try { extra = JSON.parse(localStorage.getItem("wtv-published-v1") || "[]"); } catch (e) { extra = []; }
  data.events = extra.concat(data.events);
  var likes = loadLikes();
  var today = todayName();
  var heroImg = document.getElementById("heroImg");
  heroImg.src = data.replay.image;
  bindImg(heroImg);
  document.getElementById("heroTitle").textContent = data.replay.title;
  document.getElementById("heroSub").textContent = data.replay.subtitle;

  var wallSec = document.getElementById("wallSection");
  var wall = document.getElementById("wall");
  wall.innerHTML = "";
  if (!data.wall.length) {
    wallSec.classList.add("hidden");
  } else {
    data.wall.forEach(function (w) {
      var fig = document.createElement("figure");
      var img = document.createElement("img");
      img.src = w.image; img.alt = w.label; bindImg(img);
      var cap = document.createElement("figcaption");
      cap.textContent = w.label;
      fig.appendChild(img); fig.appendChild(cap); wall.appendChild(fig);
    });
  }

  var feed = document.getElementById("feed");
  var chips = document.getElementById("chips");
  feed.innerHTML = "";
  chips.innerHTML = "";
  var sheet = document.getElementById("sheet");
  function openSheet(ev) {
    document.getElementById("sName").textContent = ev.name;
    document.getElementById("sWhen").textContent = ev.rule + " \u00b7 " + ev.day + " " + ev.time;
    document.getElementById("sWhere").textContent = ev.venue + " \u00b7 " + ev.address;
    document.getElementById("sPrice").textContent = ev.price + " \u00b7 " + ev.capacity;
    document.getElementById("sLink").href = ev.instagram;
    sheet.classList.add("open");
  }
  document.getElementById("closeSheet").onclick = function () { sheet.classList.remove("open"); };
  sheet.onclick = function (e) { if (e.target === sheet) sheet.classList.remove("open"); };

  if (!data.events.length) {
    feed.appendChild(emptyBox("The board is locked until sessions are confirmed."));
  } else {
    var groups = {};
    data.events.forEach(function (ev) {
      var k = dayKey(ev);
      if (!groups[k]) groups[k] = [];
      groups[k].push(ev);
    });
    DAY_ORDER.forEach(function (day) {
      var list = groups[day];
      if (!list || !list.length) return;
      list.sort(timeSort);
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (day === today ? " on" : "");
      chip.textContent = day === today ? "TODAY" : day.slice(0, 3).toUpperCase();
      chip.addEventListener("click", function () {
        document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("on"); });
        chip.classList.add("on");
        var rail = document.getElementById("day-" + day);
        if (rail) rail.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      chips.appendChild(chip);
      var h = document.createElement("div");
      h.className = "day-rail" + (day === today ? " today" : "");
      h.id = "day-" + day;
      h.textContent = (day === today ? "TODAY · " : "") + day.toUpperCase();
      feed.appendChild(h);
      list.forEach(function (ev) { feed.appendChild(makeCard(ev, likes, openSheet)); });
    });
    var todaySessions = (groups[today] || []).length;
    var pill = document.getElementById("livePill");
    if (todaySessions) {
      pill.textContent = todaySessions + " TODAY";
      pill.classList.add("hot");
    }
  }

  var galSec = document.getElementById("gallerySection");
  var gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  if (!data.gallery.length) galSec.classList.add("hidden");
  else {
    data.gallery.forEach(function (src) {
      var img = document.createElement("img");
      img.src = src; img.alt = ""; bindImg(img); gallery.appendChild(img);
    });
  }

  var mapEl = document.getElementById("map");
  if (window.L) {
    mapRef = L.map(mapEl, { scrollWheelZoom: false }).setView([27.85, -82.58], 10);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 19
    }).addTo(mapRef);
    data.events.forEach(function (ev) {
      if (!ev.lat) return;
      var mk = L.circleMarker([ev.lat, ev.lng], {
        radius: 8, color: "#c9a84c", fillColor: "#c9a84c", fillOpacity: 0.9, weight: 1
      }).addTo(mapRef).bindPopup("<strong>" + ev.name + "</strong><br>" + ev.day + " " + ev.time);
      mk.on("click", function () { selectCard(ev.id); });
      markers[ev.id] = mk;
    });
    setTimeout(function () { mapRef.invalidateSize(); }, 200);
  } else {
    mapEl.textContent = "Map loads online.";
  }
}
document.addEventListener("DOMContentLoaded", main);
