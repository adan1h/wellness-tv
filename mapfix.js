document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    if (!window.L) return;
    var map = window.mapRef;
    if (!map) return;
    map.eachLayer(function (layer) {
      if (layer instanceof window.L.TileLayer) map.removeLayer(layer);
    });
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19
    }).addTo(map);
    map.invalidateSize();
    map.setView([27.85, -82.58], 10);
  }, 500);
});
