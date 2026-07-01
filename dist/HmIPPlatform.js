"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmIPPlatform = void 0;
const HmIPConnector_1 = require("./HmIPConnector");
const settings_1 = require("./settings");
const HmIPShutter_1 = require("./devices/HmIPShutter");
const HmIPWallMountedThermostat_1 = require("./devices/HmIPWallMountedThermostat");
const HmIPContactSensor_1 = require("./devices/HmIPContactSensor");
const HmIPAccessory_1 = require("./HmIPAccessory");
const HmIPHeatingThermostat_1 = require("./devices/HmIPHeatingThermostat");
const os = __importStar(require("os"));
const HmIPSmokeDetector_1 = require("./devices/HmIPSmokeDetector");
const HmIPSwitch_1 = require("./devices/HmIPSwitch");
const HmIPGarageDoor_1 = require("./devices/HmIPGarageDoor");
const HmIPClimateSensor_1 = require("./devices/HmIPClimateSensor");
const HmIPWaterSensor_1 = require("./devices/HmIPWaterSensor");
const HmIPBlind_1 = require("./devices/HmIPBlind");
const HmIPSwitchMeasuring_1 = require("./devices/HmIPSwitchMeasuring");
const CustomCharacteristic_1 = require("./CustomCharacteristic");
const HmIPLightSensor_1 = require("./devices/HmIPLightSensor");
const HmIPSecuritySystem_1 = require("./HmIPSecuritySystem");
const HmIPRotaryHandleSensor_1 = require("./devices/HmIPRotaryHandleSensor");
const HmIPMotionDetector_1 = require("./devices/HmIPMotionDetector");
const HmIPPresenceDetector_1 = require("./devices/HmIPPresenceDetector");
const HmIPDimmer_1 = require("./devices/HmIPDimmer");
const fakegato_history_1 = __importDefault(require("fakegato-history"));
const HmIPDoorLockDrive_1 = require("./devices/HmIPDoorLockDrive");
const HmIPDoorLockSensor_1 = require("./devices/HmIPDoorLockSensor");
const HmIPSwitchNotificationLight_1 = require("./devices/HmIPSwitchNotificationLight");
const HmIPProgrammableSwitch_1 = require("./devices/HmIPProgrammableSwitch");
const HmIPIgnoredDevice_1 = require("./devices/HmIPIgnoredDevice");
const HmIPButton_1 = require("./devices/HmIPButton");
const HmIPDimmerMultiChannel_1 = require("./devices/HmIPDimmerMultiChannel");
const HmIPGarageDoorController_1 = require("./devices/HmIPGarageDoorController");
const HmIPWeatherSensor_1 = require("./devices/HmIPWeatherSensor");
const HmIPWeatherSensorPlus_1 = require("./devices/HmIPWeatherSensorPlus");
const HmIPWeatherSensorPro_1 = require("./devices/HmIPWeatherSensorPro");
/**
 * HomematicIP platform
 */
class HmIPPlatform {
    log;
    config;
    api;
    Service;
    Characteristic;
    FakeGatoHistoryService;
    // this is used to track restored cached accessories
    accessories = [];
    connector;
    groups;
    deviceMap = new Map();
    customCharacteristic;
    securitySystem;
    authorizationPin;
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.FakeGatoHistoryService = (0, fakegato_history_1.default)(this.api);
        this.log.info('%s v%s', settings_1.PLUGIN_NAME, settings_1.PLUGIN_VERSION);
        this.customCharacteristic = new CustomCharacteristic_1.CustomCharacteristic(api);
        const accessPoint = (config['accessPoint'] ?? config['access_point'] ?? '');
        const authTokenLegacy = (config['authToken'] ?? '');
        const authTokenPreferred = (config['auth_token'] ?? '');
        const authToken = authTokenPreferred || authTokenLegacy;
        const pin = (config['pin'] ?? '');
        this.authorizationPin = (config['authorizationPin'] ?? '');
        if (authTokenPreferred && authTokenLegacy && authTokenPreferred !== authTokenLegacy) {
            this.log.warn('Both auth_token and authToken are configured but differ. Using auth_token from the Homebridge UI field.');
        }
        this.connector = new HmIPConnector_1.HmIPConnector(log, accessPoint, authToken, pin);
        if (!this.connector.isReadyForUse() && !this.connector.isReadyForPairing()) {
            log.error('Please configure \'access_point\' in \'config.json\' (sticker on the back) and make ' +
                'sure the Access Point is glowing blue.');
            return;
        }
        this.log.debug('Finished initializing platform:', this.config.name);
        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            if (!this.connector.isReadyForUse()) {
                this.startPairing(accessPoint);
            }
            else {
                this.discoverDevices();
            }
        });
        this.api.on('shutdown', () => {
            log.debug('Executed shutdown callback');
            this.connector.disconnectWs();
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory) {
        if (this.connector.isReadyForUse() && !this.getAccessory(accessory.UUID)) {
            this.log.info('Loading accessory from cache:', accessory.displayName);
            this.accessories.push(accessory);
        }
    }
    async startPairing(accessPointId) {
        if (!(await this.connector.init()).valueOf()) {
            return;
        }
        const uuid = this.api.hap.uuid.generate(settings_1.PLUGIN_NAME + '_' + os.hostname());
        this.log.info('');
        this.log.info('=== Homematic IP Pairing gestartet ===');
        this.log.info('Access Point ID: %s', accessPointId);
        this.log.info('Bitte jetzt den blau leuchtenden Link-Button am Homematic-IP-Access-Point drücken.');
        this.log.info('Nach erfolgreichem Pairing wird ein Auth Token im Log ausgegeben.');
        if (!(await this.connector.authConnectionRequest(uuid))) {
            this.log.error('Pairing konnte nicht gestartet werden. Prüfe Access Point ID / SGTIN und PIN. Wenn keine PIN verwendet wird, muss das PIN-Feld leer sein.');
            this.log.error('Access Point ID: %s', accessPointId);
            return;
        }
        const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
        do {
            this.log.info('Warte auf Bestätigung am Access Point ... bitte Link-Button drücken.');
            await sleep(5000);
        } while (!(await this.connector.authRequestAcknowledged(uuid))); // response code: 400 Bad Request
        const authTokenResponse = await this.connector.authRequestToken(uuid);
        if (!authTokenResponse || !authTokenResponse.authToken) {
            this.log.error('Cannot request auth token for access_point=' + accessPointId);
            return;
        }
        const confirmResponse = await this.connector.authConfirmToken(uuid, authTokenResponse.authToken);
        if (!confirmResponse || !confirmResponse.clientId) {
            this.log.error('Cannot confirm auth token for access_point=' + accessPointId + ', authToken=' + authTokenResponse.authToken);
            return;
        }
        this.log.info('SUCCESS! Your auth_token is: ' + authTokenResponse.authToken + ' (Access Point ID: '
            + accessPointId + ', Client ID: ' + confirmResponse.clientId + '). Update \'auth_token\' in config and restart.'
            + 'We recommend removing \'pin\' from config again.');
    }
    /**
     * Register discovered Homematic IP accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    async discoverDevices() {
        if (!(await this.connector.init()).valueOf()) {
            return;
        }
        const hmIPState = await this.connector.apiCall('home/getCurrentState', this.connector.clientCharacteristics, 1);
        if (!hmIPState || !hmIPState.devices) {
            this.log.info(`HomematicIP response is incomplete or could not be parsed: ${hmIPState}`);
            return;
        }
        this.groups = hmIPState.groups;
        // this.setHome(hmIPState.home);
        // loop over the discovered devices and register each one if it has not already been registered
        for (const id in hmIPState.devices) {
            const device = hmIPState.devices[id];
            this.updateAccessory(id, device);
        }
        // find cached but now removed accessories and unregister them
        const accessoriesToBeRemoved = [];
        this.securitySystem = this.createSecuritySystem(hmIPState.home);
        const homeSecuritySystemUuid = this.api.hap.uuid.generate(hmIPState.home.id + '_security');
        if (this.securitySystem.hidden) {
            const cachedAccessory = this.getAccessory(homeSecuritySystemUuid);
            if (cachedAccessory !== undefined) {
                this.log.info('Removing home security system');
                accessoriesToBeRemoved.push(cachedAccessory);
            }
        }
        for (const cachedAccessory of this.accessories) {
            if (cachedAccessory.UUID !== homeSecuritySystemUuid && !this.deviceMap.has(cachedAccessory.context.device.id)) {
                this.log.info('Removing accessory %s', cachedAccessory.context.device.label);
                accessoriesToBeRemoved.push(cachedAccessory);
            }
        }
        if (accessoriesToBeRemoved.length > 0) {
            this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, accessoriesToBeRemoved);
        }
        // Start websocket immediately and register handlers
        await this.connector.connectWs(data => {
            const stateChange = JSON.parse(data.toString());
            let securityZoneChanged = false;
            for (const id in stateChange.events) {
                const event = stateChange.events[id];
                switch (event.pushEventType) {
                    case 'GROUP_CHANGED':
                    case 'GROUP_ADDED':
                        if (event.group) {
                            this.log.debug(`${event.pushEventType}: ${event.group.id} ${JSON.stringify(event.group)}`);
                            hmIPState.groups[event.group.id] = event.group;
                            this.groups[event.group.id] = event.group;
                            if (event.group.type === 'SECURITY_ZONE') {
                                securityZoneChanged = true;
                            }
                        }
                        break;
                    case 'GROUP_REMOVED':
                        if (event.group) {
                            this.log.debug(`${event.pushEventType}: ${event.group.id}`);
                            delete hmIPState.groups[event.group.id];
                            delete this.groups[event.group.id];
                        }
                        break;
                    case 'DEVICE_REMOVED':
                        if (event.device) {
                            this.log.debug(`${event.pushEventType}: ${event.device.id} ${event.device.modelType}`);
                            const hmIPDevice = this.deviceMap.get(event.device.id);
                            if (hmIPDevice) {
                                this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [hmIPDevice.accessory]);
                                delete hmIPState.devices[event.device.id];
                                this.deviceMap.delete(event.device.id);
                            }
                            else {
                                this.log.debug('Removal event from unregistered device: ' + event.device.id);
                            }
                        }
                        break;
                    case 'DEVICE_CHANGED':
                    case 'DEVICE_ADDED':
                        if (event.device) {
                            this.log.debug(`${event.pushEventType}: ${event.device.id} ${event.device.modelType}`);
                            if (this.deviceMap.has(event.device.id)) {
                                this.deviceMap.get(event.device.id).updateDevice(event.device, this.groups);
                            }
                            else {
                                this.log.debug('Device add/change event from unregistered device: ' + event.device.id);
                            }
                        }
                        break;
                    case 'DEVICE_CHANNEL_EVENT':
                        if (event.deviceId && this.deviceMap.has(event.deviceId)) {
                            this.log.debug(`Channel Event: ${JSON.stringify(event)}`);
                            const hmIPDevice = this.deviceMap.get(event.deviceId);
                            if (typeof hmIPDevice.channelEvent === 'function') {
                                const channelId = event.channelIndex ?? 1;
                                const channelEventType = event.channelEventType ?? '';
                                hmIPDevice.channelEvent(channelId, channelEventType);
                            }
                        }
                        else {
                            this.log.debug('Device channel event from unregistered device: ' + event.deviceId);
                        }
                        break;
                    case 'HOME_CHANGED':
                        if (event.home) {
                            this.log.debug(`${event.pushEventType}: ${event.home.id} ${JSON.stringify(event.home)}`);
                            this.securitySystem?.updateHome(event.home);
                        }
                        break;
                    case 'SECURITY_JOURNAL_CHANGED':
                        this.log.debug(`${event.pushEventType}: ${JSON.stringify(event)}`);
                        break;
                    default:
                        this.log.debug(`Unhandled event type: ${event.pushEventType} group=${event.group} device=${event.device}`);
                }
            }
            if (securityZoneChanged) {
                this.securitySystem?.updateGroups(this.groups);
            }
        });
    }

    normalizeClimateDeviceMode(mode) {
        const value = String(mode ?? 'auto').toLowerCase();
        if (value === 'thermostat' || value === 'sensor' || value === 'auto') {
            return value;
        }
        return 'auto';
    }
    getClimateDeviceMode(device) {
        const accessoryConfig = this.config['devices']?.[device.id];
        if (accessoryConfig?.['asClimateSensor'] === true && accessoryConfig?.['climateDeviceMode'] === undefined) {
            return 'sensor';
        }
        return this.normalizeClimateDeviceMode(accessoryConfig?.['climateDeviceMode'] ?? this.config['climateDeviceMode']);
    }
    isSensorOnlyClimateDevice(deviceType) {
        return deviceType === 'TEMPERATURE_HUMIDITY_SENSOR'
            || deviceType === 'TEMPERATURE_HUMIDITY_SENSOR_DISPLAY'
            || deviceType === 'TEMPERATURE_HUMIDITY_SENSOR_COMPACT'
            || deviceType === 'TEMPERATURE_HUMIDITY_SENSOR_OUTDOOR';
    }
    shouldExposeThermostatAsClimateSensor(device) {
        const mode = this.getClimateDeviceMode(device);
        if (mode === 'sensor') {
            return true;
        }
        if (mode === 'thermostat') {
            return false;
        }
        return this.isSensorOnlyClimateDevice(device.type);
    }

    getUseRoomNames() {
        return this.config['useRoomNames'] === true;
    }
    getRoomNameFormat() {
        const format = (this.config['roomNameFormat'] ?? '{room} {name}');
        return format.includes('{room}') && format.includes('{name}') ? format : '{room} {name}';
    }
    sanitizeHomeKitName(name) {
        return name
            .replace(/[–—]/g, '-')
            .replace(/[\t\n\r]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    collectGroupIds(device) {
        const groupIds = new Set();
        if (Array.isArray(device.groups)) {
            for (const groupId of device.groups) {
                if (typeof groupId === 'string') {
                    groupIds.add(groupId);
                }
            }
        }
        for (const channelId in device.functionalChannels) {
            const channel = device.functionalChannels[channelId];
            if (Array.isArray(channel.groups)) {
                for (const groupId of channel.groups) {
                    if (typeof groupId === 'string') {
                        groupIds.add(groupId);
                    }
                }
            }
        }
        return groupIds;
    }
    objectContainsDeviceId(value, deviceId) {
        if (value === deviceId) {
            return true;
        }
        if (Array.isArray(value)) {
            return value.some(item => this.objectContainsDeviceId(item, deviceId));
        }
        if (value && typeof value === 'object') {
            return Object.values(value).some(item => this.objectContainsDeviceId(item, deviceId));
        }
        return false;
    }
    getRoomLabel(device) {
        if (!this.groups) {
            return undefined;
        }
        const groupIds = this.collectGroupIds(device);
        for (const groupId of groupIds) {
            const group = this.groups[groupId];
            if (group && group.type === 'ROOM') {
                const label = group.label ?? group.name;
                if (label) {
                    return this.sanitizeHomeKitName(label);
                }
            }
        }
        for (const groupId in this.groups) {
            const group = this.groups[groupId];
            if (group.type === 'ROOM' && this.objectContainsDeviceId(group, device.id)) {
                const label = group.label ?? group.name;
                if (label) {
                    return this.sanitizeHomeKitName(label);
                }
            }
        }
        return undefined;
    }
    getDisplayLabel(device) {
        const originalLabel = this.sanitizeHomeKitName(device.label);
        if (!this.getUseRoomNames()) {
            return originalLabel;
        }
        const roomLabel = this.getRoomLabel(device);
        if (!roomLabel) {
            return originalLabel;
        }
        const caseInsensitiveOriginal = originalLabel.toLocaleLowerCase();
        const caseInsensitiveRoom = roomLabel.toLocaleLowerCase();
        if (caseInsensitiveOriginal === caseInsensitiveRoom || caseInsensitiveOriginal.startsWith(caseInsensitiveRoom + ' ')) {
            return originalLabel;
        }
        return this.sanitizeHomeKitName(this.getRoomNameFormat()
            .replace('{room}', roomLabel)
            .replace('{name}', originalLabel));
    }
    withDisplayLabel(device) {
        const originalLabel = device.originalLabel ?? device.label;
        const displayLabel = this.getDisplayLabel(device);
        const roomLabel = this.getUseRoomNames() ? this.getRoomLabel(device) : undefined;
        return {
            ...device,
            originalLabel,
            roomLabel,
            label: displayLabel,
        };
    }
    updateAccessory(id, device) {
        const uuid = this.api.hap.uuid.generate(id);
        const displayDevice = this.withDisplayLabel(device);
        const hmIPAccessory = this.createAccessory(uuid, displayDevice.label, displayDevice);
        let homebridgeDevice = null;
        if (HmIPHeatingThermostat_1.HmIPHeatingThermostat.isHeatingThermostat(displayDevice.type)) {
            homebridgeDevice = new HmIPHeatingThermostat_1.HmIPHeatingThermostat(this, hmIPAccessory.accessory);
        }
        else if (HmIPHeatingThermostat_1.HmIPHeatingThermostat.isThermostat(displayDevice.type)) {
            if (this.shouldExposeThermostatAsClimateSensor(displayDevice)) {
                this.log.info('Presenting %s (%s) as climate sensor: device has no useful HomeKit thermostat control representation in climateDeviceMode auto/sensor.', displayDevice.label, displayDevice.modelType ?? displayDevice.type);
                homebridgeDevice = new HmIPClimateSensor_1.HmIPClimateSensor(this, hmIPAccessory.accessory);
            }
            else {
                homebridgeDevice = new HmIPWallMountedThermostat_1.HmIPWallMountedThermostat(this, hmIPAccessory.accessory);
            }
        }
        else if (displayDevice.type === 'TEMPERATURE_HUMIDITY_SENSOR_OUTDOOR'
            || displayDevice.type === 'TEMPERATURE_HUMIDITY_SENSOR_COMPACT') {
            homebridgeDevice = new HmIPClimateSensor_1.HmIPClimateSensor(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'FULL_FLUSH_SHUTTER'
            || displayDevice.type === 'BRAND_SHUTTER') {
            homebridgeDevice = new HmIPShutter_1.HmIPShutter(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'FULL_FLUSH_BLIND'
            || displayDevice.type === 'BRAND_BLIND') {
            homebridgeDevice = new HmIPBlind_1.HmIPBlind(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'SHUTTER_CONTACT'
            || displayDevice.type === 'SHUTTER_CONTACT_INTERFACE'
            || displayDevice.type === 'SHUTTER_CONTACT_INVISIBLE'
            || displayDevice.type === 'SHUTTER_CONTACT_MAGNETIC'
            || displayDevice.type === 'SHUTTER_CONTACT_OPTICAL_PLUS') {
            homebridgeDevice = new HmIPContactSensor_1.HmIPContactSensor(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'ROTARY_HANDLE_SENSOR') {
            homebridgeDevice = new HmIPRotaryHandleSensor_1.HmIPRotaryHandleSensor(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'SMOKE_DETECTOR') {
            homebridgeDevice = new HmIPSmokeDetector_1.HmIPSmokeDetector(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'PLUGABLE_SWITCH'
            || displayDevice.type === 'FULL_FLUSH_INPUT_SWITCH'
            || displayDevice.type === 'BRAND_SWITCH_2'
            || displayDevice.type === 'PRINTED_CIRCUIT_BOARD_SWITCH_BATTERY'
            || displayDevice.type === 'PRINTED_CIRCUIT_BOARD_SWITCH_2' // Only first channel
            || displayDevice.type === 'OPEN_COLLECTOR_8_MODULE' // Only first channel
            || displayDevice.type === 'HEATING_SWITCH_2' // Only first channel
            || displayDevice.type === 'WIRED_SWITCH_8' // Only first channel
            || displayDevice.type === 'WIRED_SWITCH_4' // Only first channel
            || displayDevice.type === 'DIN_RAIL_SWITCH_4' // Only first channel
            || displayDevice.type === 'SWITCH_POWER_SUPPLY') {
            homebridgeDevice = new HmIPSwitch_1.HmIPSwitch(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'PLUGABLE_SWITCH_MEASURING'
            || displayDevice.type === 'BRAND_SWITCH_MEASURING'
            || displayDevice.type === 'FULL_FLUSH_SWITCH_MEASURING') {
            homebridgeDevice = new HmIPSwitchMeasuring_1.HmIPSwitchMeasuring(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'TORMATIC_MODULE'
            || displayDevice.type === 'HOERMANN_DRIVES_MODULE') {
            homebridgeDevice = new HmIPGarageDoor_1.HmIPGarageDoor(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'WALL_MOUNTED_GARAGE_DOOR_CONTROLLER') {
            homebridgeDevice = new HmIPGarageDoorController_1.HmIPGarageDoorController(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'WATER_SENSOR') {
            homebridgeDevice = new HmIPWaterSensor_1.HmIPWaterSensor(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'LIGHT_SENSOR') {
            homebridgeDevice = new HmIPLightSensor_1.HmIPLightSensor(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'MOTION_DETECTOR_INDOOR'
            || displayDevice.type === 'MOTION_DETECTOR_OUTDOOR'
            || displayDevice.type === 'MOTION_DETECTOR_PUSH_BUTTON') {
            homebridgeDevice = new HmIPMotionDetector_1.HmIPMotionDetector(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'PRESENCE_DETECTOR_INDOOR') {
            homebridgeDevice = new HmIPPresenceDetector_1.HmIPPresenceDetector(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'BRAND_DIMMER'
            || displayDevice.type === 'FULL_FLUSH_DIMMER'
            || displayDevice.type === 'PLUGGABLE_DIMMER'
            || displayDevice.type === 'WIRED_DIMMER_3') { // Only first channel
            homebridgeDevice = new HmIPDimmer_1.HmIPDimmer(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'DIN_RAIL_DIMMER_3') {
            homebridgeDevice = new HmIPDimmerMultiChannel_1.HmIPDimmerMultiChannel(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'DOOR_LOCK_DRIVE') {
            homebridgeDevice = new HmIPDoorLockDrive_1.HmIPDoorLockDrive(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'DOOR_LOCK_SENSOR') {
            homebridgeDevice = new HmIPDoorLockSensor_1.HmIPDoorLockSensor(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'BRAND_SWITCH_NOTIFICATION_LIGHT') {
            homebridgeDevice = new HmIPSwitchNotificationLight_1.HmIPSwitchNotificationLight(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'PUSH_BUTTON'
            || displayDevice.type === 'PUSH_BUTTON_6'
            || displayDevice.type === 'PUSH_BUTTON_FLAT'
            || displayDevice.type === 'BRAND_PUSH_BUTTON') {
            homebridgeDevice = new HmIPButton_1.HmIPButton(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'WALL_MOUNTED_KEY_PAD') {
            homebridgeDevice = new HmIPProgrammableSwitch_1.HmIPProgrammableSwitch(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'WEATHER_SENSOR') {
            homebridgeDevice = new HmIPWeatherSensor_1.HmIPWeatherSensor(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'WEATHER_SENSOR_PLUS') {
            homebridgeDevice = new HmIPWeatherSensorPlus_1.HmIPWeatherSensorPlus(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'WEATHER_SENSOR_PRO') {
            homebridgeDevice = new HmIPWeatherSensorPro_1.HmIPWeatherSensorPro(this, hmIPAccessory.accessory);
        }
        else if (displayDevice.type === 'HOME_CONTROL_ACCESS_POINT') {
            homebridgeDevice = new HmIPIgnoredDevice_1.HmIPIgnoredDevice(this, hmIPAccessory.accessory, 'Access Point itself has no useful HomeKit accessory representation.');
        }
        else {
            this.log.warn(`Device not implemented: ${displayDevice.modelType} - ${displayDevice.label} via type ${displayDevice.type}`);
            return;
        }
        if (!homebridgeDevice.hidden) {
            this.deviceMap.set(id, homebridgeDevice);
            hmIPAccessory.register();
        }
    }
    createAccessory(uuid, displayName, deviceContext) {
        // see if an accessory with the same uuid has already been registered and restored from
        // the cached devices we stored in the `configureAccessory` method above
        const existingAccessory = this.getAccessory(uuid);
        let isFromCache = true;
        if (!existingAccessory) {
            this.log.debug('Could not find existing accessory in pool: '
                + this.accessories.map(val => val.displayName + '/' + val.context).join(', '));
            isFromCache = false;
        }
        else {
            this.log.debug('Accessory already exists: ' + uuid + ', ' + displayName + ', deviceContext: ' + JSON.stringify(deviceContext));
        }
        const accessory = existingAccessory ? existingAccessory : new this.api.platformAccessory(displayName, uuid);
        if (existingAccessory && existingAccessory.displayName !== displayName) {
            this.log.info('Renaming cached accessory: %s -> %s', existingAccessory.displayName, displayName);
            existingAccessory.displayName = displayName;
        }
        accessory.context.device = deviceContext;
        if (deviceContext && typeof deviceContext === 'object' && 'id' in deviceContext) {
            accessory.context.config = this.config['devices']?.[deviceContext.id];
        }
        return new HmIPAccessory_1.HmIPAccessory(this.api, this.log, accessory, isFromCache);
    }
    getAccessory(uuid) {
        return this.accessories.find(accessoryFound => accessoryFound.UUID === uuid);
    }
    createSecuritySystem(home) {
        const id = home.id + '_security';
        const uuid = this.api.hap.uuid.generate(id);
        const hmIPAccessory = this.createAccessory(uuid, 'Home Security System', home);
        const securitySystem = new HmIPSecuritySystem_1.HmIPSecuritySystem(this, hmIPAccessory.accessory);
        if (!securitySystem.hidden) {
            this.deviceMap.set(id, securitySystem);
            hmIPAccessory.register();
        }
        return securitySystem;
    }
}
exports.HmIPPlatform = HmIPPlatform;
//# sourceMappingURL=HmIPPlatform.js.map