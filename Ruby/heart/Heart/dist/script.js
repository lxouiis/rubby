/* =========================
   CONFIG
========================= */
const VIDEO_SRC = "../../Video-709.mp4";
const NEXT_PAGE = "../../game/index.html";  // ✅ fixed path
const HEART_ANIM_MS = 6000;
const FALLBACK_PLAY_MS = 20000;

/* =========================
   HEART PARTICLE ANIMATION
========================= */
var settings = {
  particles: { length: 10000, duration: 4, velocity: 80, effect: -1.3, size: 8 },
};

// rAF polyfill
(function () {
  var b = 0, c = ["ms","moz","webkit","o"];
  for (var a=0; a<c.length && !window.requestAnimationFrame; ++a) {
    window.requestAnimationFrame = window[c[a]+"RequestAnimationFrame"];
    window.cancelAnimationFrame = window[c[a]+"CancelAnimationFrame"] || window[c[a]+"CancelRequestAnimationFrame"];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (h) {
      var d = new Date().getTime(), f = Math.max(0, 16 - (d - b));
      var g = window.setTimeout(function () { h(d + f); }, f);
      b = d + f; return g;
    };
  }
  if (!window.cancelAnimationFrame) { window.cancelAnimationFrame = function (d) { clearTimeout(d); }; }
})();

var Point = (function () {
  function Point(x, y) { this.x = x ?? 0; this.y = y ?? 0; }
  Point.prototype.clone = function () { return new Point(this.x, this.y); };
  Point.prototype.length = function (length) {
    if (typeof length === "undefined") return Math.hypot(this.x, this.y);
    this.normalize(); this.x *= length; this.y *= length; return this;
  };
  Point.prototype.normalize = function () {
    var l = this.length(); this.x /= l; this.y /= l; return this;
  };
  return Point;
})();

var Particle = (function () {
  function Particle(){ this.position=new Point(); this.velocity=new Point(); this.acceleration=new Point(); this.age=0; }
  Particle.prototype.initialize = function (x,y,dx,dy){
    this.position.x=x; this.position.y=y; this.velocity.x=dx; this.velocity.y=dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  };
  Particle.prototype.update = function (dt){
    this.position.x += this.velocity.x * dt; this.position.y += this.velocity.y * dt;
    this.velocity.x += this.acceleration.x * dt; this.velocity.y += this.acceleration.y * dt;
    this.age += dt;
  };
  Particle.prototype.draw = function (ctx, img){
    function ease(t){ return --t * t * t + 1; }
    var size = img.width * ease(this.age / settings.particles.duration);
    ctx.globalAlpha = 1 - this.age / settings.particles.duration;
    ctx.drawImage(img, this.position.x - size/2, this.position.y - size/2, size, size);
  };
  return Particle;
})();

var ParticlePool = (function () {
  var particles, firstActive=0, firstFree=0, duration=settings.particles.duration;
  function ParticlePool(len){ particles=new Array(len); for (var i=0;i<len;i++) particles[i]=new Particle(); }
  ParticlePool.prototype.add = function (x,y,dx,dy){
    particles[firstFree].initialize(x,y,dx,dy); firstFree++; if (firstFree===particles.length) firstFree=0;
    if (firstActive===firstFree) { firstActive++; if (firstActive===particles.length) firstActive=0; }
  };
  ParticlePool.prototype.update = function (dt){
    var i;
    if (firstActive < firstFree) { for (i=firstActive;i<firstFree;i++) particles[i].update(dt); }
    if (firstFree < firstActive) { for (i=firstActive;i<particles.length;i++) particles[i].update(dt); for (i=0;i<firstFree;i++) particles[i].update(dt); }
    while (firstActive!==firstFree && particles[firstActive].age >= duration) { firstActive++; if (firstActive===particles.length) firstActive=0; }
  };
  ParticlePool.prototype.draw = function (ctx,img){
    var i;
    if (firstActive < firstFree) { for (i=firstActive;i<firstFree;i++) particles[i].draw(ctx,img); }
    if (firstFree < firstActive) { for (i=firstActive;i<particles.length;i++) particles[i].draw(ctx,img); for (i=0;i<firstFree;i++) particles[i].draw(ctx,img); }
  };
  return ParticlePool;
})();

(function (canvas) {
  const ctx = canvas.getContext("2d");
  const pool = new ParticlePool(settings.particles.length);
  const particleRate = settings.particles.length / settings.particles.duration;

  function pointOnHeart(t){
    return new Point(
      160 * Math.pow(Math.sin(t), 3),
      130 * Math.cos(t) - 50 * Math.cos(2*t) - 20 * Math.cos(3*t) - 10 * Math.cos(4*t) + 25
    );
  }

  const img = (function(){
    const c=document.createElement("canvas"), k=c.getContext("2d");
    c.width = c.height = settings.particles.size;
    function map(t){
      const p=pointOnHeart(t);
      p.x = settings.particles.size/2 + (p.x * settings.particles.size)/350;
      p.y = settings.particles.size/2 - (p.y * settings.particles.size)/350;
      return p;
    }
    k.beginPath();
    let t=-Math.PI, p=map(t);
    k.moveTo(p.x, p.y);
    while(t < Math.PI){ t+=0.01; p=map(t); k.lineTo(p.x,p.y); }
    k.closePath(); k.fillStyle="#f50b02"; k.fill();
    const out=new Image(); out.src=c.toDataURL(); return out;
  })();

  let rafId = null, prev = 0, startTime = 0;

  function render(ts){
    if (!startTime) startTime = ts;
    rafId = requestAnimationFrame(render);

    const now = ts / 1000, dt = now - (prev || now); prev = now;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const amount = particleRate * dt;
    for (let i=0;i<amount;i++){
      const pos = pointOnHeart(Math.PI - 2*Math.PI*Math.random());
      const dir = pos.clone().length(settings.particles.velocity);
      pool.add(canvas.width/2 + pos.x, canvas.height/2 - pos.y, dir.x, -dir.y);
    }

    pool.update(dt);
    pool.draw(ctx, img);
  }

  function onResize(){ canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
  window.addEventListener("resize", onResize);

  // kick off
  setTimeout(()=>{ onResize(); rafId = requestAnimationFrame(render); }, 10);

  // stop animation & show video after HEART_ANIM_MS
  setTimeout(()=> {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    showOverlayAndPlay();
  }, HEART_ANIM_MS);

})(document.getElementById("pinkboard"));

/* =========================
   VIDEO OVERLAY + NAVIGATION
========================= */
let redirected = false;
let fallbackTimer = null;

function goNext(){
  if (redirected) return;
  redirected = true;
  if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
  if (NEXT_PAGE) window.location.href = NEXT_PAGE;
}

function showOverlayAndPlay(){
  const overlay = document.getElementById("overlay");
  const video   = document.getElementById("introVid");
  const srcTag  = document.getElementById("vidSrc");
  const skipBtn = document.getElementById("skip");
  const closeBtn= document.getElementById("close");

  // wire source & load
  if (srcTag) { srcTag.src = VIDEO_SRC; video.load(); } else { video.src = VIDEO_SRC; }

  // show
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden","false");

  // try play with sound
  try {
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(()=>{ video.controls = true; });
  } catch {}

  // handlers
  function closeOverlay(){
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden","true");
    try { video.pause(); } catch {}
  }

  closeBtn?.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e)=>{ if (e.target === overlay) closeOverlay(); });

  skipBtn?.addEventListener("click", goNext);
  video.addEventListener("ended", goNext);
  video.addEventListener("error", goNext);

  // safety: go even if playback stalls
  fallbackTimer = setTimeout(goNext, FALLBACK_PLAY_MS);
}
