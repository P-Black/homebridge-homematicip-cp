"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmIPProgrammableSwitch = void 0;
const HmIPGenericDevice_1 = require("./HmIPGenericDevice");
/**
 * Homematic IP stateless wall buttons / remotes.
 *
 * HmIP-WRC2 / HMIP-WRC2: 2 buttons
 * HmIP-WRC6: 6 buttons
 * HmIP-WKP: wall mounted keypad, exposed as stateless buttons when button channels are visible in the API
 *
 * The Homematic IP cloud API does not expose a stable, documented button event model.
 * This implementation therefore discovers button-like functional channels and emits HomeKit
 * StatelessProgrammableSwitch events when those channels change in websocket updates.
 */
class HmIPProgrammableSwitch extends HmIPGenericDevice_1.HmIPGenericDevice {
    services = new Map();
    lastSnapshots = new Map();
    initialized = false;
    constructor(platform, accessory) {
        super(platform, accessory);
        this.platform.log.debug('Created ProgrammableSwitch %s', accessory.context.device.label);
        const buttonIndexes = this.getButtonIndexes(accessory.context.device);
        // Group the buttons in HomeKit when supported by the client.
        const labelService = this.accessory.getService(this.platform.Service.ServiceLabel)
            || this.accessory.addService(this.platform.Service.ServiceLabel, accessory.context.device.label);
        labelService.setCharacteristic(this.platform.Characteristic.ServiceLabelNamespace, this.platform.Characteristic.ServiceLabelNamespace.ARABIC_NUMERALS);
        for (const index of buttonIndexes) {
            const serviceName = `${accessory.context.device.label} Taste ${index}`;
            const subtype = `button-${index}`;
            const service = this.accessory.getServiceById(this.platform.Service.StatelessProgrammableSwitch, subtype)
                || this.accessory.addService(this.platform.Service.StatelessProgrammableSwitch, serviceName, subtype);
            service
                .setCharacteristic(this.platform.Characteristic.Name, serviceName)
                .setCharacteristic(this.platform.Characteristic.ServiceLabelIndex, index);
            service.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
                .on('get', this.handleProgrammableSwitchEventGet.bind(this));
            this.services.set(index, service);
        }
        this.updateDevice(accessory.context.device, platform.groups);
        this.initialized = true;
    }
    handleProgrammableSwitchEventGet(callback) {
        // StatelessProgrammableSwitch has no persistent value. Returning SINGLE_PRESS is harmless;
        // actual button events are pushed via updateCharacteristic when Homematic IP sends a change.
        callback(null, this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
    }
    updateDevice(hmIPDevice, groups) {
        super.updateDevice(hmIPDevice, groups);
        const buttonChannels = this.getButtonChannels(hmIPDevice);
        for (const snapshot of buttonChannels) {
            const previous = this.lastSnapshots.get(snapshot.channelId);
            this.lastSnapshots.set(snapshot.channelId, snapshot);
            if (!this.initialized || !previous || previous.value === snapshot.value) {
                continue;
            }
            const service = this.services.get(snapshot.index);
            if (!service) {
                this.platform.log.debug('Button event for %s channel %s ignored because no HomeKit service exists', this.accessory.displayName, snapshot.channelId);
                continue;
            }
            const event = this.detectSwitchEvent(previous.value, snapshot.value);
            this.platform.log.info('Button %s / Taste %s event changed to %s', this.accessory.displayName, snapshot.index, event);
            service.updateCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent, event);
        }
    }
    getButtonIndexes(device) {
        const buttonChannels = this.getButtonChannels(device);
        const indexesFromChannels = buttonChannels.map(channel => channel.index);
        if (indexesFromChannels.length > 0) {
            return [...new Set(indexesFromChannels)].sort((a, b) => a - b);
        }
        switch (device.type) {
            case 'PUSH_BUTTON':
                return [1, 2];
            case 'PUSH_BUTTON_6':
                return [1, 2, 3, 4, 5, 6];
            case 'WALL_MOUNTED_KEY_PAD':
                return [1, 2, 3, 4, 5, 6, 7, 8];
            default:
                return [1];
        }
    }
    getButtonChannels(device) {
        const result = [];
        for (const channelId in device.functionalChannels) {
            const channel = device.functionalChannels[channelId];
            const channelType = String(channel.functionalChannelType ?? '').toUpperCase();
            const looksLikeButton = channelType.includes('BUTTON')
                || channelType.includes('KEY')
                || channelType.includes('INPUT')
                || channelType.includes('REMOTE');
            if (!looksLikeButton) {
                continue;
            }
            const index = this.getChannelIndex(channelId, channel, result.length + 1);
            result.push({
                index,
                channelId,
                value: this.stableStringify(this.filterVolatileBaseFields(channel)),
            });
        }
        return result;
    }
    getChannelIndex(channelId, channel, fallback) {
        const explicitIndex = Number(channel.index ?? channel.channelIndex ?? channel.labelIndex ?? channel.buttonIndex);
        if (Number.isInteger(explicitIndex) && explicitIndex > 0) {
            return explicitIndex;
        }
        const numericChannelId = Number(channelId);
        if (Number.isInteger(numericChannelId) && numericChannelId > 0) {
            return numericChannelId;
        }
        return fallback;
    }
    detectSwitchEvent(previousValue, currentValue) {
        const combined = `${previousValue} ${currentValue}`.toLowerCase();
        if (combined.includes('long')) {
            return this.platform.Characteristic.ProgrammableSwitchEvent.LONG_PRESS;
        }
        if (combined.includes('double')) {
            return this.platform.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS;
        }
        return this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
    }
    filterVolatileBaseFields(channel) {
        const filtered = {};
        for (const key of Object.keys(channel).sort()) {
            // Ignore transport/quality data. These can change without a button press.
            if (['rssiDeviceValue', 'rssiPeerValue', 'unreach', 'lowBat', 'dutyCycle', 'configPending'].includes(key)) {
                continue;
            }
            filtered[key] = channel[key];
        }
        return filtered;
    }
    stableStringify(value) {
        if (value === null || typeof value !== 'object') {
            return JSON.stringify(value);
        }
        if (Array.isArray(value)) {
            return `[${value.map(item => this.stableStringify(item)).join(',')}]`;
        }
        const objectValue = value;
        return `{${Object.keys(objectValue).sort().map(key => `${JSON.stringify(key)}:${this.stableStringify(objectValue[key])}`).join(',')}}`;
    }
}
exports.HmIPProgrammableSwitch = HmIPProgrammableSwitch;
//# sourceMappingURL=HmIPProgrammableSwitch.js.map