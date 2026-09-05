function channelHasUrl() {
  var bc = window.BROADCAST || {};
  try {
    var o = JSON.parse(localStorage.getItem("wtv-broadcast-v1") || "null");
    if (o && o.status) bc = o;
  } catch (e) {}
  if (bc.replayUrl) return true;
  var wins = bc.windows || [];
  for (var i = 0; i < wins.length; i++) {
    if (wins[i].url) return true;
  }
  return false;
}
document.addEventListener("DOMContentLoaded", function () {
  if (channelHasUrl()) return;
  var badge = document.getElementById("heroBadge");
  if (badge) {
    badge.textContent = "DARK";
    badge.className = "badge";
  }
  var play = document.getElementById("playBtn");
  if (play) {
    play.onclick = function (e) {
      if (e) e.preventDefault();
    };
  }
});
