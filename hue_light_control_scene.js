// --- HUE CONTROL SMART ---
// Script per Shelly Gen3/Plus
// Esegue un toggle intelligente per un gruppo di luci Philips Hue:
// - Quando si accende, attiva una scena basata sull'ora del giorno.
// - Quando si spegne, invia un comando "off".
// Include una logica di fallback per commutare il relè fisico se il Bridge Hue non è raggiungibile.
//
// OBIETTIVO: Automazione avanzata con la sicurezza del fallback.

// --- CONFIGURAZIONE: Modifica queste righe con i tuoi dati ---
let CONFIG = {
  hueBridgeIP: "192.168.1.55", // <-- INSERISCI L'IP DEL TUO BRIDGE HUE
  hueUsername: "xxxxxxxxxxxxxxxxxxxxxxxxxx", // <-- INSERISCI IL TUO USERNAME API
  groupId: "1", // <-- INSERISCI L'ID DEL GRUPPO DI LUCI
  timeout: 1.5, // Secondi di attesa prima di attivare il fallback
  
  // Aggiungi gli ID delle tue scene preferite qui.
  // L'ordine è importante: dalla prima ora del giorno all'ultima.
  SCENE_SCHEDULE: [
    { time: [0, 0], id: 'xxxxxxxxxxxxxxxx' },   // Scena da mezzanotte (es. Luce Notturna)
    { time: [7, 0], id: 'xxxxxxxxxxxxxxxx' },   // Scena dalle 7:00 (es. Energizzante)
    { time: [18, 0], id: 'xxxxxxxxxxxxxxxx' },  // Scena dalle 18:00 (es. Rilassante)
    { time: [22, 0], id: 'xxxxxxxxxxxxxxxx' }   // Scena dalle 22:00 (es. Riposo)
  ]
};

// Funzione per ottenere l'ID della scena corretta in base all'ora
function getCurrentSceneId() {
  let now = new Date();
  let currentMins = now.getHours() * 60 + now.getMinutes();
  
  for (let i = CONFIG.SCENE_SCHEDULE.length - 1; i >= 0; i--) {
    let sceneMins = CONFIG.SCENE_SCHEDULE[i].time[0] * 60 + CONFIG.SCENE_SCHEDULE[i].time[1];
    if (sceneMins <= currentMins) {
      return CONFIG.SCENE_SCHEDULE[i].id;
    }
  }
  // Se nessuna corrisponde (impossibile), restituisce la prima della lista
  return CONFIG.SCENE_SCHEDULE[0].id;
}

// Funzione principale eseguita alla pressione dell'interruttore
Shelly.addEventHandler(function(event) {
  if (event.info.id !== 0 || event.info.event !== "toggle") return; // Esegui solo per l'evento di toggle dell'input 0
  
  console.log("Interruttore premuto, tento controllo smart...");

  let url = "http://" + CONFIG.hueBridgeIP + "/api/" + CONFIG.hueUsername + "/groups/" + CONFIG.groupId;

  // 1. Prima verifichiamo lo stato attuale del gruppo di luci per un toggle affidabile
  Shelly.call("HTTP.GET", url, null, function(result, error_code, error_message) {
    let isCurrentlyOn = false;

    // Se la verifica dello stato fallisce, non possiamo sapere cosa fare.
    // La cosa più sicura è attivare subito il fallback.
    if (error_code !== 0 || result.code !== 200) {
        console.log("Fallimento nel verificare lo stato del Bridge. Eseguo fallback.");
        Shelly.call("Switch.Toggle", { id: 0 });
        return; // Interrompe l'esecuzione
    }

    // Se la verifica ha successo, leggiamo lo stato
    try {
      isCurrentlyOn = JSON.parse(result.body).state.any_on;
    } catch(e) { /* non fa nulla, isCurrentlyOn rimane false */ }
    
    // 2. Decidiamo l'azione da compiere in base allo stato attuale
    let actionBody = isCurrentlyOn ? { "on": false } : { "scene": getCurrentSceneId() };
    
    // 3. Inviamo il comando di azione al Bridge Hue
    Shelly.call(
      "HTTP.PUT",
      url + "/action",
      actionBody,
      function (res, err_code, err_msg) {
        if (err_code === 0 && res.code >= 200 && res.code < 300) {
          console.log("Successo! Comando inviato al Bridge Hue.");
        } else {
          console.log("Fallimento! Il Bridge non ha eseguito il comando. Eseguo fallback.");
          Shelly.call("Switch.Toggle", { id: 0 }); // Commuta il relè fisico!
        }
      },
      { timeout: CONFIG.timeout }
    );
  });
});
