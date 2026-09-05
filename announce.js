function weekKeyNow() {
  var d = new Date();
  var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - x.getDay());
  return x.getFullYear() + "-" + (x.getMonth() + 1) + "-" + x.getDate();
}
function isSeries(ad) {
  return String(ad.kicker || "").toUpperCase() === "SERIES";
}
function paintAnnounce() {
  var box = document.getElementById("announce");
  if (!box) return;
  var key = weekKeyNow();
  var extra = [];
  try { extra = JSON.parse(localStorage.getItem("wtv-announce-v1") || "[]"); } catch (e) {}
  extra = extra.filter(function (ad) {
    if (!isSeries(ad)) return true;
    return ad.week === key;
  });
  var seed = ((window.SEED && window.SEED.announce) || []).filter(function (ad) {
    return !isSeries(ad);
  });
  var ads = extra.concat(seed);
  box.innerHTML = "";
  ads.forEach(function (ad) {
    var a = document.createElement(ad.url ? "a" : "div");
    a.className = "announce-card";
    if (ad.url) {
      a.href = ad.url;
      a.target = "_blank";
      a.rel = "noopener";
    }
    a.innerHTML = "<b></b><span></span><em></em>";
    a.querySelector("b").textContent = ad.kicker || "NOTICE";
    a.querySelector("span").textContent = ad.title;
    a.querySelector("em").textContent = ad.line || "";
    box.appendChild(a);
  });
}
document.addEventListener("DOMContentLoaded", paintAnnounce);
