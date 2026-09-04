function ytId(url) {
  if (!url) return "";
  var m = String(url).match(/(?:youtu\.be\/|v=|\/live\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : "";
}
function pickPlayUrl() {
  var bc = window.BROADCAST || { windows: [] };
  try {
    var o = JSON.parse(localStorage.getItem("wtv-broadcast-v1") || "null");
    if (o && o.status) bc = o;
  } catch (e) {}
  if (bc.replayUrl) return bc.replayUrl;
  var wins = bc.windows || [];
  for (var i = 0; i < wins.length; i++) {
    if (wins[i].url) return wins[i].url;
  }
  return "";
}
function mountYouTube(url) {
  var id = ytId(url);
  var frame = document.querySelector(".frame");
  if (!id || !frame) return false;
  var prev = document.getElementById("heroPlayer");
  if (prev) prev.remove();
  var ifr = document.createElement("iframe");
  ifr.id = "heroPlayer";
  ifr.title = "Wellness TV live";
  ifr.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
  ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
  ifr.allowFullscreen = true;
  frame.appendChild(ifr);
  var play = document.getElementById("playBtn");
  if (play) play.style.display = "none";
  return true;
}
function bootPlayer() {
  var play = document.getElementById("playBtn");
  if (!play) return;
  play.addEventListener("click", function (e) {
    var url = pickPlayUrl();
    if (mountYouTube(url)) {
      e.stopImmediatePropagation();
      return;
    }
    if (url) window.open(url, "_blank", "noopener");
  }, true);
}
document.addEventListener("DOMContentLoaded", bootPlayer);
