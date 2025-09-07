// --- CONFIGURAZIONE: Modifica queste variabili ---
let CONFIG = {
  hueBridgeIP: "192.168.1.55", // <-- INSERISCI L'IP DEL TUO BRIDGE
  hueUsername: "COPIA_E_INCOLLA_IL_TUO_LUNGO_USERNAME_QUI", // <-- INSERISCI IL TUO USERNAME API
  groupId: "1", // <-- INSERISCI L'ID DEL GRUPPO DI LUCI
  timeout: 1.5, // Timeout in secondi prima del fallback
  debounce_ms: 500, // Millisecondi per ignorare pressioni multiple
  
  // Aggiungi gli ID delle tue scene preferite qui
  SCENE_SCHEDULE: [
    { time: [0, 0], id: 'ID_SCENA_NOTTURNA' },   // Esempio: Luce notturna
    { time: [7, 0], id: 'ID_SCENA_MATTINO' },    // Esempio: Energizzante
    { time: [18, 0], id: 'ID_SCENA_SERA' },     // Esempio: Rilassante
    { time: [22, 0], id: 'ID_SCENA_RIPOSO' }     // Esempio: Riposo
  ]
};

// Variabili per il debounce e l'inizializzazione
let lastToggleTime = 0;
let scriptInitialized = false;

// Funzione per ottenere la scena corretta in base all'ora
function getCurrentSceneId() {
  let now = new Date();
  let currentMins = now.getHours() * 60 + now.getMinutes();
  
  for (let i = CONFIG.SCENE_SCHEDULE.length - 1; i >= 0; i--) {
    let sceneMins = CONFIG.SCENE_SCHEDULE[i].time[0] * 60 + CONFIG.SCENE_SCHEDULE[i].time[1];
    if (sceneMins <= currentMins) {
      return CONFIG.SCENE_SCHEDULE[i].id;
    }
  }
  return CONFIG.SCENE_SCHEDULE[0].id;
}

// Funzione principale eseguita alla pressione dell'interruttore
Shelly.addEventHandler(function(event) {
  // Esegui solo se l'evento proviene dal nostro interruttore fisico (component "input:0")
  if (event.component !== "input:0") return;
  
  // Ignora il primo evento che si verifica all'avvio dello script
  if (!scriptInitialized) {
    scriptInitialized = true;
    console.log("Script inizializzato, ignoro il primo evento di stato.");
    return;
  }
  
  let now = Date.now();
  // Logica di Debounce
  if (now - lastToggleTime < CONFIG.debounce_ms) {
    console.log("Evento ignorato (debounce).");
    return;
  }
  lastToggleTime = now;

  console.log("Interruttore premuto, tento controllo smart...");

  let url = "http://" + CONFIG.hueBridgeIP + "/api/" + CONFIG.hueUsername + "/groups/" + CONFIG.groupId;

  // 1. Verifichiamo lo stato attuale del gruppo
  Shelly.call(
    "HTTP.Request",
    { method: "GET", url: url, timeout: CONFIG.timeout },
    function(result, error_code, error_message) {
      let isCurrentlyOn = false;
      if (error_code === 0 && result.code === 200) {
        try {
          isCurrentlyOn = JSON.parse(result.body).state.any_on;
        } catch(e) { /* non fa nulla */ }
      }
      
      // 2. Decidiamo l'azione da compiere
      let actionBody = isCurrentlyOn ? { "on": false } : { "scene": getCurrentSceneId() };
      
      // 3. Inviamo il comando di azione al Bridge
      Shelly.call(
        "HTTP.Request",
        {
          method: "PUT",
          url: url + "/action",
          body: actionBody,
          timeout: CONFIG.timeout
        },
        function (res, err_code, err_msg) {
          if (err_code === 0 && res.code >= 200 && res.code < 300) {
            console.log("Successo! Comando inviato al Bridge Hue.");
          } else {
            console.log("Fallimento! Bridge non raggiungibile. Errore:", err_msg);
            console.log("Eseguo il fallback.");
            Shelly.call("Switch.Toggle", { id: 0 }); // Commuta il relè fisico!
          }
        }
      );
    }
  );
});

