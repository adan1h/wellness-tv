// Wellness TV does not encode the live. We switch the frame to the platform window.
// status: idle | next | live | replay
window.BROADCAST = {
  eventId: "WTV-039",
  status: "next",
  title: "Plunsana Ladies Night",
  note: "Window 5:00–8:00 PM · links drop when the encoder goes live",
  replayUrl: "",
  windows: [
    { platform: "YouTube", aspect: "16:9", role: "replay + long live", url: "" },
    { platform: "Kick", aspect: "16:9", role: "long live", url: "" },
    { platform: "X", aspect: "16:9", role: "live + clip",
      url: "" },
    { platform: "TikTok", aspect: "9:16", role: "short live + clip", url: "" }
  ]
};
