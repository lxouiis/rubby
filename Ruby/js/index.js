// 🌻 robust popup video + safe redirect
document.addEventListener("DOMContentLoaded", () => {
  // If your video is in /assets, change to "assets/Video-709.mp4"
  const VIDEO_SRC = "Video-709.mp4";
  const NEXT_PAGE = "/birthday/Dist/index.html";
  const TRIGGER_TIME = null; // e.g., 7.2 to jump mid-video; null = redirect on ended

  const $ = (sel) => document.querySelector(sel);
  const sunflower = $("#sunflowerBtn");   // <-- matches your HTML
  const overlay   = $("#overlay");
  const video     = $("#introVid");
  const srcTag    = $("#vidSrc");
  const skipBtn   = $("#skip");
  const closeBtn  = $("#close");

  // dev status chip (optional)
  const status = document.createElement("div");
  status.id = "vidStatus";
  status.textContent = "idle";
  document.body.appendChild(status);
  const log = (m) => (status.textContent = m);

  if (!sunflower || !overlay || !video) {
    console.warn("Missing required elements. Check IDs.");
    return;
  }

  function setSource(src){
    if (srcTag) { srcTag.src = src; video.load(); }
    else { video.src = src; }
  }
  setSource(VIDEO_SRC);
function showOverlay(){
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden","false");

  video.muted = false; // ✅ enable sound
  video.currentTime = 0;
  video.play().catch(() => {
    console.log("Autoplay blocked — user needs to press play");
  });
}


  function hideOverlay(){
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden","true");
    try{ video.pause(); }catch{}
  }

  function goNext(){ window.location.href = NEXT_PAGE; }

  sunflower.addEventListener("click", showOverlay, {passive:true});
  closeBtn?.addEventListener("click", hideOverlay, {passive:true});
  skipBtn?.addEventListener("click", goNext, {passive:true});
  overlay.addEventListener("click", (e)=>{ if (e.target === overlay) hideOverlay(); });

  video.addEventListener("loadedmetadata", ()=> log(`loaded (${video.duration.toFixed(2)}s)`));
  video.addEventListener("error", ()=> log("error (check path/codec)"));

  if (TRIGGER_TIME != null){
    let fired = false;
    video.addEventListener("timeupdate", ()=>{
      if (!fired && video.currentTime >= TRIGGER_TIME) { fired = true; goNext(); }
    });
  } else {
    video.addEventListener("ended", goNext);
  }

  try { fetch(VIDEO_SRC, { method: "HEAD" }).then(r => log(r.ok ? "source OK" : "source missing (404)")); } catch {}
});
// 🌻 end robust popup video + safe redirect