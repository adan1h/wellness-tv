/*
  When YouTube / Kick / X / TikTok accounts exist, paste the live or VOD
  URLs here and set status to "live" | "next" | "replay".
  The home reads this file. Admin is only a local override for tests.
*/
window.BROADCAST = {
  eventId: "",
  status: "idle",
  title: "",
  note: "",
  replayUrl: "",
  windows: [
    { platform: "YouTube", aspect: "16:9", role: "replay + long live", url: "" },
    { platform: "Kick", aspect: "16:9", role: "long live", url: "" },
    { platform: "X", aspect: "16:9", role: "live + clip", url: "" },
    { platform: "TikTok", aspect: "9:16", role: "short live + clip", url: "" }
  ]
};
