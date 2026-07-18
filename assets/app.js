
function setActiveHospital(id){
  document.querySelectorAll('.hospital-tab').forEach(x=>x.classList.toggle('active',x.dataset.target===id));
  document.querySelectorAll('.hospital-panel').forEach(x=>x.classList.toggle('active',x.id===id));
}
document.addEventListener('click',e=>{
  const tab=e.target.closest('.hospital-tab');
  if(tab) setActiveHospital(tab.dataset.target);
  const choice=e.target.closest('.choice');
  if(choice){
    const group=choice.parentElement;
    group.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));
    choice.classList.add('selected');
    const hidden=group.nextElementSibling;
    if(hidden && hidden.matches('input[type=hidden]')) hidden.value=choice.dataset.value||choice.textContent.trim();
  }
});
document.querySelectorAll('input[type=range]').forEach(r=>{
  const out=document.querySelector('[data-range="'+r.id+'"]');
  const update=()=>{if(out) out.textContent=r.value+' %'};
  r.addEventListener('input',update);update();
});
function nextStep(current,next){
  document.getElementById(current).classList.add('hidden');
  document.getElementById(next).classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}
function reviewForm(){
  const data={};
  document.querySelectorAll('[data-form]').forEach(el=>{data[el.name]=el.value});
  const target=document.getElementById('reviewContent');
  if(target){
    target.innerHTML=Object.entries(data).map(([k,v])=>`<div class="card" style="margin-bottom:10px"><strong>${k}</strong><div class="small" style="margin-top:4px">${v||'Non renseigné'}</div></div>`).join('');
  }
  nextStep('formStep','reviewStep');
}
function saveProgress(){
  localStorage.setItem('ghe_start_progress','started');
}
