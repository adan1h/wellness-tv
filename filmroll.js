function filmSources() {
  var srcs = [];
  var data = window.SEED || {};
  if (data.gallery) srcs = srcs.concat(data.gallery);
  if (data.wall) {
    data.wall.forEach(function (w) { if (w.image) srcs.push(w.image); });
  }
  (data.events || []).forEach(function (ev) {
    if (ev.image) srcs.push(ev.image);
  });
  if (!srcs.length) srcs = ["./media/hero.jpg", "./media/clip-169.jpg", "./media/still-01.jpg"];
  return srcs;
}
function buildTrack(el, srcs) {
  if (!el) return;
  el.innerHTML = "";
  var track = document.createElement("div");
  track.className = "film-track";
  var loop = srcs.concat(srcs);
  loop.forEach(function (src) {
    var cell = document.createElement("div");
    cell.className = "cell";
    var img = document.createElement("img");
    img.src = src;
    img.alt = "";
    cell.appendChild(img);
    track.appendChild(cell);
  });
  el.appendChild(track);
}
function bootFilm() {
  var srcs = filmSources();
  buildTrack(document.getElementById("strip"), srcs);
  buildTrack(document.getElementById("stripEnd"), srcs.slice().reverse());
}
document.addEventListener("DOMContentLoaded", bootFilm);
