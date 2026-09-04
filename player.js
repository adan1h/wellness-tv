function ytId(url) {
  if (!url) return "";
  var u = String(url);
  var patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = u.match(patterns[i]);
    if (m) return m[1];
  }
  return "";
}
function ytChannel(url) {
  if (!url) return "";
  var m = String(url).match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/);
  return m ? m[1] : "";
}
function isYouTube(url) {
  return /youtu(\.be|be\.com)/i.test(String(url || ""));
}
function currentBroadcast() {
  var bc = window.BROADCAST || { windows: [] };
  try {
    var o = JSON.parse(localStorage.getItem("wtv-broadcast-v1") || "null");
    if (o && o.status) bc = o;
  } catch (e) {}
  return bc;
}
function pickPlayUrl() {
  var bc = currentBroadcast();
  var wins = bc.windows || [];
  var yt = "";
  for (var i = 0; i < wins.length; i++) {
    if (/youtube/i.test(wins[i].platform) && wins[i].url) yt = wins[i].url;
  }
  if (yt) return yt;
  if (bc.replayUrl) return bc.replayUrl;
  for (var j = 0; j < wins.length; j++) {
    if (wins[j].url) return wins[j].url;
  }
  return "";
}
function embedSrc(url) {
  var id = ytId(url);
  if (id) return "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1";
  var ch = ytChannel(url);
  if (ch) return "https://www.youtube.com/embed/live_stream?channel=" + ch + "&autoplay=1";
  return "";
}
function mountYouTube(url) {
  var src = embedSrc(url);
  var frame = document.querySelector(".frame");
  if (!frame || !src) return false;
  var prev = document.getElementById("heroPlayer");
  if (prev) prev.remove();
  var ifr = document.createElement("iframe");
  ifr.id = "heroPlayer";
  ifr.title = "Wellness TV live";
  ifr.src = src;
  ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
  ifr.allowFullscreen = true;
  ifr.referrerPolicy = "strict-origin-when-cross-origin";
  frame.appendChild(ifr);
  var play = document.getElementById("playBtn");
  if (play) play.style.display = "none";
  var sub = document.getElementById("heroSub");
  if (sub) sub.textContent = "Live on this frame via YouTube.";
  return true;
}
function bootPlayer() {
  var play = document.getElementById("playBtn");
  if (!play) return;
  play.onclick = function (e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    var url = pickPlayUrl();
    if (isYouTube(url) && mountYouTube(url)) return false;
    if (isYouTube(url) && !embedSrc(url)) {
      var sub = document.getElementById("heroSub");
      if (sub) sub.textContent = "Need a watch?v= or /live/VIDEO_ID link — not the channel page.";
      return false;
    }
    if (url) window.open(url, "_blank", "noopener");
    return false;
  };
}
document.addEventListener("DOMContentLoaded", bootPlayer);
