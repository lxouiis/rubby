
const charEl = document.getElementById('character');
const env = document.getElementById('envelope');
const video = document.getElementById('videoArea');

// Character walks in like before
setTimeout(()=> charEl.classList.add('move'),150);

// Open envelope on hover (desktop) or tap (mobile)
function openEnvelope(){
  if(!env.classList.contains('open')){
    env.classList.add('open');
    // Auto show video shortly after the flap opens
    setTimeout(()=> video.classList.add('show'), 700);
  }
}
env.addEventListener('mouseenter', openEnvelope, {passive:true});
env.addEventListener('click', openEnvelope);

// Continue button proceeds to page 4
document.getElementById('continue').addEventListener('click', ()=> location.href='page4.html');
