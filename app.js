// --- Gestione tab bar ---
document.querySelectorAll('.tab')?.forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('page-frame').src = tab.dataset.page;
  });
});

// --- DB ---
const KEY = "gym_app_data";
function loadDB(){ 
  const raw = localStorage.getItem(KEY);
  if(raw) try { return JSON.parse(raw); } catch(e){}
  return { programmi: [], sessioni: [], allenamenti: [], schedule: {} };
}
function saveDB(db){ localStorage.setItem(KEY, JSON.stringify(db)); }
const db = loadDB();

window.addEventListener("DOMContentLoaded", ()=>{

  // --- HOME DASHBOARD ---
  const homeContainer = document.getElementById("homeContainer");
  if (homeContainer) {
    const welcomeEl = document.getElementById("welcomeMessage");
    const todayEl = document.getElementById("todayDate");
    const lastWorkoutInfo = document.getElementById("lastWorkoutInfo");
    const totalSessionsEl = document.getElementById("totalSessions");
    const totalVolumeEl = document.getElementById("totalVolume");
    const startBtn = document.getElementById("startWorkoutBtn");

    // 🔹 Data
    const today = new Date();
    const giorni = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
    const mesi = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
    todayEl.textContent = `${giorni[today.getDay()]} ${today.getDate()} ${mesi[today.getMonth()]} ${today.getFullYear()}`;

    // 🔹 Frasi motivazionali casuali
    const motivationalQuotes = [
      "Spingi oltre i tuoi limiti 💪",
      "Un giorno in più, una scusa in meno 🔥",
      "Ogni serie conta. Fallo per te.",
      "Diventa la tua versione più forte.",
      "Allenati in silenzio, lascia parlare i risultati.",
      "Corpo forte, mente chiara.",
      "La costanza batte la motivazione.",
      "Bentornato, campione. È ora di superarti.",
      "Nessun giorno perso, solo progressi.",
      "La prossima serie è quella che conta."
    ];
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    // 🔹 Mostra solo la frase motivazionale casuale (senza saluti)
welcomeEl.textContent = randomQuote;

    // 🔹 Ultimo allenamento
    if (db.allenamenti.length > 0) {
      const last = db.allenamenti[db.allenamenti.length - 1];
      lastWorkoutInfo.textContent = `${last.date} – ${last.exercise} (${last.weight}kg x ${last.reps})`;
    } else {
      lastWorkoutInfo.textContent = "Nessun allenamento registrato";
    }

    // 🔹 Statistiche
    const totalSessions = db.allenamenti.length;
    const totalVolume = db.allenamenti.reduce((sum,a)=> sum + (a.weight * a.reps * a.sets), 0);
    totalSessionsEl.textContent = `Sessioni totali: ${totalSessions}`;
    totalVolumeEl.textContent = `Peso totale sollevato: ${totalVolume.toFixed(0)} kg`;

    // 🔹 Pulsante principale (iframe o standalone)
    if (startBtn) {
      startBtn.onclick = () => {
        if (db.sessioni.length > 0) {
          const target = `allenamento.html?id=0`;
          if (window.parent && window.parent.document.getElementById("page-frame")) {
            window.parent.document.getElementById("page-frame").src = target;
          } else {
            window.location.href = target;
          }
        } else {
          alert("Crea una scheda di allenamento per iniziare!");
          const sessTarget = "sessione.html";
          if (window.parent && window.parent.document.getElementById("page-frame")) {
            window.parent.document.getElementById("page-frame").src = sessTarget;
          } else {
            window.location.href = sessTarget;
          }
        }
      };
    }
  }

  // --- PROGRAMMI ---
  const newProgram = document.getElementById("newProgram");
  const addProgramBtn = document.getElementById("addProgramBtn");
  const list = document.getElementById("programList");

  if(addProgramBtn){
    function render(){
      list.innerHTML = "";
      if(db.programmi.length===0){
        list.innerHTML="<li class='muted'>Nessun programma</li>";
      }
      db.programmi.forEach(p=>{
        const li=document.createElement("li");
        li.textContent=p;
        list.appendChild(li);
      });
    }
    render();

    addProgramBtn.onclick=()=>{
      if(!newProgram.value.trim()) return;
      db.programmi.push(newProgram.value.trim());
      saveDB(db);
      newProgram.value="";
      render();
    };
  }

  // --- SESSIONI ---
  const sessionName=document.getElementById("sessionName");
  const addExerciseBtn=document.getElementById("addExerciseBtn");
  const saveSessionBtn=document.getElementById("saveSessionBtn");
  const exerciseList=document.getElementById("exerciseList");
  const sessionList=document.getElementById("sessionList");

  if(addExerciseBtn){
    function addExerciseForm(ex=null){
      const div=document.createElement("div");
      div.className="card";
      div.innerHTML=`
        <input class="ex-name" placeholder="Esercizio" value="${ex?.name||""}">
        <input class="ex-sets" type="number" placeholder="Serie" value="${ex?.sets||3}">
        <input class="ex-reps" type="number" placeholder="Ripetizioni" value="${ex?.reps||10}">
        <input class="ex-weight" type="number" placeholder="Peso (kg)" value="${ex?.weight||0}">
        <input class="ex-rest" type="number" placeholder="Pausa (sec)" value="${ex?.rest||90}">
        <button class="removeEx">❌ Rimuovi</button>
      `;
      div.querySelector(".removeEx").onclick=()=>div.remove();
      exerciseList.appendChild(div);
    }
    addExerciseBtn.onclick=()=>addExerciseForm();

    const params=new URLSearchParams(window.location.search);
    const editIdx=params.get("edit");

    if(editIdx!==null && db.sessioni[editIdx]){
      const s=db.sessioni[editIdx];
      sessionName.value=s.nome;
      s.esercizi.forEach(ex=>addExerciseForm(ex));

      saveSessionBtn.onclick=()=>{
        if(!sessionName.value.trim()) return alert("Inserisci un nome per la sessione");
        const exEls=exerciseList.querySelectorAll(".card");
        const exs=[];
        exEls.forEach(el=>{
          exs.push({
            name:el.querySelector(".ex-name").value.trim(),
            sets:+el.querySelector(".ex-sets").value,
            reps:+el.querySelector(".ex-reps").value,
            weight:+el.querySelector(".ex-weight").value,
            rest:+el.querySelector(".ex-rest").value
          });
        });
        db.sessioni[editIdx]={nome:sessionName.value.trim(), esercizi:exs};
        saveDB(db);
        alert("Sessione aggiornata!");
        window.parent.document.getElementById("page-frame").src="sessione.html";
      };

    } else {
      saveSessionBtn.onclick=()=>{
        if(!sessionName.value.trim()) return alert("Inserisci un nome per la sessione");
        const exEls=exerciseList.querySelectorAll(".card");
        if(exEls.length===0) return alert("Aggiungi almeno un esercizio");
        const exs=[];
        exEls.forEach(el=>{
          exs.push({
            name:el.querySelector(".ex-name").value.trim(),
            sets:+el.querySelector(".ex-sets").value,
            reps:+el.querySelector(".ex-reps").value,
            weight:+el.querySelector(".ex-weight").value,
            rest:+el.querySelector(".ex-rest").value
          });
        });
        db.sessioni.push({nome:sessionName.value.trim(), esercizi:exs});
        saveDB(db);
        sessionName.value="";
        exerciseList.innerHTML="";
        renderSessions();
      };
    }

    function renderSessions(){
      sessionList.innerHTML="";
      db.sessioni.forEach((s,i)=>{
        const li=document.createElement("li");
        li.innerHTML=`
          <strong>${s.nome}</strong> (${s.esercizi.length} esercizi)
          <button onclick="openScheda(${i})">▶️ Apri</button>
          <button onclick="editSession(${i})">✏️ Modifica</button>
          <button onclick="deleteSession(${i})">🗑️ Elimina</button>
        `;
        sessionList.appendChild(li);
      });
    }
    renderSessions();
  }

  // --- SCHEDA VIEWER ---
  const schedaContainer=document.getElementById("schedaContainer");
  if(schedaContainer){
    const params=new URLSearchParams(window.location.search);
    const idx=params.get("id");
    if(idx!==null && db.sessioni[idx]){
      const s=db.sessioni[idx];
      const title=document.createElement("h3");
      title.textContent=s.nome;
      schedaContainer.appendChild(title);
      s.esercizi.forEach(ex=>{
        const card=document.createElement("div");
        card.className="card";
        card.innerHTML=`<h4>${ex.name}</h4>
          <p>${ex.sets}x${ex.reps} @ ${ex.weight}kg – Rest: ${ex.rest}s</p>`;
        schedaContainer.appendChild(card);
      });
      const guidedBtn=document.getElementById("startGuidedBtn");
      if(guidedBtn){
        guidedBtn.onclick=()=>{
          window.parent.document.getElementById("page-frame").src=`allenamento.html?id=${idx}`;
        };
      }
    }
  }

  // --- ALLENAMENTO GUIDATO ---
  const guided = document.getElementById("guidedWorkout");
  if (guided) {
    const params = new URLSearchParams(window.location.search);
    const idx = +params.get("id");

    if (!isNaN(idx) && db.sessioni[idx]) {
      const s = db.sessioni[idx];
      let exIndex = 0;
      let setCount = 1;

      const nameEl = document.getElementById("exerciseName");
      const infoEl = document.getElementById("exerciseInfo");
      const counterEl = document.getElementById("setCounter");
      const timerEl = document.getElementById("timerDisplay");
      const restBtn = document.getElementById("startRestBtn");
      const doneBtn = document.getElementById("completeSetBtn");
      const weightInput = document.getElementById("currentWeight");

      function renderExercise() {
        const e = s.esercizi[exIndex];
        nameEl.textContent = e.name;
        infoEl.textContent = `${e.sets} serie x ${e.reps} rip – pausa ${e.rest}s`;
        counterEl.textContent = `Serie ${setCount}/${e.sets}`;
        timerEl.textContent = "--:--";
        weightInput.value = e.weight || 0;
      }

      renderExercise();

      doneBtn.onclick = () => {
        const e = s.esercizi[exIndex];
        const peso = parseFloat(weightInput.value) || e.weight || 0;
        const today = new Date().toISOString().slice(0, 10);

        db.allenamenti.push({ date: today, exercise: e.name, sets: 1, reps: e.reps, weight: peso });
        saveDB(db);

        if (setCount < e.sets) {
          setCount++;
          counterEl.textContent = `Serie ${setCount}/${e.sets}`;
          startRest(e.rest);
        } else {
          exIndex++;
          if (exIndex < s.esercizi.length) {
            setCount = 1;
            alert(`Prossimo esercizio: ${s.esercizi[exIndex].name}`);
            renderExercise();
          } else {
            alert("Allenamento completato 💪");
            if (window.parent && window.parent.document.getElementById("page-frame")) {
              window.parent.document.getElementById("page-frame").src = "progressi.html";
            } else {
              window.location.href = "progressi.html";
            }
          }
        }
      };

      restBtn.onclick = () => {
        const e = s.esercizi[exIndex];
        startRest(e.rest);
      };

      function startRest(sec) {
        let remaining = sec;
        restBtn.disabled = true;
        timerEl.textContent = format(remaining);

        const int = setInterval(() => {
          remaining--;
          timerEl.textContent = format(remaining);

          if (remaining <= 0) {
            clearInterval(int);
            restBtn.disabled = false;
            timerEl.textContent = "--:--";
            alert("⏱️ Pausa terminata!");
          }
        }, 1000);
      }

    } else {
      guided.innerHTML = `<div class="card">❌ Nessuna sessione trovata.</div>`;
    }
  }

  // --- PROGRESSI ---
  const sel=document.getElementById("exerciseSelect");
  const entries=document.getElementById("entries");
  if(sel){
    function populate(){
      const unique=[...new Set(db.allenamenti.map(a=>a.exercise))];
      sel.innerHTML="<option value=''>--scegli esercizio--</option>";
      unique.forEach(ex=>{
        const o=document.createElement("option");
        o.value=ex; o.textContent=ex;
        sel.appendChild(o);
      });
    }
    populate();

    sel.onchange=()=>{
      entries.innerHTML="";
      const rows=db.allenamenti
        .map((r,idx)=>({...r,idx}))
        .filter(a=>a.exercise===sel.value)
        .sort((a,b)=>a.date.localeCompare(b.date));
      rows.forEach(r=>{
        const div=document.createElement("div");
        div.className="entry";
        div.innerHTML=`
          ${r.date}: ${r.sets} serie x ${r.reps} ripetizioni – Peso: ${r.weight}kg
          <button onclick="deleteProgress(${r.idx})">🗑️</button>
        `;
        entries.appendChild(div);
      });
    };
  }

});

  // --- MASSIMALI ---
  const massimaliContainer = document.getElementById("massimaliContainer");
  if (massimaliContainer) {
    const list = document.getElementById("massimaliList");

    if (db.allenamenti.length === 0) {
      list.innerHTML = "<p class='muted'>Nessun record disponibile</p>";
    } else {
      const maxMap = {};

      // Trova il peso massimo per ogni esercizio
      db.allenamenti.forEach(a => {
        if (!maxMap[a.exercise] || a.weight > maxMap[a.exercise].weight) {
          maxMap[a.exercise] = { weight: a.weight, date: a.date };
        }
      });

      // Ordina per nome esercizio
      const sorted = Object.entries(maxMap).sort((a,b) => a[0].localeCompare(b[0]));

      // Crea l'elenco
      list.innerHTML = "";
      sorted.forEach(([name, data]) => {
        const div = document.createElement("div");
        div.className = "entry";
        div.innerHTML = `
          <strong>${name}</strong><br>
          <span style="color:#ff3b30;font-size:1.2em;">${data.weight} kg</span><br>
          <small>Ultimo record: ${data.date}</small>
        `;
        list.appendChild(div);
      });
    }
  }

// --- Helpers ---
function format(sec){
  const m=String(Math.floor(sec/60)).padStart(2,"0");
  const s=String(sec%60).padStart(2,"0");
  return `${m}:${s}`;
}
function openScheda(i){
  window.parent.document.getElementById("page-frame").src=`scheda.html?id=${i}`;
}
function deleteSession(i){
  if(!confirm("Vuoi davvero eliminare questa sessione?")) return;
  const db=loadDB();
  db.sessioni.splice(i,1);
  saveDB(db);
  window.parent.document.getElementById("page-frame").src="sessione.html";
}
function editSession(i){
  window.parent.document.getElementById("page-frame").src=`sessione.html?edit=${i}`;
}
function deleteProgress(i){
  if(!confirm("Vuoi davvero eliminare questo record dai progressi?")) return;
  db.allenamenti.splice(i,1);
  saveDB(db);
  window.parent.document.getElementById("page-frame").src="progressi.html";
}