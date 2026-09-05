var CACHE = "wtv-v2";
var PRE = [
  "./",
  "./index.html",
  "./styles.css",
  "./layout.css",
  "./social.css",
  "./soon.css",
  "./film.css",
  "./manifest.json",
  "./icon.svg",
  "./data.js",
  "./broadcast.js",
  "./app.js",
  "./social.js",
  "./player.js",
  "./soon.js",
  "./filmroll.js",
  "./dark.js"
];
self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(PRE); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () { return caches.match(e.request); })
  );
});
