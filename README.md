# Controllo Luci Hue con Shelly e Fallback Automatico

Questo progetto fornisce una soluzione robusta per controllare le lampadine Philips Hue utilizzando interruttori a muro standard, grazie all'integrazione con un relè smart Shelly (Gen3/Plus o superiore).

L'obiettivo principale è duplice:

1.  **Mantenere l'uso degli interruttori fisici** esistenti per un controllo intuitivo.
2.  **Garantire il funzionamento "di emergenza"**: se il Bridge Hue o la rete Wi-Fi non sono disponibili, l'interruttore torna a funzionare come un interruttore tradizionale, tagliando o ripristinando la corrente.

## Come Funziona

La soluzione si basa su uno script eseguito direttamente a bordo del dispositivo Shelly, che implementa una logica di "fallback":

1.  **Funzionamento Normale**: Alla pressione dell'interruttore, lo Shelly invia un comando API (webhook) al Bridge Philips Hue per accendere, spegnere o cambiare scena. Il relè fisico dello Shelly rimane sempre attivo, garantendo alimentazione costante alla lampadina Hue.
2.  **Funzionamento in Fallback**: Se il comando API fallisce (perché il Bridge è irraggiungibile), lo script se ne accorge e commuta il relè fisico dello Shelly, comportandosi come un interruttore standard e garantendo il controllo della luce.

## Descrizione degli Script

In questa repository trovi due versioni dello script, da usare alternativamente.

### 1. `hue-control-simple.js`

**La scelta per la massima semplicità e affidabilità.**

* **Funzione**: Esegue un semplice toggle On/Off.
* **Comportamento all'accensione**: Ripristina la luce all'ultimo stato di colore e luminosità utilizzato (comportamento standard di Hue all'accensione via software).
* **Ideale per**: Chiunque voglia la soluzione più diretta e a prova di errore per garantire che le luci si accendano e si spengano sempre.

### 2. `hue-control-smart.js`

**La scelta avanzata per un'illuminazione dinamica.**

* **Funzione**: Esegue un toggle intelligente. Quando si spegne, invia un comando "off". Quando si accende, seleziona e attiva una scena Hue specifica in base all'ora del giorno.
* **Comportamento all'accensione**: Attiva una scena predefinita (es. "Energizzante" al mattino, "Rilassante" alla sera).
* **Ideale per**: Chi vuole un'automazione più sofisticata, senza rinunciare alla sicurezza del fallback.

## Guida all'Installazione

### Prerequisiti

1.  **Hardware**: Uno Shelly con supporto scripting (es. Shelly PM Mini Gen3, Plus 1, Plus 2PM, etc.).
2.  **Informazioni dal Bridge Hue**:
    * L'**Indirizzo IP** statico del tuo Bridge.
    * Un **Username API** (token di autorizzazione).
    * L'**ID del Gruppo** di luci che vuoi controllare.
    * (Solo per lo script smart) Gli **ID delle Scene** che vuoi utilizzare.

### Come ottenere le informazioni dal Bridge Hue

1.  **Trova l'IP del Bridge**: Dall'app Hue o dal tuo router.
2.  **Genera l'Username**:
    * Vai su `http://<IP_DEL_BRIDGE>/debug/clip.html`.
    * In `URL`, metti `/api`.
    * In `Message Body`, scrivi `{"devicetype":"shelly_script#casa"}`.
    * **Premi il pulsante fisico sul Bridge Hue**.
    * Entro 30 secondi, clicca sul pulsante `POST` nella pagina web.
    * Copia il valore dell'username dalla risposta.
3.  **Trova ID di Gruppi e Scene**:
    * Sempre nella stessa pagina, imposta il metodo su `GET`.
    * Usa l'URL `/api/<TUO_USERNAME>/groups` per vedere tutti i gruppi e i loro ID.
    * Usa l'URL `/api/<TUO_USERNAME>/scenes` per vedere tutte le scene e i loro ID.

### Configurazione dello Shelly

1.  **Installazione Fisica**: Installa lo Shelly dietro l'interruttore secondo lo schema standard (L/N per alimentazione, O per l'uscita alla lampadina, SW per l'ingresso dall'interruttore).
2.  **Impostazioni Iniziali**:
    * Accedi all'interfaccia web dello Shelly.
    * Vai su **Settings > Input/Output Settings > `switch:0`**.
    * Imposta **Input Mode** su `Switch`.
    * Imposta **Power on default** su `On` (fondamentale!).
3.  **Caricamento dello Script**:
    * Vai alla sezione **Scripts**.
    * Crea un nuovo script.
    * Copia e incolla il contenuto di `hue-control-simple.js` o `hue-control-smart.js`.
    * **Modifica la sezione `CONFIG`** all'inizio del file con le tue informazioni (IP, Username, ID).
    * Salva e attiva lo script.
