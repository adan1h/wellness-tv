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
function bootSocial() {
  paintId();
  paintFloor();
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
