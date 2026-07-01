"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomCharacteristic = void 0;
class CustomCharacteristic {
    api;
    characteristic = {};
    constructor(api) {
        this.api = api;
        this.createCharacteristics('OpticalSignal', 'A11C14A7-BB9B-4085-8597-68CF63964BF8', {
            format: "string" /* Formats.STRING */,
            perms: ["pw" /* Perms.PAIRED_WRITE */, "pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */]
        }, 'Optical Signal Behaviour');
        this.createCharacteristics('ElectricPower', 'E863F10D-079E-48FF-8F27-9C2605A29F52', {
            format: "float" /* Formats.FLOAT */,
            perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */]
        }, 'Electric Power');
        this.createCharacteristics('ElectricalEnergy', 'E863F10C-079E-48FF-8F27-9C2605A29F52', {
            format: "float" /* Formats.FLOAT */,
            perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */]
        }, 'Electrical Energy');
        this.createCharacteristics('ValvePosition', 'E863F12E-079E-48FF-8F27-9C2605A29F52', {
            format: "uint8" /* Formats.UINT8 */,
            unit: "percentage" /* Units.PERCENTAGE */,
            perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */],
            minValue: 0,
            maxValue: 100
        }, 'Valve Position');
        this.createCharacteristics('RainBool', 'F14EB1AD-E000-4EF4-A54F-0CF07B2E7BE7', {
            format: "bool" /* Formats.BOOL */,
            perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */]
        });
        this.createCharacteristics('RainDay', 'CCC04890-565B-4376-B39A-3113341D9E0F', {
            format: "float" /* Formats.FLOAT */,
            unit: 'mm',
            minValue: 0,
            maxValue: 500,
            minStep: 0.1,
            perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */]
        });
        this.createCharacteristics('WindDirection', '46F1284C-1912-421B-82F5-EB75008B167E', {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */]
        });
        this.createCharacteristics('WindSpeed', '49C8AE5A-A3A5-41AB-BF1F-12D5654F9F41', {
            unit: 'km/h',
            format: "uint8" /* Formats.UINT8 */,
            minValue: 0,
            minStep: 0.1,
            maxValue: 100,
            perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */]
        });
        this.createCharacteristics('WeatherConditionCategory', 'CD65A9AB-85AD-494A-B2BD-2F380084134C', {
            format: "uint16" /* Formats.UINT16 */,
            minValue: 0,
            minStep: 1,
            maxValue: 100,
            perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */]
        });
    }
    createCharacteristics(key, uuid, props, displayName = key) {
        this.characteristic[key] = class extends this.api.hap.Characteristic {
            static UUID = uuid;
            constructor() {
                super(displayName, uuid, props);
                this.value = this.getDefaultValue();
            }
        };
    }
}
exports.CustomCharacteristic = CustomCharacteristic;
//# sourceMappingURL=CustomCharacteristic.js.map