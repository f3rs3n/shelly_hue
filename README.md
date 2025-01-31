# Shelly_Hue

**Integrating Hue Lights with Shelly Switch Relays and Hue Dial Switches**

This project bridges the gap between Philips Hue lights and switches with Shelly relays, enabling seamless integration and automation. The goal is to make switches smarter without relying solely on the Hue ecosystem, while also addressing limitations in Google Home automation.

---

## **Motivation**

The project was born out of the following challenges:

1. **Hue Ecosystem Limitations**: Automations within the Hue system are restricted to its ecosystem.
2. **Cost and Maintenance**: Replacing traditional switches with Hue switches is expensive, redundant, and requires frequent battery replacements.
3. **Relay Battery Life**: Hue relay batteries need replacement every couple of years.
4. **Ventilation Automation**: Automating devices like bathroom ventilation requires actual relays, which are unsupported by Hue.
5. **Google Home Constraints**: Google Home automations, even with its Script Editor, lack flexibility—e.g., events from Hue Dial Switches or Shelly devices cannot be used as triggers.

---

## **Solution**

The integration leverages the open APIs provided by both Hue and Shelly:

1. **Hue API**: Allows control of lights, groups, and scenes programmatically.
2. **Shelly API with JavaScript Support**: Enables scripting for custom automations.
3. **Orchestration**: Actions between the two systems are coordinated through API calls.

---

## **Caveats**

1. The Hue "Natural Light" scene is not directly accessible but can be emulated.
2. The Hue Bridge does not support JavaScript scripts directly.
3. Listening to Hue Dial Switch events requires a more capable Zigbee bridge; brute force methods were used to notify Shelly relays when a Hue switch is pressed.

---

## **Setup Instructions**

### **Hue Integration**

1. **Create an API Token (Username)**:
   - Open the URL: `https://[Hue_Bridge_IP]/debug/clip.html`.
   - Press the physical button on the Hue Bridge and create a username within 30 seconds using the API interface.

2. **Use the Username for API Calls**:
   - Use this token to interact with your Hue system via API calls.

3. **Explore Your System**:
   - Retrieve information about lamps, groups, scenes, and sensors using commands like these:

   #### Example API Commands:
   - Retrieve all lamps:
     ```
     URL: /api/[Hue_Username]/lights
     Method: GET
     ```

   - Turn off lamp 4:
     ```
     URL: /api/[Hue_Username]/lights/4/state
     Method: PUT
     Body: {"on": false}
     ```

   #### Other Useful Endpoints:
   | Endpoint                           | Description                                 |
   |------------------------------------|---------------------------------------------|
   | `/api/[username]/lights`           | Get information about all lights.          |
   | `/api/[username]/lights/1`         | Get details about a specific light (ID=1). |
   | `/api/[username]/lights/1/state`   | Control a specific light (e.g., on/off).   |
   | `/api/[username]/groups`           | Get information about all groups.          |
   | `/api/[username]/groups/1/action`  | Control a specific group of lights.        |
   | `/api/[username]/scenes`           | Retrieve all scenes.                       |
   | `/api/[username]/schedules`        | Get all schedules.                         |

---

### **Shelly Integration**

1. **Configure Relays**:
   - Set Shelly relays to *Button* and *Detached Mode*.

2. **Add Scripts**:
   - Open the Shelly script editor.
   - Add the scripts provided in this repository.
   - Save and start the scripts.

3. **Test and Troubleshoot**:
   - Adjust parameters as needed to ensure proper functionality.

---

## **Conclusion**

This project provides a cost-effective solution to integrate Hue lights with Shelly relays while overcoming ecosystem limitations and automation constraints. By leveraging open APIs and scripting capabilities, you can achieve advanced home automation without expensive proprietary hardware.
