
const CONFIG = {
  // À remplacer une seule fois après le déploiement du script Google Apps Script.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyT31o3uSvwy-WrVZ4QGRQ8u9js6tpC4a1bzUy3VHl_ccySpAnFnjjPzzj3Vcrco6X_/exec"
};

const STEPS = {
  arrival: "ghe_step_arrival",
  discovery: "ghe_step_discovery",
  missions: "ghe_step_missions",
  day: "ghe_step_day",
  week: "ghe_step_week",
  weekReview: "ghe_step_week_review"
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[type="range"]').forEach(r => {
    const out = document.querySelector(`[data-range="${r.id}"]`);
    const update = () => { if (out) out.textContent = `${r.value} %`; };
    r.addEventListener("input", update);
    update();
  });

  refreshProgress();
});

document.addEventListener("click", e => {
  const choice = e.target.closest(".choice");
  if (choice) {
    const group = choice.parentElement;
    group.querySelectorAll(".choice").forEach(x => x.classList.remove("selected"));
    choice.classList.add("selected");
    const hidden = group.nextElementSibling;
    if (hidden && hidden.type === "hidden") {
      hidden.value = choice.dataset.value || choice.textContent.trim();
    }
  }
});

function isDone(key) {
  return localStorage.getItem(key) === "done";
}

function setDone(key, done = true) {
  if (done) localStorage.setItem(key, "done");
  else localStorage.removeItem(key);
  refreshProgress();
}

function toggleStep(key) {
  setDone(key, !isDone(key));
}

function completedCount() {
  return Object.values(STEPS).filter(isDone).length;
}

function refreshProgress() {
  const count = completedCount();
  const percent = Math.round((count / 6) * 100);

  document.querySelectorAll("[data-progress-bar]").forEach(el => {
    el.style.width = `${percent}%`;
  });

  document.querySelectorAll("[data-progress-text]").forEach(el => {
    el.textContent = `${count} étape${count > 1 ? "s" : ""} sur 6 terminée${count > 1 ? "s" : ""}`;
  });

  document.querySelectorAll("[data-step-key]").forEach(row => {
    const key = row.dataset.stepKey;
    const done = isDone(key);
    const status = row.querySelector(".status");
    const button = row.querySelector("[data-step-toggle]");
    if (status) {
      status.textContent = done ? "Terminé" : "À faire";
      status.className = `status ${done ? "done" : "todo"}`;
    }
    if (button) {
      button.textContent = done ? "Annuler la validation" : "Marquer comme terminé";
    }
  });

  const dayCard = document.querySelector("[data-day-reminder]");
  if (dayCard) dayCard.classList.toggle("hidden", isDone(STEPS.day));

  const weekCard = document.querySelector("[data-week-reminder]");
  if (weekCard) weekCard.classList.toggle("hidden", !isDone(STEPS.week) || isDone(STEPS.weekReview));
}

function reviewForm() {
  const data = {};
  document.querySelectorAll("[data-form]").forEach(el => {
    data[el.name] = el.value;
  });

  const missing = Object.entries(data)
    .filter(([name, value]) => !value && !["Élément à revoir"].includes(name))
    .map(([name]) => name);

  if (missing.length) {
    alert("Merci de compléter toutes les réponses avant de poursuivre.");
    return;
  }

  const target = document.getElementById("reviewContent");
  target.innerHTML = Object.entries(data)
    .map(([k, v]) => `<div class="card"><strong>${escapeHtml(k)}</strong><div style="margin-top:5px;color:#667085">${escapeHtml(v || "Non renseigné")}</div></div>`)
    .join("");

  document.getElementById("formStep").classList.add("hidden");
  document.getElementById("reviewStep").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function backToForm() {
  document.getElementById("reviewStep").classList.add("hidden");
  document.getElementById("formStep").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function collectFormData() {
  const payload = {
    type: document.body.dataset.formType || "",
    nom: (document.querySelector('[name="Nom et prénom"]') || {}).value || "",
    dateISO: new Date().toISOString(),
    reponses: {}
  };
  document.querySelectorAll("[data-form]").forEach(el => {
    payload.reponses[el.name] = el.value;
  });
  return payload;
}

async function submitReview(stepKey) {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("COLLER_ICI")) {
    alert("L’adresse du script d’envoi doit encore être ajoutée dans assets/app.js.");
    return;
  }

  const btn = document.querySelector("[data-submit-review]");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Transmission en cours…";
  }

  try {
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(collectFormData())
    });

    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Envoi refusé");

    setDone(stepKey, true);
    document.getElementById("reviewStep").innerHTML = `
      <div class="card mandatory-card">
        <h2>Étape terminée</h2>
        <p>Votre bilan a été transmis aux responsables et votre progression a été mise à jour.</p>
        <a class="btn primary" href="commencer.html" style="margin-top:14px">Retour à mon parcours</a>
      </div>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    alert("La transmission n’a pas abouti. Vos réponses restent affichées. Réessayez après vérification du script.");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Valider et transmettre";
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
