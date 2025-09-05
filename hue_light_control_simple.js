// --- HUE CONTROL SIMPLE ---
// Script per Shelly Gen3/Plus
// Esegue un semplice toggle On/Off per un gruppo di luci Philips Hue.
// Include una logica di fallback per commutare il relè fisico se il Bridge Hue non è raggiungibile.
//
// OBIETTIVO: Massima affidabilità.

// --- CONFIGURAZIONE: Modifica queste righe con i tuoi dati ---
let CONFIG = {
  hueBridgeIP: "192.168.1.55",              // <-- INSERISCI L'IP DEL TUO BRIDGE HUE
  hueUsername: "xxxxxxxxxxxxxxxxxxxxxxxxxx", // <-- INSERISCI IL TUO USERNAME API
  groupId: "1",                             // <-- INSERISCI L'ID DEL GRUPPO DI LUCI
  timeout: 1.5,                             // Secondi di attesa prima di attivare il fallback
};

// Variabile per tenere traccia dello stato desiderato della luce.
// NOTA: Questo stato potrebbe non essere sincronizzato con lo stato reale se la luce
// viene controllata da altri mezzi (app, assistenti vocali). Per un uso base va bene.
let isLightOn = false; 

// Funzione che viene eseguita quando l'interruttore cambia stato
Shelly.addEventHandler(function(event) {
  // Esegui solo se l'evento proviene dall'interruttore corretto (id:0)
  // e se è un evento di tipo "toggle" (cambio di stato)
  if (event.info.id !== 0 || event.info.event !== "toggle") return;
  
  console.log("Interruttore premuto, tento il controllo smart...");

  // Inverte lo stato desiderato
  isLightOn = !isLightOn;
  let body = { "on": isLightOn };

  // Costruisce l'URL per la chiamata API
  let urlToCall = "http://" + CONFIG.hueBridgeIP + "/api/" + CONFIG.hueUsername + "/groups/" + CONFIG.groupId + "/action";

  // Esegue la chiamata HTTP al Bridge
  Shelly.call(
    "HTTP.PUT", // Il metodo per cambiare stato su Hue è PUT
    urlToCall,
    body,
    function (result, error_code, error_message) {
      // Questa funzione (callback) gestisce la risposta del server
      
      // Controlla se la chiamata ha avuto successo
      if (error_code === 0 && result.code >= 200 && result.code < 300) {
        console.log("Successo! Comando inviato al Bridge Hue.");
        // Non si fa nulla con il relè, il Bridge ha gestito la luce.
      } else {
        // La chiamata è fallita (timeout o altro errore)
        console.log("Fallimento! Bridge non raggiungibile. Errore:", error_message);
        console.log("Eseguo il fallback: commuto il relè fisico.");
        
        // Esegue l'azione di fallback: commuta lo stato del relè locale
        Shelly.call("Switch.Toggle", { id: 0 });
      }
    },
    {timeout: CONFIG.timeout} // Passa l'oggetto di configurazione con il timeout
  );
});
