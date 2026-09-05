function weekStart(d) {
  var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
}
function weekEnd(start) {
  var x = new Date(start);
  x.setDate(x.getDate() + 7);
  return x;
}
function weekKeyNow() {
  var x = weekStart(new Date());
  return x.getFullYear() + "-" + (x.getMonth() + 1) + "-" + x.getDate();
}
function offIdsThisWeek() {
  try {
    var map = JSON.parse(localStorage.getItem("wtv-off-v1") || "{}");
    return map[weekKeyNow()] || [];
  } catch (e) {
    return [];
  }
}
function setOffThisWeek(id, off) {
  var key = weekKeyNow();
  var map = {};
  try { map = JSON.parse(localStorage.getItem("wtv-off-v1") || "{}"); } catch (e) { map = {}; }
  var list = map[key] || [];
  list = list.filter(function (x) { return x !== id; });
  if (off) list.push(id);
  map[key] = list;
  localStorage.setItem("wtv-off-v1", JSON.stringify(map));
}
function weekdayIndex(name) {
  var n = String(name || "").toLowerCase();
  if (n.indexOf("sun") === 0) return 0;
  if (n.indexOf("mon") === 0) return 1;
  if (n.indexOf("tue") === 0) return 2;
  if (n.indexOf("wed") === 0) return 3;
  if (n.indexOf("thu") === 0) return 4;
  if (n.indexOf("fri") === 0) return 5;
  if (n.indexOf("sat") === 0) return 6;
  return -1;
}
function nthWeekdayDate(year, month, weekday, n) {
  var d = new Date(year, month, 1);
  var count = 0;
  while (d.getMonth() === month) {
    if (d.getDay() === weekday) {
      count += 1;
      if (count === n) return new Date(d.getTime());
    }
    d.setDate(d.getDate() + 1);
  }
  return null;
}
function inThisWeek(date, start, end) {
  return date && date >= start && date < end;
}
function eventThisWeek(ev) {
  if (!ev) return false;
  if (offIdsThisWeek().indexOf(ev.id) >= 0) return false;
  if (String(ev.id || "").indexOf("PUB-") === 0) {
    return ev.week === weekKeyNow();
  }
  var rule = String(ev.rule || "").toLowerCase();
  var start = weekStart(new Date());
  var end = weekEnd(start);
  var wd = weekdayIndex(ev.day);
  if (/monthly/.test(rule) && !/first|1st|second|2nd|third|3rd/.test(rule)) return false;
  if (/every\s+(mon|tue|wed|thu|fri|sat|sun)/.test(rule)) return true;
  if (/weekly/.test(rule) && !/monthly/.test(rule)) return true;
  var ns = [];
  if (/1st and 3rd/.test(rule)) ns = [1, 3];
  else if (/first|1st/.test(rule)) ns = [1];
  else if (/second|2nd/.test(rule)) ns = [2];
  else if (/third|3rd/.test(rule)) ns = [3];
  if (ns.length && wd >= 0) {
    var now = new Date();
    return ns.some(function (n) {
      var dt = nthWeekdayDate(now.getFullYear(), now.getMonth(), wd, n);
      return inThisWeek(dt, start, end);
    });
  }
  return true;
}
window.eventThisWeek = eventThisWeek;
window.weekKeyNow = weekKeyNow;
window.offIdsThisWeek = offIdsThisWeek;
window.setOffThisWeek = setOffThisWeek;
