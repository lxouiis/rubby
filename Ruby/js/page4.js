
let payload;
fetch('data.json').then(r=>r.json()).then(d=>{
  payload = d;
  finalHeadline.textContent = `${d.headline} ${d.friendName} ✨`;
  finalMessage.textContent = d.finalMessage;
  b1.textContent = d.buttons[0];
  b2.textContent = d.buttons[1];
});
// cursor-follow
window.addEventListener('mousemove', e=>{
  follower.style.transform = `translate(${e.clientX+12}px, ${e.clientY+12}px)`;
});
function checkDone(){
  if(c1.checked && c2.checked){
    dialog.textContent = 'Yay! Taking you back to the cover…';
    setTimeout(()=> location.href='index.html', 900);
  }
}
c1.addEventListener('change', ()=>{ dialog.textContent = (payload?.dialogues?.[0]||'Hehe!'); checkDone(); });
c2.addEventListener('change', ()=>{ dialog.textContent = (payload?.dialogues?.[1]||'Okay!'); checkDone(); });
