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
function dressToday() {
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
  var box = document.getElementById("credits");
  if (!box) return;
  var head = box.querySelector("h4");
  if (head) head.textContent = "TODAY";
  box.querySelectorAll(".cr").forEach(function (row) {
    var span = row.querySelector("span");
    var time = row.querySelector("b");
    if (time) {
      var t = time.textContent.replace(/AM|PM/gi, "").trim();
      time.textContent = t.length === 4 ? "0" + t : t;
    }
    if (!span) return;
    var text = span.textContent || "";
    row.classList.remove("is-now", "is-next", "is-past", "live", "done", "up");
    var old = row.querySelector(".flag");
    if (old) old.remove();
    if (text.indexOf("NOW") === 0) row.classList.add("live");
    else if (text.indexOf("PAST") === 0) row.classList.add("done");
    span.textContent = text.replace(/^(NOW|NEXT|PAST)\s*·\s*/, "");
  });
}
function bootSocial() {
  paintId();
  paintFloor();
  dressToday();
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
