
const CONFIG={APPS_SCRIPT_URL:"https://script.google.com/macros/s/AKfycbyT31o3uSvwy-WrVZ4QGRQ8u9js6tpC4a1bzUy3VHl_ccySpAnFnjjPzzj3Vcrco6X_/exec"};
document.addEventListener("click",e=>{
 const c=e.target.closest(".choice"); if(!c)return;
 const g=c.parentElement; g.querySelectorAll(".choice").forEach(x=>x.classList.remove("selected"));
 c.classList.add("selected"); const h=g.nextElementSibling; if(h&&h.type==="hidden")h.value=c.dataset.value||c.textContent.trim();
});
document.querySelectorAll('input[type="range"]').forEach(r=>{
 const o=document.querySelector(`[data-range="${r.id}"]`); const u=()=>{if(o)o.textContent=`${r.value} %`}; r.addEventListener("input",u);u();
});
function escapeHtml(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function reviewForm(){
 const data={}; document.querySelectorAll("[data-form]").forEach(el=>data[el.name]=el.value.trim());
 const missing=Object.entries(data).filter(([k,v])=>!v&&!k.includes("(facultatif)")).map(([k])=>k);
 if(missing.length){alert("Merci de compléter les réponses obligatoires.");return}
 document.getElementById("reviewContent").innerHTML=Object.entries(data).map(([k,v])=>`<div class="card review-card"><strong>${escapeHtml(k)}</strong><p style="margin-top:5px">${escapeHtml(v||"Non renseigné")}</p></div>`).join("");
 document.getElementById("formStep").classList.add("hidden");document.getElementById("reviewStep").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});
}
function backToForm(){document.getElementById("reviewStep").classList.add("hidden");document.getElementById("formStep").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"})}
async function submitReview(){
 const btn=document.querySelector("[data-submit-review]");if(btn){btn.disabled=true;btn.textContent="Transmission en cours…"}
 const reponses={};document.querySelectorAll("[data-form]").forEach(el=>reponses[el.name]=el.value);
 const payload={type:document.body.dataset.formType||"",nom:(document.querySelector('[name="Nom et prénom"]')||{}).value||"",dateISO:new Date().toISOString(),reponses};
 try{
  const r=await fetch(CONFIG.APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
  const j=await r.json();if(!j.ok)throw new Error(j.error||"Échec");
  document.getElementById("reviewStep").innerHTML='<div class="card"><h2>Transmission effectuée</h2><p>Votre demande a été transmise.</p><a class="btn primary full" href="suivi.html" style="margin-top:14px">Retour à Mon suivi</a></div>';
 }catch(e){alert("La transmission n’a pas abouti. Réessayez.");if(btn){btn.disabled=false;btn.textContent="Valider et transmettre"}}
}
function filterAgents(){
 const q=(document.getElementById("agentSearch")?.value||"").toLowerCase().trim();let n=0;
 document.querySelectorAll(".agent").forEach(a=>{const s=a.dataset.search.includes(q);a.style.display=s?"grid":"none";if(s)n++});
 const c=document.getElementById("agentCount");if(c)c.textContent=`${n} contact${n>1?"s":""} affiché${n>1?"s":""}`;
}
