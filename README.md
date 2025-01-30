# shelly_hue
Controlling Hue lights with Shelly Switch Relays, and Shelly Relays with Hue Dial Switches

I created this project because I was struggling to integrate my Hue lights and Hue switches and the relays I was hoping to make the switches smart.

Problems: 

1) First and foremost, automations in Hue only work within the Hue ecosystem
2) Replacing switches with Hue switches is expensive, redundant, and requires battery replacement
3) Hue relay battery needs to be replaced at best every couple of years
4) To automate my bathroom ventilation I would need an actual relay, which is not supported by Hue relays
5) Google Home automations is very limited, even when using their Script editor, especially regarding what can be used as triggers - e.g. Hue Dial Switch events or Shelly events are not supported

Solution:

1) Turns out that Hue has an open API endpoint
2) Shelly also has an API endpoint **and** supports javascript
3) So it's possible to orchestrate actions between the two systems

Caveats:

1) The Hue "Natural Light" scene is not directly discoverable, but something similar can be emulated
2) The Hue Bridge doesn't support JS scripts
3) Hue Dial Switch events can't be listened to without a separate and more capable Zigbee bridge, so I had to use brute force to enable Shelly relay to know when someone presses the Hue Switch

Step by step on Hue side:

1) Create an API token (i.e. Hue username) using their API endpoint
2) For that, open https://[Hue URL]/debug/clip.html
3) Press the Hue Bridge button and within 30 seconds create the username
4) From them on, use that username to send API calls to Hue
5) Play around and collect information from your system (lamp ids, group ids, scene ids, sensor ids) using commands like those listed below:

- Retrieve info from all lamps
Under URL: /api/[Hue Username]/lights
Push [GET]

- Turn off lamp 4
Under URL: /api/[Hue Username]/lights/4/state
With Message Body: {"on": false}
Push [PUT]

Other Endpoints:
/api/username/lights            Get information about all lights.
/api/username/lights/1			    Get information about a specific light (replace 1 with the light ID).
/api/username/lights/1/state	  Control a specific light (e.g., turn on/off, change color, brightness).
/api/username/groups	     		  Get information about all groups.
/api/username/groups/1/action	  Control a specific group (e.g., turn on/off all lights in the group).
/api/username/scenes		    	  Get information about all scenes.
/api/username/schedules	      	Get information about all schedules.

Step by step on Shelly side:

1) Make sure the relays are in button and detached mode
2) Open the script editor, add the scripts found in this repository, save and start them
3) Test and troubleshoot until you set all parameters correctly

Hope this helps others too!
