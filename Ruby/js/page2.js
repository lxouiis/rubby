// ==== config ====
const GO_TO_PAGE3 = "../../heart/Heart/dist/index.html"; // << adjust path if needed

// Navigate once helper
let navigated = false;
function goNext() {
  if (navigated) return;
  navigated = true;
  // (optional) debug:
  // console.log("→", new URL(GO_TO_PAGE3, location.href).href);
  location.href = GO_TO_PAGE3;
}

window.addEventListener("load", () => {
  const frame = document.querySelector(".card");
  const char  = document.getElementById("char");
  const charBtn = document.getElementById("charBtn"); // if you still use it for hover styles, etc.

  // 1) glow after 1.8s
  setTimeout(() => {
    char.style.animation = (char.style.animation ? char.style.animation + ", " : "") +
      "glowPulse 1.6s ease-in-out infinite alternate";
  }, 1800);

  // 2) fly + glitter after 3.8s, then go to page 3 when flyAway ends
  setTimeout(() => {
    // start flyAway
    char.style.animation = "flyAway 4s ease-in-out forwards";

    // emit sparkles during the first ~3.8s after takeoff (same as before)
    const start = performance.now();
    const emitMs = 3800;
    const emitter = setInterval(() => {
      const now = performance.now();
      if (now - start > emitMs) { clearInterval(emitter); return; }

      const rect = char.getBoundingClientRect();
      const host = frame.getBoundingClientRect();

      const count = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const s = document.createElement("div");
        s.className = "sparkle";
        const x = rect.left + rect.width  * (0.25 + Math.random() * 0.7);
        const y = rect.top  + rect.height * (0.15 + Math.random() * 0.7);
        s.style.left = (x - host.left - 4) + "px";
        s.style.top  = (y - host.top  - 4) + "px";
        s.style.animationDelay = (Math.random() * 120) + "ms";
        frame.appendChild(s);
        setTimeout(() => s.remove(), 1300);
      }
    }, 80);

    // when the flyAway animation finishes → go next
    const handleEnd = (e) => {
      if (e.animationName === "flyAway") goNext();
    };
    char.addEventListener("animationend", handleEnd, { once: true });

    // fallback: in case animationend doesn't fire (browser quirk), go after 4.2s
    setTimeout(goNext, 4200);
  }, 3800);
});
