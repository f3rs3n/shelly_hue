var SHELLY_URL = "http://192.168.XXX.XXX";
var SHELLY_RELAY = "0";
var HUE_BRIDGE_IP = "192.168.XXX.XXX";
var HUE_USERNAME = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
var HUE_DIAL_ID = "X";
var DEBOUNCE_TIME = 500;

var lastAction = 0;
var ventilationState = false;
var lastButtonEvent = 0;
var lastButtonEventTime = 0;

function toggleVentilation() {
  var now = Date.now();
  if (now - lastAction < DEBOUNCE_TIME) return;
  lastAction = now;

  ventilationState = !ventilationState;

  Shelly.call("Switch.Set", {
    id: SHELLY_RELAY,
    on: ventilationState
  }, function(result, error_code, error_message) {
    if (error_code) {
      print("Shelly control error: " + error_message);
    } else {
      print("Ventilation toggled to: " + (ventilationState ? "ON" : "OFF"));
    }
  });
}

Shelly.addEventHandler(function(event) {
  if (event.component === "input:1" && event.info.event === "single_push") {
    toggleVentilation();
  }
});

function checkHueDialState() {
  Shelly.call("HTTP.GET", {
    url: "http://" + HUE_BRIDGE_IP + "/api/" + HUE_USERNAME + "/sensors/" + HUE_DIAL_ID
  }, function(response, error_code, error_message) {
    if (error_code) {
      print("Hue dial check error: " + error_message);
      return;
    }
    try {
      var data = JSON.parse(response.body);
      if (data.state && data.state.buttonevent && data.state.lastupdated) {
        var currentButtonEvent = data.state.buttonevent;
        var currentEventTime = new Date(data.state.lastupdated).getTime();
        
        if (currentButtonEvent === 4002 && (currentEventTime > lastButtonEventTime)) {
          print("Hue dial button pressed, toggling ventilation");
          lastButtonEventTime = currentEventTime;
          toggleVentilation();
        }
        
        lastButtonEvent = currentButtonEvent;
      }
    } catch (e) {
      print("Hue data parse error: " + e);
    }
  });
}

// Initial state check
checkHueDialState();

// Set up periodic checking
Timer.set(1000, true, checkHueDialState);
