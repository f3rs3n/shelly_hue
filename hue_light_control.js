var HUE_URL = "http://192.168.XXX.XXX";
var HUE_USERNAME = "XXXXXXXXXXXXXXXXXXX";
var HUE_GROUP = "XX";
var SCENE_SCHEDULE = [
  {time: [0, 0], id: 'XXXXXXXXXXXX'},   // Nightlight
  {time: [7, 0], id: 'XXXXXXXXXXXX'},   // Energize
  {time: [10, 0], id: 'XXXXXXXXXXXX'},  // Concentrate
  {time: [18, 0], id: 'XXXXXXXXXXXX'},  // Read
  {time: [20, 0], id: 'XXXXXXXXXXXX'},  // Relax
  {time: [22, 0], id: 'XXXXXXXXXXXX'}   // Rest
];
let SHELLY_INPUT = "input:1";
var DEBOUNCE = 500;

var lastToggle = 0;
var currentState = false;

function getCurrentScene() {
  try {
    var now = new Date();
    var currentMins = now.getHours() * 60 + now.getMinutes();
    
    for (var i = SCENE_SCHEDULE.length - 1; i >= 0; i--) {
      var sceneMins = SCENE_SCHEDULE[i].time[0] * 60 + SCENE_SCHEDULE[i].time[1];
      if (sceneMins <= currentMins) {
        return SCENE_SCHEDULE[i].id;
      }
    }
    return SCENE_SCHEDULE[4].id;
  } catch(e) {
    print("Scene error: " + e);
    return SCENE_SCHEDULE[4].id;
  }
}

function checkState(callback) {
  Shelly.call("HTTP.Request", {
    method: "GET",
    url: HUE_URL + "/api/" + HUE_USERNAME + "/groups/" + HUE_GROUP
  }, function(res, err) {
    if (!err && res.code === 200) {
      try {
        var data = JSON.parse(res.body);
        callback(data.state.any_on);
      } catch(e) {
        callback(currentState);
      }
    } else {
      callback(currentState);
    }
  });
}

function toggleAction() {
  var now = Date.now();
  if (now - lastToggle < DEBOUNCE) return;
  lastToggle = now;
  
  checkState(function(isOn) {
    var action = isOn ? {on: false} : {scene: getCurrentScene()};
    
    Shelly.call("HTTP.Request", {
      method: "PUT",
      url: HUE_URL + "/api/" + HUE_USERNAME + "/groups/" + HUE_GROUP + "/action",
      body: JSON.stringify(action)
    }, function(res, err) {
      if (!err && res.code === 200) {
        currentState = !isOn;
      }
    });
  });
}

Shelly.addEventHandler(function(event) {
  if (event.component === SHELLY_INPUT && 
     (event.info.event === "btn_down" || event.info.event === "btn_up")) {
    toggleAction();
  }
});
