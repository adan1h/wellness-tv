window.WTV_ID_KEY = "wtv-id-v1";
window.readId = function () {
  try { return JSON.parse(localStorage.getItem(window.WTV_ID_KEY) || "null"); }
  catch (e) { return null; }
};
window.writeId = function (obj) {
  localStorage.setItem(window.WTV_ID_KEY, JSON.stringify(obj));
};
window.clearId = function () { localStorage.removeItem(window.WTV_ID_KEY); };
