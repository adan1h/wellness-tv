const KEY = "wtv-published-v1";
function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function save(rows) { localStorage.setItem(KEY, JSON.stringify(rows)); }
function render() {
  const list = document.getElementById("list");
  const rows = load();
  list.innerHTML = rows.length ? "" : "<p class='meta'>Nothing published from this panel yet.</p>";
  rows.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<span>${r.name} · ${r.day} ${r.time}</span>`;
    const btn = document.createElement("button");
    btn.className = "del";
    btn.textContent = "Remove";
    btn.onclick = () => { save(load().filter((_, j) => j !== i)); render(); };
    div.appendChild(btn);
    list.appendChild(div);
  });
}
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const rows = load();
  rows.unshift({
    id: "PUB-" + Date.now(),
    name: f.name.value.trim(),
    type: "Session",
    day: f.day.value.trim(),
    time: f.time.value.trim(),
    rule: f.rule.value.trim() || f.day.value.trim(),
    venue: f.venue.value.trim(),
    address: f.address.value.trim(),
    city: f.city.value,
    price: f.price.value.trim() || "Free",
    capacity: f.capacity.value.trim() || "Drop-in",
    instagram: f.instagram.value.trim() || "#",
    lat: parseFloat(f.lat.value) || 27.77,
    lng: parseFloat(f.lng.value) || -82.64,
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=80",
  });
  save(rows);
  f.reset();
  render();
});
render();
