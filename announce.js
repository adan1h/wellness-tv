function paintAnnounce() {
  var box = document.getElementById("announce");
  if (!box || !window.SEED) return;
  var ads = window.SEED.announce || [];
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
