
document.addEventListener('click',e=>{
  const c=e.target.closest('.choice');
  if(c){
    const g=c.parentElement;
    g.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));
    c.classList.add('selected');
    const hidden=g.nextElementSibling;
    if(hidden && hidden.type==='hidden') hidden.value=c.dataset.value||c.textContent.trim();
  }
});
document.querySelectorAll('input[type=range]').forEach(r=>{
  const out=document.querySelector('[data-range="'+r.id+'"]');
  const update=()=>{if(out) out.textContent=r.value+' %'};
  r.addEventListener('input',update);update();
});
function reviewForm(){
  const data={};
  document.querySelectorAll('[data-form]').forEach(el=>data[el.name]=el.value);
  const target=document.getElementById('reviewContent');
  target.innerHTML=Object.entries(data).map(([k,v])=>`<div class="card"><strong>${k}</strong><div style="margin-top:5px;color:#667085">${v||'Non renseigné'}</div></div>`).join('');
  document.getElementById('formStep').classList.add('hidden');
  document.getElementById('reviewStep').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}
function backToForm(){
  document.getElementById('reviewStep').classList.add('hidden');
  document.getElementById('formStep').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}
function markDone(type){
  localStorage.setItem(type,'done');
  alert('Étape validée. La transmission par mail doit encore être reliée au destinataire.');
}
