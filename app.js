const LIKES_KEY = "wtv-likes-v1";
var DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Weekend"];
var mapRef = null;
var markers = {};
var state = { day: null, groups: {}, likes: {}, openSheet: null };
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
function parseMinutes(t) {
  var m = String(t || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  var h = parseInt(m[1], 10);
  var min = parseInt(m[2], 10);
  var ap = (m[3] || "").toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}
function sessionMark(ev, isToday) {
  if (!isToday) return "";
  var start = parseMinutes(ev.time);
  if (start == null) return "";
  var now = new Date();
  var cur = now.getHours() * 60 + now.getMinutes();
  var end = start + 90;
  if (cur >= start && cur < end) return "NOW";
  if (cur < start) return "NEXT";
  return "PAST";
}
function timeSort(a, b) { return String(a.time || "").localeCompare(String(b.time || "")); }
function loadLikes() {
  try { return JSON.parse(localStorage.getItem(LIKES_KEY) || "{}"); }
  catch { return {}; }
}
function saveLikes(map) { localStorage.setItem(LIKES_KEY, JSON.stringify(map)); }
function heart(on) { return on ? "\u2665" : "\u2661"; }
function bindImg(img) { img.addEventListener("error", function () { img.style.opacity = "0.2"; }); }
function firstLiveUrl(bc) {
  if (!bc || !bc.windows) return bc && bc.replayUrl ? bc.replayUrl : "";
  for (var i = 0; i < bc.windows.length; i++) {
    if (bc.windows[i].url) return bc.windows[i].url;
  }
  return bc.replayUrl || "";
}
function selectCard(id) {
  document.querySelectorAll(".card").forEach(function (c) {
    c.style.opacity = c.getAttribute("data-id") === id ? "1" : ".65";
  });
  var m = markers[id];
  if (mapRef && m) { mapRef.setView(m.getLatLng(), 13); m.openPopup(); }
}
function makeCard(ev, likes, openSheet, isToday) {
  var el = document.createElement("article");
  el.className = "card";
  el.setAttribute("data-id", ev.id);
  var mark = sessionMark(ev, isToday);
  var on = !!likes[ev.id];
  el.innerHTML = "<img alt=\"\" /><div><h4></h4><div class=\"meta\"></div><div class=\"price\"></div></div><button class=\"like\" type=\"button\"></button>";
  var img = el.querySelector("img");
  img.src = ev.image; bindImg(img);
  el.querySelector("h4").textContent = ev.name;
  el.querySelector(".meta").textContent = (mark ? mark + " · " : "") + ev.time + " · " + ev.city;
  el.querySelector(".price").textContent = ev.price + " · " + ev.capacity;
  if (mark === "NOW") el.classList.add("now");
  if (mark === "PAST") el.classList.add("past");
  var btn = el.querySelector(".like");
  if (on) btn.classList.add("on");
  btn.textContent = heart(on);
  el.addEventListener("click", function () { selectCard(ev.id); openSheet(ev); });
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    likes[ev.id] = !likes[ev.id];
    saveLikes(likes);
    btn.classList.toggle("on", likes[ev.id]);
    btn.textContent = heart(!!likes[ev.id]);
  });
  return el;
}
function renderGuide(day) {
  state.day = day;
  var feed = document.getElementById("feed");
  var title = document.getElementById("guideTitle");
  var isToday = day === todayName();
  feed.innerHTML = "";
  title.textContent = isToday ? "TODAY" : day.toUpperCase();
  document.querySelectorAll(".chip").forEach(function (c) {
    c.classList.toggle("on", c.getAttribute("data-day") === day);
  });
  var list = (state.groups[day] || []).slice().sort(timeSort);
  if (!list.length) {
    var p = document.createElement("p");
    p.className = "meta";
    p.textContent = "Dark on this day.";
    feed.appendChild(p);
    return;
  }
  list.forEach(function (ev) { feed.appendChild(makeCard(ev, state.likes, state.openSheet, isToday)); });
}
function fillStrip(data) {
  var strip = document.getElementById("strip");
  strip.innerHTML = "";
  var clips = data.wall && data.wall.length ? data.wall : [
    { label: "16:9" }, { label: "9:16" }, { label: "X" }
  ];
  clips.forEach(function (item) {
    var cell = document.createElement("div");
    cell.className = "cell";
    if (item.image) {
      var img = document.createElement("img");
      img.src = item.image; img.alt = item.label || ""; bindImg(img);
      cell.appendChild(img);
    } else {
      var s = document.createElement("span");
      s.textContent = (item.label || "CLIP") + " · after first shoot";
      cell.appendChild(s);
    }
    strip.appendChild(cell);
  });
}
function main() {
  var data = JSON.parse(JSON.stringify(window.SEED));
  var extra = [];
  try { extra = JSON.parse(localStorage.getItem("wtv-published-v1") || "[]"); } catch (e) { extra = []; }
  data.events = extra.concat(data.events);
  state.likes = loadLikes();
  var today = todayName();
  var todayList = data.events.filter(function (ev) { return dayKey(ev) === today; }).sort(timeSort);
  var bc = window.BROADCAST || { status: "idle", windows: [] };
  var override = null;
  try { override = JSON.parse(localStorage.getItem("wtv-broadcast-v1") || "null"); } catch (e) { override = null; }
  if (override && override.status) bc = override;

  var liveN = 0, nextN = 0, pastN = 0;
  todayList.forEach(function (ev) {
    var mk = sessionMark(ev, true);
    if (mk === "NOW") liveN += 1;
    else if (mk === "NEXT") nextN += 1;
    else if (mk === "PAST") pastN += 1;
  });
  var scene = document.getElementById("scene");
  if (scene) {
    if (liveN) scene.textContent = liveN + " ON THE FLOOR NOW · " + nextN + " STILL AHEAD";
    else if (nextN) scene.textContent = nextN + " STILL AHEAD TODAY · " + pastN + " ALREADY RAN";
    else if (pastN) scene.textContent = "BOARD CLOSED FOR TODAY · " + pastN + " SESSIONS RAN";
    else scene.textContent = "DARK TONIGHT";
  }

  document.getElementById("epTag").textContent = "EPISODE · " + today.toUpperCase();
  var badge = document.getElementById("heroBadge");
  var title = document.getElementById("heroTitle");
  var sub = document.getElementById("heroSub");
  title.textContent = today.toUpperCase() + " IN THE BAY";
  if (liveN && bc.status !== "live") {
    badge.textContent = "ON THE FLOOR";
    badge.className = "badge live";
    sub.textContent = "A session is in the city right now. We send you to the crew page.";
  } else if (bc.status === "live") {
    badge.textContent = "ON AIR";
    badge.className = "badge live";
    title.textContent = bc.title || title.textContent;
    sub.textContent = "Same window on YouTube, Kick, X or TikTok.";
  } else if (bc.status === "next") {
    badge.textContent = "NEXT LIVE";
    badge.className = "badge next";
    title.textContent = bc.title || title.textContent;
    sub.textContent = bc.note || "Links drop when the encoder goes live.";
  } else {
    badge.textContent = bc.status === "replay" ? "REPLAY · SIM" : "REPLAY";
    badge.className = "badge";
    title.textContent = bc.title || title.textContent;
    sub.textContent = bc.note || "The board follows Tampa Bay time.";
  }
  var heroImg = document.getElementById("heroImg");
  heroImg.src = data.replay.image;
  bindImg(heroImg);
  document.getElementById("playBtn").onclick = function () {
    var url = firstLiveUrl(bc);
    if (url) window.open(url, "_blank", "noopener");
    else if (bc.eventId) selectCard(bc.eventId);
  };
  fillStrip(data);

  var watch = document.getElementById("watch");
  watch.innerHTML = "";
  bc.windows.forEach(function (w) {
    var a = document.createElement(w.url ? "a" : "span");
    a.className = "win" + (w.url ? " go" : "");
    a.textContent = w.platform + " · " + w.aspect;
    if (w.url) { a.href = w.url; a.target = "_blank"; a.rel = "noopener"; }
    watch.appendChild(a);
  });

  var stillsSec = document.getElementById("stillsSection");
  var stills = document.getElementById("stills");
  stills.innerHTML = "";
  if (data.gallery && data.gallery.length) {
    stillsSec.classList.remove("hidden");
    data.gallery.forEach(function (src) {
      var img = document.createElement("img");
      img.src = src; img.alt = "Session still"; bindImg(img);
      stills.appendChild(img);
    });
  } else stillsSec.classList.add("hidden");

  var credits = document.getElementById("credits");
  credits.innerHTML = "<h4>TODAY</h4>";
  if (!todayList.length) {
    var empty = document.createElement("div");
    empty.className = "cr";
    empty.innerHTML = "<b>—</b><span>Dark tonight</span>";
    credits.appendChild(empty);
  }
  todayList.forEach(function (ev) {
    var row = document.createElement("div");
    row.className = "cr";
    var mk = sessionMark(ev, true);
    row.innerHTML = "<b></b><span></span>";
    row.querySelector("b").textContent = ev.time.replace(" ", "");
    row.querySelector("span").textContent = (mk ? mk + " · " : "") + ev.name;
    row.addEventListener("click", function () { selectCard(ev.id); });
    credits.appendChild(row);
  });

  var chips = document.getElementById("chips");
  chips.innerHTML = "";
  var sheet = document.getElementById("sheet");
  state.openSheet = function (ev) {
    document.getElementById("sName").textContent = ev.name;
    document.getElementById("sWhen").textContent = ev.rule + " · " + ev.day + " " + ev.time;
    document.getElementById("sWhere").textContent = ev.venue + " · " + ev.address;
    document.getElementById("sPrice").textContent = ev.price + " · " + ev.capacity;
    document.getElementById("sLink").href = ev.instagram;
    sheet.classList.add("open");
  };
  document.getElementById("closeSheet").onclick = function () { sheet.classList.remove("open"); };
  sheet.onclick = function (e) { if (e.target === sheet) sheet.classList.remove("open"); };

  state.groups = {};
  data.events.forEach(function (ev) {
    var k = dayKey(ev);
    if (!state.groups[k]) state.groups[k] = [];
    state.groups[k].push(ev);
  });
  DAY_ORDER.forEach(function (day) {
    if (!state.groups[day] || !state.groups[day].length) return;
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.setAttribute("data-day", day);
    chip.textContent = day === today ? "TODAY" : day.slice(0, 3).toUpperCase();
    chip.addEventListener("click", function () { renderGuide(day); });
    chips.appendChild(chip);
  });
  renderGuide(state.groups[today] ? today : DAY_ORDER.filter(function (d) { return state.groups[d]; })[0]);

  var mapEl = document.getElementById("map");
  if (window.L) {
    mapRef = L.map(mapEl, { scrollWheelZoom: false }).setView([27.85, -82.58], 10);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 19
    }).addTo(mapRef);
    data.events.forEach(function (ev) {
      if (!ev.lat) return;
      var mk = L.circleMarker([ev.lat, ev.lng], {
        radius: 7, color: "#d4b36a", fillColor: "#d4b36a", fillOpacity: .9, weight: 1
      }).addTo(mapRef).bindPopup("<strong>" + ev.name + "</strong><br>" + ev.day + " " + ev.time);
      mk.on("click", function () { selectCard(ev.id); });
      markers[ev.id] = mk;
    });
    setTimeout(function () { mapRef.invalidateSize(); }, 250);
  }
}
document.addEventListener("DOMContentLoaded", main);
