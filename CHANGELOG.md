# Changelog

## 1.3.21-cp.1

- Replaced remaining example Access Point IDs with the placeholder `DEINE_ACCEESPOINT_ID`.
- Updated package and internal plugin version to `1.3.21-cp.1`.

## 1.3.21-cp.1

- Added explicit attribution that this CP package is based on the original `homebridge-homematicip` project by marcsowen.
- Added an Attribution / Herkunft section to the README with a link to the original project.
- Added package contributor metadata for the original project.
- Updated the internal protocol/log version to `1.3.21-cp.1`.
- Kept package name `homebridge-homematicip-cp`, display name `Homebridge Homematicip` and platform alias `HomematicIP`.
- Retains all functionality from 1.3.19-cp.1.


## 1.3.19-cp.1

- GitHub-ready P-Black build.
- Repository, homepage and issue links point to `https://github.com/P-Black/homebridge-homematicip-cp`.
- Package name remains `homebridge-homematicip-cp`; Homebridge platform alias remains `HomematicIP`.
- Retains all functionality from 1.3.18-cp.1.

## 1.3.18-cp.1

- Renamed package from `homebridge-homematicip` to `homebridge-homematicip-cp` so the Homebridge UI no longer maps the local CP build to the legacy npm registry owner.
- Kept the Homebridge platform alias `HomematicIP`, so existing config blocks continue to use `"platform": "HomematicIP"`.
- Kept display name `Homebridge Homematicip` and P-Black metadata.
- Retained all changes from 1.3.17-cp.1 including smoke detector names, buttonMode, climateDeviceMode, DLD fallback, room names and improved logs.

## 1.3.18-cp.1

- Finaler CP-Build mit bereinigter lokaler Plugin-/Config-Darstellung.
- Paket-Metadaten ergänzt: `displayName` ist jetzt `Homebridge Homematicip`.
- Paket-Metadaten, Repository, Homepage und Issues zeigen auf `P-Black/homebridge-homematicip-cp`.
- README auf finale CP-Dokumentation gekürzt und bereinigt.
- Interne Protokollversion auf `1.3.18-cp.1` gesetzt.
- Alle Funktionen aus `1.3.16-cp.1` bleiben enthalten, inklusive Rauchwarnmelder-Namen, `buttonMode`, `climateDeviceMode`, HmIP-DLD-Fallback und redigierte Logs.


## 1.3.16-cp.1

- Improved HomeKit naming for smoke detectors.
- SmokeSensor services now explicitly use the Homematic IP device label, so devices such as "Rauchwarnmelder Vorraum" are easier to identify in Apple Home and automations.
- Accessory Information now also sets the HomeKit Name characteristic to the effective Homematic IP display name.

## 1.3.15-cp.1

- Final CP cleanup build.
- Fixed internal plugin version log from `1.3.13-cp.1` to `1.3.15-cp.1`.
- Cleaned package metadata and public links to `P-Black/homebridge-homematicip-cp`.
- Removed remaining original-maintainer references from package metadata and CP documentation.
- Kept all recent CP features: `buttonMode`, `climateDeviceMode`, HmIP-DLD `openLatchFallback`, redacted API logs, clearer INVALID_AUTHORIZATION_PIN diagnostics, room-name support, upstream 1.3.1 device mappings, and Homebridge 2.x compatibility.

## 1.3.14-cp.1

- Added `climateDeviceMode` to control how Homematic IP climate devices are exposed in Apple Home.
- New modes: `auto`, `sensor` and `thermostat`; supported globally and per device through the `devices` object.
- In `auto` mode, HmIP-STH/STHD style temperature/humidity devices are presented as pure TemperatureSensor + HumiditySensor, while regelbare Wandthermostate such as HmIP-WTH-2 remain HomeKit Thermostats.
- Legacy `asClimateSensor` remains supported and maps to `climateDeviceMode: sensor` when no explicit climate mode is set.
- When a cached accessory changes from Thermostat to Climate Sensor or back, stale HomeKit services are removed automatically where possible.

## 1.3.13-cp.1

- Added `buttonMode` for Homematic IP wall buttons. Supported values: `hidden`, `stateless` and `switch`.
- `buttonMode: hidden` hides all Homematic IP wall buttons/remotes from HomeKit unless overridden per device.
- Per-device `buttonMode` overrides are supported through the `devices` object.
- Kept `buttonAsSwitch` as a legacy compatibility option from 1.3.12-cp.1; `buttonMode` is preferred for new configs.
- When a wall button is hidden, the plugin now logs an explicit message similar to the ignored Access Point log.
- The typo `statless` is accepted as an alias for `stateless`.

## 1.3.12-cp.1

- Added optional virtual Switch mode for Homematic IP wall buttons such as HmIP-WRC2, HmIP-WRC6, HmIP-BRC2 and HmIP-WRCC2.
- New options: `buttonAsSwitch`, `buttonSwitchMode` (`toggle` or `momentary`) and `buttonMomentaryResetMs`.
- Default behaviour remains unchanged: real wall buttons are still exposed as HomeKit `StatelessProgrammableSwitch`, which is the native HomeKit representation for button events.
- When `buttonAsSwitch` is enabled, every button channel is exposed as a virtual HomeKit switch. This creates a HomeKit-visible state, but it is not a real Homematic IP device state.

- Merged selected upstream 1.3.1 device support into the CP branch while preserving CP changes.
- Added support for additional device classes from upstream: HmIPButton event handling, DIN_RAIL_DIMMER_3 multi-channel dimmer, WALL_MOUNTED_GARAGE_DOOR_CONTROLLER, WEATHER_SENSOR, WEATHER_SENSOR_PLUS, WEATHER_SENSOR_PRO.
- Added additional device type mappings: TEMPERATURE_HUMIDITY_SENSOR_COMPACT, HEATING_THERMOSTAT_COMPACT_PLUS, FULL_FLUSH_INPUT_SWITCH, BRAND_SWITCH_2, WIRED_SWITCH_4, SWITCH_POWER_SUPPLY, PUSH_BUTTON_FLAT and BRAND_PUSH_BUTTON.
- Added DEVICE_CHANNEL_EVENT handling for button events.
- Kept CP features: Homebridge 2.x compatibility, improved pairing GUI, room-name formatting, HmIP-DLD openLatchFallback, global authorizationPin compatibility, redacted API logs, and clearer INVALID_AUTHORIZATION_PIN logging.

# 1.3.10-cp.1

- Added a clear HmIP-DLD door lock diagnostic for Homematic-IP API responses with `INVALID_AUTHORIZATION_PIN`.
- The log now explicitly says: `Invalid authorization PIN for door lock drive. Check the access authorization PIN in the Homematic IP app.`
- If Homematic IP returns a `blockingTime`, the plugin now logs when the temporary retry block should end.
- README and Homebridge UI help now clarify that `authorizationPin` must stay empty when the Homematic-IP door lock setup does not require a PIN.

# 1.3.9-cp.1

- Added `openLatchFallback` for HmIP-DLD door lock drives.
- When `openLatch` sends `OPEN` and the Homematic-IP Cloud rejects it, the plugin can automatically retry with `UNLOCKED`.
- Improved API error logging: HTTP error logs now include response headers and response body, while sensitive request values such as tokens and authorization PINs are redacted.
- Keeps compatibility with global `authorizationPin` from older Homebridge 1.8.5 configurations.

# 1.3.8-cp.1

- Fixed HmIP-DLD door lock drive authorization PIN handling.
- The global `authorizationPin` option from older Homebridge 1.8.5 configurations is now used as fallback for door lock commands.
- Device-specific `authorizationPin` and `pin` remain supported; precedence is device `authorizationPin`, device `pin`, then global `authorizationPin`.
- Homebridge UI schema now documents the global door lock Authorization PIN separately from the pairing PIN.

# 1.3.8-cp.1

### CP improvements

- Added optional Homematic-IP room-name adoption for HomeKit accessory names.
- New GUI options: `useRoomNames` and `roomNameFormat`.
- The plugin attempts to detect `ROOM` groups from the Homematic-IP Cloud state and can build names such as `Wohnzimmer Rollo links` using the format `{room} {name}`.
- Existing cached accessories are renamed on update when the generated display name changes.
- HomeKit room assignment itself is not forced; the room name is added to the accessory name for easier assignment in Apple Home.

# 1.3.6-cp.1

### CP improvements

- Documented and exposed existing per-device options in the Homebridge UI schema.
- Added GUI/help text for hiding `HOME_SECURITY_SYSTEM` via `devices.HOME_SECURITY_SYSTEM.hide`.
- Added GUI/help text for HmIP-DLD door lock drive `openLatch`, which sends `OPEN` instead of `UNLOCKED` when HomeKit unlocks the door.
- Added GUI/help text for optional per-device `pin`, `lightSwitch`, and `simpleSwitch` options.
- No breaking config change: existing `devices` blocks continue to work.

# 1.3.5-cp.1

- Added first HomeKit mapping for Homematic IP wall buttons/remotes (`PUSH_BUTTON`, `PUSH_BUTTON_6`) as `StatelessProgrammableSwitch` services.
- Added first HomeKit mapping for `WALL_MOUNTED_KEY_PAD` as stateless button services when button channels are visible in the cloud API.
- Treats `HOME_CONTROL_ACCESS_POINT` as a known, intentionally ignored device instead of an unimplemented device warning.
- Keeps the existing CP release-note cleanup, P-Black metadata and improved GUI pairing from previous CP builds.

# 1.3.4-cp.1

- Verbliebene Repository- und Autor-Hinweise auf `P-Black` umgestellt.
- Bereinigte CP-Release-Notes und verbessertes GUI-Pairing aus `1.3.3-cp.1` beibehalten.

## 1.3.3-cp.1

- Verbesserte Homebridge-UI-Konfiguration für das Homematic-IP-Pairing.
- Auth-Token-Feld im GUI auf den ursprünglichen Plugin-Feldnamen `auth_token` vereinheitlicht.
- PIN-Feld als temporäres Pairing-Feld beschrieben und als Passwortfeld markiert.
- Pairing-Logausgaben verständlicher gemacht: Schritt-für-Schritt-Hinweise, Token-Ziel-Feld und Hinweis zum Entfernen der PIN.
- Falls `auth_token` und `authToken` parallel gesetzt sind, wird `auth_token` bevorzugt und ein Hinweis geloggt.

## 1.3.2-cp.1 (2026-06-27)

### CP/Homebridge 2 test build

- Version bewusst über `1.3.1` gesetzt, damit Homebridge UI diese lokale CP-Version nicht als Update auf die öffentliche npm-Version `1.3.1` anbietet.
- Release Notes bereinigt: Diese CP-Version basiert technisch auf der gelieferten 1.1.0-Codebasis mit lokalen Modernisierungen, nicht auf den öffentlichen 1.2.x/1.3.x-Änderungen.
- Homebridge-2.x/Node-20+-Modernisierung aus `1.1.1-cp.1` beibehalten.
- `node-fetch` durch natives Node-`fetch` ersetzt.
- `config.schema.json` für Homebridge UI ergänzt.
- Config-Aliase `accessPoint`/`authToken` sowie `access_point`/`auth_token` unterstützt.
- Sensible Werte wie Token, ClientAuth und PIN werden in Logs redigiert.
- Erfolgreich getestet: Pairing, Child Bridge, 44 Accessories aus Homematic IP, WebSocket-Verbindung.

### Known limitations

- HmIP-WRC2 / HmIP-WRC6 Wandtaster sind noch nicht als HomeKit-Buttons umgesetzt.
- HmIP-WKP Keypad ist noch nicht umgesetzt.
- HmIP-HAP Access Point wird weiterhin ignoriert bzw. nicht als HomeKit-Gerät angelegt.

## 1.1.0 (2022-10-12)

### Improvements

- **WallMountedThermostat**: Improved handling of heating/cooling state (@aceg1k)
- **WallMountedThermostat**: Guard against unnecessary API calls (@aceg1k)
- **API call limited**: Added reservoir and ability to prioritize API calls (@aceg1k)
- **General**: Version bumps of dependencies

## 1.0.1 (2022-09-05)

### Bugfix

- **Switches**: Fixed "characteristic was supplied illegal value: null"

## 1.0.0 (2022-08-31)

### New devices

- **HmIP-BLS**: Added support for HmIP-BLS door lock sensor (Many thanks to @smhex)

### Improvements

- **ClimateSensor**: Added switch to force a thermostat device to act as a climate sensor (Many thanks to @ohueter)
- **General**: It's time for version 1.0.0!
- **General**: Version bumps of dependencies.

## 0.8.0 (2022-05-11)

### New devices

- **HmIP-DLS**: Added support for HmIP-DLS door lock sensor (Many thanks to @smhex)

### Improvements

- **General**: Version bumps of dependencies.
- **General**: Switched to pnpm instead of npm.

### Bugfix

- **SecuritySystem**: Fixed erroneous state change within the home app.

## 0.7.2 (2021-12-29)

### Improvements

- **HmIP-MOD**: Added "lightSwitch" config option to disable light switch if not available.
- **General**: Reduced verbosity of log messages. Some frequent log messages have log level debug now.

### Bugfix

- **General**: Fixed removal of cached accessories which were removed from HmIP cloud.

## 0.7.1 (2021-12-21)

### Improvements

- **General**: Added per-device config. All devices can be hidden by setting config.json option "hidden": true. See
  [GitHub Wiki](https://github.com/P-Black/homebridge-homematicip-cp/wiki) for details.
- **HmIP-DLD**: New option "openLatch". When set to true, opening the lock will open the door completely by pulling
  the door latch.

### Bugfix

- **HmIP-DLD**: Lock target state was not always updated correctly displaying an opening/closing animation in Home app.

## 0.7.0 (2021-12-18)

### New devices

- **HmIP-DLD**: Added support for HmIP door lock drive - thanks to @adrianoje for borrowing me his HmIP-DLD!

### Improvements

- **General**: Version bumps of dependencies.

## 0.6.0 (2021-11-26)

### Improvements

- **Elgato EVE history service**: Support for graphical temperature/humidity plots when using EVE app. The history is 
  stored on the filesystem of the server running this plugin (e.g. your Raspberry Pi). Many thanks to @dmalch for 
  implementing this feature.
- **General**: Clean-up and version bumps.

## 0.5.2 (2021-10-07)

### New devices

- **HmIP-eTRV-E**: Added support for HmIP Thermostat "Evo" - thanks to Sven Liebert for adding support.

### Improvements

- **HmIPHeatingThermostat**: Extend min/max set temperature range to 5-30 degrees.

### Bugfix

- **General**: Version bumps for dependencies. I'm still using 3.0.0-beta9 of node-fetch since all projects need to
switch from "commonJS" to "ESM" starting from node-fetch 3.0.0. This caused problems for some users.
(https://github.com/P-Black/homebridge-homematicip-cp/issues/165) 

## 0.5.1 (2021-07-29)

### Bugfix

- **General**: Version bumps for dependencies. Solves an issue with node-fetch for newer installations.

## 0.5.0 (2021-05-15)

### Improvements

- **HmIP-STH/STHD**: Device is now a thermostat instead of a simple climate sensor. The target temperature is usually
  extracted from the device channel. In case of the HmIP-STH the target temperature is determined from the heating group
  since the device channel doesn't provide this kind of information.
- **General**: Log messages contain a unit symbol where applicable.
- **General**: Removed now long-running Hclean-up code for obsolete services and characteristics

## 0.4.3 (2021-03-23)

### Bugfix

- **Dimmer**: Fixed turning dimmer on with Siri.

## 0.4.2 (2021-03-23)

### Bugfix

- **Dimmer**: Fixed "flashing" of dimmer while changing dim level.

## 0.4.1 (2021-03-21)

### New devices

- **Dimmer**: Added dimmer devices: HmIP-PDT, HmIP-BDT, HmIP-FDT, HmIPW-DRD3

## 0.4.0 (2021-03-19)

### New devices

- **MotionDetector**: Added motion detector style devices: HmIP-SMI, HmIP-SMO-A, HmIP-SMI55
- **PresenceDetector**: Added presence detector: HmIP-SPI

## 0.3.7 (2021-03-13)

### Bugfix

- **General**: Fixed tampered state mapping.

## 0.3.6 (2021-03-13)

### Improvements

- **ContactSensor**: Added sabotage state (tampered state) for contact sensors which support it.

### Bugfix

- **General**: Fixed low battery display for all devices with sabotage channel.

## 0.3.5 (2021-03-13)

### Improvements

- **SmokeDetector**: Removed obsolete tampered characteristic.

## 0.3.4 (2021-03-13)

### Bugfix

- **General**: Prevent warning messages about missing characteristics.

## 0.3.3 (2021-03-13)

### Improvements

- **General**: Removed obsolete battery services and characteristics.

## 0.3.2 (2021-03-13)

### Improvements

- **ContactSensor**: Removed obsolete current door state characteristic.

## 0.3.1 (2021-03-13)

### Improvements

- **ContactSensor**: Removed additional "window" service which prevents display of two window sensors when there is only
  one.
- **RotaryHandleSensor**: Use window service for the rotary handle sensor exclusively. Removed contact service for this
  device.

## 0.3.0 (2021-02-28)

### New devices

- **SecuritySystem**: Added security system including internal and external alarm zones. This is definitely beta, so 
  please don't trust the alarm to go off inside HomeKit. Also check the HomematicIP app to be sure the right alarm
  setting is applied.

### Improvements

- **ContactSensor**: Added "window" service to contact sensor. The window service supports "tilted" windows by
  displaying a current position of 50%.
- **General**: Only add battery service if device actually has a battery.
- **General**: Removed now optional characteristics "battery level" and "charging state" which are not supported by
  HomematicIP anyway.

## 0.2.5 (2021-02-12)

### Improvements

- **Shutter/Blind**: Improved target position behavior even further. Now target always follows the current position. The
spinning progress indicator was actually spinning because current and target position were not the same.

## 0.2.4 (2021-02-12)

### Improvements

- **General**: Removed all push button type devices. I haven't figured out a way to get push events from the HmIP-Cloud.
My guess is it is not possible. Now those devices not shown as unsupported devices in the Home App.
  
## 0.2.3 (2021-02-12)

### New devices

- **HmIP-eTRV-C**: Heating-thermostat compact without display

### Improvements

- **HmIP-eTRV**: Fixed update of valve position. Show valve position changes in logs.
- **HmIP-eTRV**: Valve position > 0 indicates current cooling/heating state: HEAT. Valve position = 0 indicates current
  heating cooling/heating state: OFF.
- **HmIP-eTRV**: Added logs for setting ignored values (target cooling/heating mode, display units).
- **HmIP-eTRV**: Target cooling/heating mode is now ignored. Will be used for future mapping of custom states.
- **HmIP-eTRV**: Show changes of valve state in logs.

### Bugfix

- **Shutter/Blind**: Fixed spinning progress indicator in Home app.
- **HmIP-eTRV-C**: HmIP-eTRV-C was listed but not actually supported. 

## 0.2.2 (2021-02-11)

### New devices

- **HmIP-SLO**: Light Sensor outdoor

### Improvements

- **General**: Added API call rate limiter to prevent 60 minutes IP blocks by eq-3 when using fast firing GUI elements
like the shutter slider in EVE app.
- **SwitchMeasuring**: Show power and energy with less decimal places.
- **Shutter/Blind**: Show shutter and slats level without decimal places.
- **General**: Minor code cleanup.

## 0.2.1 (2021-02-07)

### Improvements

- **WallMountedThermostat**: Added info log when changing target heating/cooling state or display unit. These changes 
  are ignored.

### Bug Fixes

- **General**: Fixed dependency problem preventing plugin to start.

## 0.2.0 (2021-02-04)

### Improvements

- **Switch**: Split switch device into switch and measuring switch device to expose more features.
- **SwitchMeasuring**: Added EVE characteristics ElectricPower and ElectricalEnergy for measuring switches. Those values
  can be viewed e.g. by using the EVE App on iOS.
- **General**: Code clean-up. Removed dozens of unused home references.
- **General**: Removed unused weather device.
- **WallMountedThermostat**: Target heating mode is now AUTO by default. Current heating mode depends on cooling state
of heating group.
  
## 0.1.5 (2021-02-02)

### Improvements

- **GarageDoor**: Introduced assumed target position. Enhanced state logic.

### Bug Fixes

- **Blind**: Set correct (current) shutter level when setting slats level. This should prevent the shutter from going
all the way up when changing slats level.

## 0.1.4 (2021-02-01)

### Improvements

- **GarageDoor**: Removed explicit target door position which is not known anyway. This might improve display
  of animation in Home App.

## 0.1.3 (2021-02-01)

### New devices

- **HmIP-FBL**: Blind Actuator - flush-mount
- **HmIP-BBL**: Blind Actuator - brand-mount

## 0.1.2 (2021-01-29)

### Improvements

- **General**: Automatically remove unsupported devices from cache

## 0.1.1 (2021-01-28)

### Improvements

- **GarageDoor**: Further optimized target door state by updating it asynchronously.

### Bug Fixes

- **WaterSensor**: Hopefully fixed "This callback function has already been called by someone else; it can only be
  called one time." bug. Removed humidity detector for now.
- **ClimateSensor**: Fixed a bug where outside temperatures below zero won't be accepted by HomeKit.

## 0.1.0 (2021-01-28)

### New devices

- **HmIP-SWD (Water sensor)**. The sensor exposes two services: Moisture detector and water level detector.

### Improvements

- **GarageDoor**: Display light state as ON/OFF instead of true/false
- **HomeControllerAccessPoint**: Removed the device completely. It was not useful anyway and confused people why there
  was still light burning in the house.
- **SmokeDetector**: Smoke alarm is only triggered when the device itself is detecting smoke. In this way the alarm
displayed on your device is showing the sensor where the smoke actually was detected, not all the smoke sensors in the 
  house.
  
### Bug Fixes

- **GarageDoor**: Fixes target door state update when OPEN/CLOSE was triggered by external app
- **SmokeDetector**: Removed erroneous tampered state detection when instead it was really a burglar alarm.
