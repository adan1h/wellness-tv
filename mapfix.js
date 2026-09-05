document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    if (!window.L || !window.mapRef) return;
    window.mapRef.eachLayer(function (layer) {
      if (layer instanceof window.L.TileLayer) window.mapRef.removeLayer(layer);
    });
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19
    }).addTo(window.mapRef);
    window.mapRef.invalidateSize();
    window.mapRef.setView([27.85, -82.58], 10);
  }, 400);
});
