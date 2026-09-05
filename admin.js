const KEY = "wtv-published-v1";
const AIR = "wtv-broadcast-v1";
const NOTE = "wtv-announce-v1";
const GATE = "wtv-pub-ok";
const PUB_KEY = "tbay2026";
function gated() { return sessionStorage.getItem(GATE) === "1"; }
function weekKeyNow() {
  var d = new Date();
  var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - x.getDay());
  return x.getFullYear() + "-" + (x.getMonth() + 1) + "-" + x.getDate();
}
function askGate() {
  if (gated()) return true;
  var wrap = document.createElement("div");
  wrap.id = "gate";
  wrap.innerHTML = '<div class="box" style="max-width:420px;margin:40px auto;"><h3>Publisher key</h3><p class="note">Temporary lock. Backend comes later.</p><input id="gateKey" type="password" placeholder="key" /><button class="publish" id="gateGo" type="button">Enter</button></div>';
  document.body.innerHTML = "";
  document.body.appendChild(wrap);
  document.getElementById("gateGo").onclick = function () {
    var v = document.getElementById("gateKey").value;
    if (v === PUB_KEY) {
      sessionStorage.setItem(GATE, "1");
      location.reload();
    } else {
      alert("Wrong key.");
    }
  };
  return false;
}
function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch (e) { return []; }
}
function save(rows) { localStorage.setItem(KEY, JSON.stringify(rows)); }
function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTE) || "[]"); }
  catch (e) { return []; }
}
function saveNotes(rows) { localStorage.setItem(NOTE, JSON.stringify(rows)); }
function loadAir() {
  try { return JSON.parse(localStorage.getItem(AIR) || "null"); }
  catch (e) { return null; }
}
function render() {
  var list = document.getElementById("list");
  if (list) {
    var rows = load();
    list.innerHTML = rows.length ? "" : "<p class='note'>No extra sessions on this device.</p>";
    rows.forEach(function (r, i) {
      var div = document.createElement("div");
      div.className = "item";
      div.innerHTML = "<span></span>";
      div.querySelector("span").textContent = r.name + " · " + r.day + " " + r.time;
      var btn = document.createElement("button");
      btn.className = "del";
      btn.textContent = "Remove";
      btn.onclick = function () { save(load().filter(function (_, j) { return j !== i; })); render(); };
      div.appendChild(btn);
      list.appendChild(div);
    });
  }
  var notices = document.getElementById("notices");
  if (notices) {
    var ads = loadNotes();
    notices.innerHTML = ads.length ? "" : "<p class='note'>No extra notices on this device.</p>";
    ads.forEach(function (r, i) {
      var div = document.createElement("div");
      div.className = "item";
      div.innerHTML = "<span></span>";
      div.querySelector("span").textContent = (r.kicker || "NOTICE") + " · " + r.title;
      var btn = document.createElement("button");
      btn.className = "del";
      btn.textContent = "Remove";
      btn.onclick = function () { saveNotes(loadNotes().filter(function (_, j) { return j !== i; })); render(); };
      div.appendChild(btn);
      notices.appendChild(div);
    });
  }
  var air = loadAir();
  var form = document.getElementById("air");
  if (air && form) {
    form.status.value = air.status || "idle";
    form.title.value = air.title || "";
    form.note.value = air.note || "";
    form.eventId.value = air.eventId || "";
    form.replay.value = air.replayUrl || "";
    var wins = air.windows || [];
    function urlFor(name) {
      var w = wins.filter(function (x) { return x.platform === name; })[0];
      return w && w.url ? w.url : "";
    }
    form.youtube.value = urlFor("YouTube");
    form.kick.value = urlFor("Kick");
    form.x.value = urlFor("X");
    form.tiktok.value = urlFor("TikTok");
  }
}
if (!askGate()) {
} else {
  var notice = document.getElementById("notice");
  if (notice) notice.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var ads = loadNotes();
    ads.unshift({
      id: "AD-" + Date.now(),
      kicker: f.kicker.value.trim() || "NOTICE",
      title: f.title.value.trim(),
      line: f.line.value.trim(),
      url: f.url.value.trim(),
      week: weekKeyNow()
    });
    saveNotes(ads);
    f.reset();
    render();
  });
  document.getElementById("air").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var payload = {
      status: f.status.value,
      title: f.title.value.trim(),
      note: f.note.value.trim(),
      eventId: f.eventId.value.trim(),
      replayUrl: f.replay.value.trim(),
      windows: [
        { platform: "YouTube", aspect: "16:9", role: "replay + long live", url: f.youtube.value.trim() },
        { platform: "Kick", aspect: "16:9", role: "long live", url: f.kick.value.trim() },
        { platform: "X", aspect: "16:9", role: "live + clip", url: f.x.value.trim() },
        { platform: "TikTok", aspect: "9:16", role: "short live + clip", url: f.tiktok.value.trim() }
      ]
    };
    localStorage.setItem(AIR, JSON.stringify(payload));
    render();
    alert("Channel updated on this device. Open home and hard-refresh.");
  });
  document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var rows = load();
    rows.unshift({
      id: "PUB-" + Date.now(),
      week: weekKeyNow(),
      name: f.name.value.trim(),
      type: "Session",
      day: f.day.value.trim(),
      time: f.time.value.trim(),
      rule: f.rule.value.trim() || f.day.value.trim(),
      venue: f.venue.value.trim(),
      address: f.address.value.trim() || f.venue.value.trim(),
      city: f.city.value,
      price: f.price.value.trim() || "Free",
      capacity: f.capacity.value.trim() || "Drop-in",
      instagram: f.instagram.value.trim() || "#",
      lat: parseFloat(f.lat.value) || 27.77,
      lng: parseFloat(f.lng.value) || -82.64,
      image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=80"
    });
    save(rows);
    f.reset();
    render();
  });
  render();
}
