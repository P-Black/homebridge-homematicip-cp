# Homebridge Homematicip

**Version:** 1.3.21-cp.1  
**Maintainer/Build:** P-Black CP build

Finale CP-Version des Homematic-IP-Plugins für Homebridge mit Homebridge-2.x-Kompatibilität, verbessertem Pairing, sauberer HomeKit-Darstellung und bereinigter lokaler Plugin-/Config-Darstellung.


## Attribution / Herkunft

Dieses Paket ist ein CP-Fork des ursprünglichen Homebridge-Plugins `homebridge-homematicip` von **marcsowen**.  
Die aktuelle CP-Version wird unter dem umbenannten Paketnamen `homebridge-homematicip-cp` weitergeführt, damit die Homebridge-UI die lokale CP-Version nicht dem alten npm-Paket zuordnet.

Originalprojekt: <https://github.com/marcsowen/homebridge-homematicip>

Die CP-Version enthält zusätzliche Anpassungen für Homebridge 2.x, Apple-Home-Darstellung, HmIP-DLD, Button-Modi, Klima-Sensoren, Rauchwarnmelder-Namen und bereinigte lokale Plugin-Metadaten.

## GitHub

Repository: <https://github.com/P-Black/homebridge-homematicip-cp>

Issues: <https://github.com/P-Black/homebridge-homematicip-cp/issues>

Installation from GitHub/local release package uses the renamed package `homebridge-homematicip-cp`. The Homebridge platform alias remains `HomematicIP`, so existing configuration blocks keep `"platform": "HomematicIP"`.

## Wichtige Funktionen

- Homebridge 2.x kompatibel
- Pairing über Homebridge Config UI
- `accessPoint` und `auth_token` unterstützt
- Räume im Gerätenamen über `useRoomNames`
- HmIP-DLD Türschlossantrieb mit `openLatchFallback`
- klare Logmeldung bei `INVALID_AUTHORIZATION_PIN`
- Token, ClientAuth und PIN werden in Fehlerlogs redigiert
- Wandtaster steuerbar über `buttonMode`
- HmIP-STH/STHD als Temperatur-/Luftfeuchtesensoren über `climateDeviceMode: auto`
- HmIP-WTH-2 bleibt als regelbarer Apple-Home-Thermostat erhalten
- Rauchwarnmelder behalten eindeutige Homematic-IP-Gerätenamen in HomeKit
- lokale Paket- und Config-Metadaten auf `P-Black` / `Homebridge Homematicip` bereinigt

## Empfohlene Config

```json
{
  "name": "Homematic IP",
  "accessPoint": "DEINE_ACCEESPOINT_ID",
  "auth_token": "DEIN_TOKEN",
  "useRoomNames": true,
  "roomNameFormat": "{room} {name}",
  "buttonMode": "hidden",
  "climateDeviceMode": "auto",
  "devices": {
    "HOME_SECURITY_SYSTEM": {
      "hide": true
    },
    "DEINE_HMIP_DLD_ID": {
      "openLatch": false,
      "openLatchFallback": true
    }
  },
  "platform": "HomematicIP"
}
```

## Pairing

1. `accessPoint` eintragen.
2. `auth_token` leer lassen.
3. `pin` nur eintragen, wenn Homematic IP beim Pairing eine PIN verlangt.
4. Homebridge neu starten.
5. Link-Button am Access Point drücken.
6. Den erzeugten Token aus dem Log in `auth_token` kopieren.
7. `pin` wieder entfernen und Homebridge erneut starten.

## Wandtaster / Buttons

Globale Option:

```json
"buttonMode": "hidden"
```

Mögliche Werte:

- `hidden`: Wandtaster werden nicht in Apple Home angezeigt.
- `stateless`: Wandtaster werden als HomeKit-Stateless-Taster für Automationen angezeigt.
- `switch`: Wandtaster werden als virtuelle HomeKit-Schalter angezeigt.

Pro Gerät überschreibbar:

```json
"devices": {
  "DEINE_WANDTASTER_ID": {
    "buttonMode": "stateless"
  }
}
```

Wenn Wandtaster ausgeblendet werden, protokolliert das Plugin z. B.:

```text
Ignoring Wandtaster (HmIP-WRC2): buttonMode is hidden; wall button has no useful HomeKit accessory representation unless used for HomeKit automations.
```

## Klima-Geräte

Globale Option:

```json
"climateDeviceMode": "auto"
```

Mögliche Werte:

- `auto`: empfohlen. HmIP-STH/STHD werden als Temperatur-/Luftfeuchtesensor dargestellt; regelbare Wandthermostate wie HmIP-WTH-2 bleiben Thermostate.
- `sensor`: Gerät als Temperatur-/Luftfeuchtesensor erzwingen.
- `thermostat`: Thermostat-Darstellung erzwingen, sofern vom Gerät sinnvoll unterstützt.

## Türschloss / HmIP-DLD

```json
"devices": {
  "DEINE_HMIP_DLD_ID": {
    "openLatch": false,
    "openLatchFallback": true
  }
}
```

`authorizationPin` nur setzen, wenn Homematic IP für den Türschlossantrieb wirklich eine Zutritts-/Authorization-PIN verlangt. Bei `INVALID_AUTHORIZATION_PIN` die PIN entfernen oder die richtige Zutritts-PIN in der Homematic-IP-App prüfen.

## Rauchwarnmelder

Rauchwarnmelder übernehmen den eindeutigen Homematic-IP-Gerätenamen auch am HomeKit-SmokeSensor-Service. Beispiel: `Rauchwarnmelder Vorraum` bleibt dadurch in Apple Home und Automationen besser unterscheidbar.
