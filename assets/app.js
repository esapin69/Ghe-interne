
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyT31o3uSvwy-WrVZ4QGRQ8u9js6tpC4a1bzUy3VHl_ccySpAnFnjjPzzj3Vcrco6X_/exec"
};

document.addEventListener("click", e => {
  const choice = e.target.closest(".choice");
  if(choice){
    const group = choice.parentElement;
    group.querySelectorAll(".choice").forEach(x=>x.classList.remove("selected"));
    choice.classList.add("selected");
    const hidden = group.nextElementSibling;
    if(hidden && hidden.type==="hidden") hidden.value = choice.dataset.value || choice.textContent.trim();
  }
});
document.querySelectorAll('input[type="range"]').forEach(r=>{
  const out=document.querySelector(`[data-range="${r.id}"]`);
  const update=()=>{if(out)out.textContent=`${r.value} %`};
  r.addEventListener("input",update);update();
});
function reviewForm(){
  const data={};
  document.querySelectorAll("[data-form]").forEach(el=>data[el.name]=el.value);
  const missing=Object.entries(data).filter(([k,v])=>!v && k!=="Élément à revoir").map(([k])=>k);
  if(missing.length){alert("Merci de compléter toutes les réponses avant de poursuivre.");return;}
  document.getElementById("reviewContent").innerHTML=Object.entries(data).map(([k,v])=>`<div class="card"><strong>${escapeHtml(k)}</strong><div style="margin-top:5px;color:#667085">${escapeHtml(v||"Non renseigné")}</div></div>`).join("");
  document.getElementById("formStep").classList.add("hidden");
  document.getElementById("reviewStep").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}
function backToForm(){
  document.getElementById("reviewStep").classList.add("hidden");
  document.getElementById("formStep").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}
function collectFormData(){
  const payload={type:document.body.dataset.formType||"",nom:(document.querySelector('[name="Nom et prénom"]')||{}).value||"",dateISO:new Date().toISOString(),reponses:{}};
  document.querySelectorAll("[data-form]").forEach(el=>payload.reponses[el.name]=el.value);
  return payload;
}
async function submitReview(){
  const btn=document.querySelector("[data-submit-review]");
  if(btn){btn.disabled=true;btn.textContent="Transmission en cours…";}
  try{
    const response=await fetch(CONFIG.APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(collectFormData())});
    const result=await response.json();
    if(!result.ok) throw new Error(result.error||"Envoi refusé");
    document.getElementById("reviewStep").innerHTML=`<div class="card"><h2>Transmission effectuée</h2><p>Votre bilan a été transmis aux responsables.</p><a class="btn primary" href="formulaires.html" style="margin-top:14px">Retour aux formulaires</a></div>`;
  }catch(err){
    alert("La transmission n’a pas abouti. Réessayez après vérification.");
    if(btn){btn.disabled=false;btn.textContent="Valider et transmettre";}
  }
}
function escapeHtml(value){return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
