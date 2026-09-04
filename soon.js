function allEvents() {
  var extra = [];
  try { extra = JSON.parse(localStorage.getItem("wtv-published-v1") || "[]"); } catch (e) {}
  return extra.concat((window.SEED && window.SEED.events) || []);
}
function paintSoon() {
  var root = document.getElementById("soon");
  if (!root) return;
  var order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  var start = order.indexOf(today);
  var events = allEvents();
  root.innerHTML = "<h3>COMING UP</h3>";
  var shown = 0;
  for (var i = 1; i <= 6; i++) {
    var day = order[(start + i) % 7];
    var list = events.filter(function (ev) {
      var d = String(ev.day || "").toLowerCase();
      return d.indexOf(day.slice(0, 3).toLowerCase()) === 0;
    });
    if (!list.length) continue;
    shown += 1;
    var wrap = document.createElement("details");
    wrap.className = "soon-day";
    var sum = document.createElement("summary");
    sum.textContent = day.toUpperCase() + " · " + list.length;
    wrap.appendChild(sum);
    list.forEach(function (ev) {
      var p = document.createElement("p");
      p.className = "soon-row";
      p.textContent = (ev.time || "") + "  " + ev.name;
      wrap.appendChild(p);
    });
    root.appendChild(wrap);
  }
  if (!shown) {
    var empty = document.createElement("p");
    empty.className = "soon-row";
    empty.textContent = "No sessions locked past today.";
    root.appendChild(empty);
  }
}
document.addEventListener("DOMContentLoaded", paintSoon);
