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
  feed.innerHTML = "";
  title.textContent = (day === todayName() ? "TODAY" : day.toUpperCase());
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
  list.forEach(function (ev) { feed.appendChild(makeCard(ev, state.likes, state.openSheet)); });
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

  document.getElementById("epTag").textContent = "EPISODE · " + today.toUpperCase();
  var badge = document.getElementById("heroBadge");
  var title = document.getElementById("heroTitle");
  var sub = document.getElementById("heroSub");
  title.textContent = today.toUpperCase() + " IN THE BAY";
  if (bc.status === "live") {
    badge.textContent = "ON AIR · " + (bc.windows.filter(function (w) { return w.url; }).map(function (w) { return w.platform; }).join(" / ") || "LIVE");
    badge.className = "badge live";
    title.textContent = bc.title || title.textContent;
    sub.textContent = "Same window on YouTube, Kick, X or TikTok. We switch the frame.";
  } else if (bc.status === "next") {
    badge.textContent = "NEXT LIVE";
    badge.className = "badge next";
    title.textContent = bc.title || title.textContent;
    sub.textContent = bc.note || "Links drop when the encoder goes live.";
  } else if (bc.status === "replay") {
    badge.textContent = "REPLAY";
    badge.className = "badge";
    title.textContent = bc.title || title.textContent;
    sub.textContent = "VOD on YouTube · shorts cut to TikTok and X.";
  } else {
    badge.textContent = "REPLAY";
    badge.className = "badge";
    sub.textContent = todayList.length
      ? todayList.length + " sessions on the board · first shoot still pending"
      : "No locked session today";
  }
  var heroImg = document.getElementById("heroImg");
  heroImg.src = data.replay.image;
  bindImg(heroImg);
  document.getElementById("playBtn").onclick = function () {
    var url = firstLiveUrl(bc);
    if (url) window.open(url, "_blank", "noopener");
    else if (bc.eventId) selectCard(bc.eventId);
    else if (todayList[0]) selectCard(todayList[0].id);
  };

  var strip = document.getElementById("strip");
  strip.innerHTML = "";
  [
    { label: "16:9", note: "YouTube / Kick replay" },
    { label: "9:16", note: "TikTok live cut" },
    { label: "X", note: "clip + live" }
  ].forEach(function (item) {
    var cell = document.createElement("div");
    cell.className = "cell";
    var s = document.createElement("span");
    s.textContent = item.label + " · " + item.note;
    cell.appendChild(s);
    strip.appendChild(cell);
  });

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
  } else {
    stillsSec.classList.add("hidden");
  }

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
    row.innerHTML = "<b></b><span></span>";
    row.querySelector("b").textContent = ev.time.replace(" ", "");
    var liveMark = (bc.eventId === ev.id && (bc.status === "live" || bc.status === "next")) ? " · window" : "";
    row.querySelector("span").textContent = ev.name + liveMark;
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
