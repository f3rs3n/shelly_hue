// --- CONFIGURAZIONE: Modifica queste variabili ---
let CONFIG = {
  hueBridgeIP: "192.168.1.55",              // <-- INSERISCI L'IP DEL TUO BRIDGE
  hueUsername: "COPIA_E_INCOLLA_IL_TUO_LUNGO_USERNAME_QUI", // <-- INSERISCI IL TUO USERNAME API
  groupId: "1",                             // <-- INSERISCI L'ID DEL GRUPPO DI LUCI
  timeout: 1.5,                             // Timeout in secondi prima di attivare il fallback
  debounce_ms: 500                          // Millisecondi per ignorare pressioni multiple
};

// Variabile per tenere traccia dello stato della luce (presunto)
let isLightOn = true; 
// Variabili per il debounce e l'inizializzazione
let lastToggleTime = 0;
let scriptInitialized = false;

// Funzione che viene eseguita quando l'interruttore cambia stato
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
  // Logica di Debounce: se l'ultima azione è troppo recente, ignora questo evento
  if (now - lastToggleTime < CONFIG.debounce_ms) {
    console.log("Evento ignorato (debounce).");
    return;
  }
  lastToggleTime = now;
  
  console.log("Interruttore premuto, tento il controllo smart via API...");

  // Determina se accendere o spegnere
  isLightOn = !isLightOn;
  let body = { "on": isLightOn };

  // Costruisci l'URL per la chiamata API
  let urlToCall = "http://" + CONFIG.hueBridgeIP + "/api/" + CONFIG.hueUsername + "/groups/" + CONFIG.groupId + "/action";

  // Esegui la chiamata HTTP al Bridge
  Shelly.call(
    "HTTP.Request", // Metodo generico per le richieste HTTP
    {
      method: "PUT", // Specifica il verbo HTTP qui
      url: urlToCall,
      body: body,
      timeout: CONFIG.timeout
    },
    function (result, error_code, error_message) {
      if (error_code === 0 && result.code >= 200 && result.code < 300) {
        console.log("Successo! Comando inviato al Bridge Hue.");
      } else {
        console.log("Fallimento! Bridge non raggiungibile. Errore:", error_message);
        console.log("Eseguo il fallback: commuto il relè fisico.");
        Shelly.call("Switch.Toggle", { id: 0 });
      }
    }
  );
});

