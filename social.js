function paintId() {
  var id = window.readId();
  var btn = document.getElementById("idBtn");
  var out = document.getElementById("idOut");
  if (!btn) return;
  if (id && id.provider) {
    btn.textContent = id.provider === "apple" ? "Apple" : "Google";
    btn.classList.add("on");
    if (out) out.classList.remove("hidden");
  } else {
    btn.textContent = "Sign in";
    btn.classList.remove("on");
    if (out) out.classList.add("hidden");
  }
}
function paintFloor() {
  var row = document.getElementById("floor");
  if (!row) return;
  row.innerHTML = "";
  var list = window.TAG_FEED || [];
  list.forEach(function (t) {
    var a = document.createElement("a");
    a.className = "tag-card";
    a.href = t.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = "<img alt=\"\" /><b></b><span></span><em></em>";
    a.querySelector("img").src = t.image;
    a.querySelector("b").textContent = t.platform + " · " + t.handle;
    a.querySelector("span").textContent = t.caption;
    a.querySelector("em").textContent = t.event;
    row.appendChild(a);
  });
}
function mirrorFilm() {
  var a = document.getElementById("strip");
  var b = document.getElementById("stripEnd");
  if (!a || !b) return;
  b.innerHTML = "";
  [].slice.call(a.children).forEach(function (cell) {
    b.appendChild(cell.cloneNode(true));
  });
}
function dayName() {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}
function evDay(ev) {
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
function parseMins(t) {
  var m = String(t || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  var h = parseInt(m[1], 10);
  var min = parseInt(m[2], 10);
  var ap = (m[3] || "").toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}
function loadLikes() {
  try { return JSON.parse(localStorage.getItem("wtv-likes-v1") || "{}"); }
  catch (e) { return {}; }
}
function saveLikes(map) { localStorage.setItem("wtv-likes-v1", JSON.stringify(map)); }
function armAlarm(ev) {
  if (!("Notification" in window)) {
    alert("Saved. This browser cannot ring an alarm.");
    return;
  }
  function ring() {
    try {
      new Notification("Wellness TV", { body: ev.time + " · " + ev.name + " · " + (ev.venue || ev.city) });
    } catch (e) {}
  }
  function schedule() {
    var start = parseMins(ev.time);
    if (start == null) { ring(); return; }
    var now = new Date();
    var cur = now.getHours() * 60 + now.getMinutes();
    var waitMin = start - cur - 15;
    if (waitMin < 1) { ring(); return; }
    setTimeout(ring, waitMin * 60 * 1000);
  }
  if (Notification.permission === "granted") schedule();
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (p) {
      if (p === "granted") schedule();
    });
  }
}
function paintToday() {
  var box = document.getElementById("credits");
  if (!box || !window.SEED) return;
  var likes = loadLikes();
  var today = dayName();
  var extra = [];
  try { extra = JSON.parse(localStorage.getItem("wtv-published-v1") || "[]"); } catch (e) {}
  var list = extra.concat(window.SEED.events || []).filter(function (ev) {
    if (evDay(ev) !== today) return false;
    return !window.eventThisWeek || window.eventThisWeek(ev);
  });
  box.innerHTML = "<h4>TODAY</h4>";
  if (!list.length) {
    var empty = document.createElement("p");
    empty.className = "cr-empty";
    empty.textContent = "Dark tonight.";
    box.appendChild(empty);
    return;
  }
  list.forEach(function (ev) {
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
      saveLikes(likes);
      btn.classList.toggle("on", likes[ev.id]);
      btn.textContent = likes[ev.id] ? "\u2665" : "\u2661";
      if (likes[ev.id]) armAlarm(ev);
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
    box.appendChild(row);
  });
}
function dressChrome() {
  var scene = document.getElementById("scene");
  if (scene) scene.remove();
  var days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  var day = days[new Date().getDay()];
  var bill = document.getElementById("billTitle");
  if (bill) bill.textContent = day + " IN THE BAY";
  var line = document.getElementById("epLine");
  if (line) line.textContent = "WELLNESS TV · EPISODE";
  var hero = document.getElementById("heroTitle");
  if (hero) hero.textContent = day.slice(0, 3) + " · IN THE BAY";
  mirrorFilm();
  paintToday();
}
function bootSocial() {
  paintId();
  paintFloor();
  dressChrome();
  var sheet = document.getElementById("idSheet");
  var btn = document.getElementById("idBtn");
  if (btn && sheet) btn.onclick = function () { sheet.classList.add("open"); };
  var close = document.getElementById("closeId");
  if (close) close.onclick = function () { sheet.classList.remove("open"); };
  if (sheet) sheet.onclick = function (e) { if (e.target === sheet) sheet.classList.remove("open"); };
  function sign(provider) {
    window.writeId({ provider: provider, at: new Date().toISOString(), city: "Tampa Bay" });
    paintId();
    sheet.classList.remove("open");
  }
  var g = document.getElementById("idGoogle");
  var a = document.getElementById("idApple");
  var o = document.getElementById("idOut");
  if (g) g.onclick = function () { sign("google"); };
  if (a) a.onclick = function () { sign("apple"); };
  if (o) o.onclick = function () { window.clearId(); paintId(); sheet.classList.remove("open"); };
}
document.addEventListener("DOMContentLoaded", bootSocial);
