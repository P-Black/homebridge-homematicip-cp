"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmIPButton = void 0;
const HmIPGenericDevice_1 = require("./HmIPGenericDevice");
/**
 * HomematicIP button accessory
 *
 * Buttons
 *
 * HMIP-WRC2 (Homematic IP button - 2 channels)
 * HMIP-WRC6 (Homematic IP button - 6 channels)
 * HMIP-BRC2 (Homematic IP brand button - 2 channels)
 * HMIP-WRCC2 (Homematic IP flat button - 2 channels)
 *
 */
class HmIPButton extends HmIPGenericDevice_1.HmIPGenericDevice {
    channels = new Map();
    buttonMode;
    exposeAsSwitch;
    switchMode;
    momentaryResetMs;
    constructor(platform, accessory) {
        super(platform, accessory);
        this.buttonMode = this.getButtonMode();
        this.exposeAsSwitch = this.buttonMode === 'switch';
        this.switchMode = String(this.accessoryConfig?.['buttonSwitchMode']
            || platform.config['buttonSwitchMode']
            || 'toggle').toLowerCase();
        this.momentaryResetMs = Number(this.accessoryConfig?.['buttonMomentaryResetMs']
            || platform.config['buttonMomentaryResetMs']
            || 750);
        if (this.buttonMode === 'hidden') {
            this.hidden = true;
            this.platform.log.info('Ignoring %s (%s): buttonMode is hidden; wall button has no useful HomeKit accessory representation unless used for HomeKit automations.', accessory.context.device.label, accessory.context.device.modelType);
            return;
        }
        this.platform.log.debug(`Created button ${accessory.context.device.label} as ${this.buttonMode}`);
        for (const id in accessory.context.device.functionalChannels) {
            const channel = accessory.context.device.functionalChannels[id];
            if (channel.functionalChannelType === 'SINGLE_KEY_CHANNEL') {
                const buttonChannel = channel;
                if (!this.channels.has(buttonChannel.index)) {
                    const label = (buttonChannel.label == null || buttonChannel.label == '')
                        ? `Button ${buttonChannel.index}`
                        : buttonChannel.label;
                    const subtype = buttonChannel.index.toString();
                    buttonChannel.virtualOn = false;
                    if (this.exposeAsSwitch) {
                        buttonChannel.hapService = this.accessory.getServiceById(this.platform.Service.Switch, subtype);
                        if (!buttonChannel.hapService) {
                            const service = new this.platform.Service.Switch(label, subtype);
                            buttonChannel.hapService = this.accessory.addService(service);
                        }
                        buttonChannel.hapService.updateCharacteristic(this.platform.Characteristic.Name, `${accessory.context.device.label} ${label}`);
                        buttonChannel.hapService.getCharacteristic(this.platform.Characteristic.On)
                            .on('get', this.handleSwitchOnGet.bind(this, buttonChannel.index))
                            .on('set', this.handleSwitchOnSet.bind(this, buttonChannel.index));
                        const oldStatelessService = this.accessory.getServiceById(this.platform.Service.StatelessProgrammableSwitch, subtype);
                        if (oldStatelessService) {
                            this.accessory.removeService(oldStatelessService);
                        }
                    }
                    else {
                        buttonChannel.hapService = this.accessory.getServiceById(this.platform.Service.StatelessProgrammableSwitch, subtype);
                        if (!buttonChannel.hapService) {
                            const service = new this.platform.Service.StatelessProgrammableSwitch(label, subtype);
                            buttonChannel.hapService = this.accessory.addService(service);
                        }
                        buttonChannel.hapService.updateCharacteristic(this.platform.Characteristic.ServiceLabelIndex, buttonChannel.index);
                        buttonChannel.hapService.updateCharacteristic(this.platform.Characteristic.Name, `${accessory.context.device.label} ${label}`);
                        const oldSwitchService = this.accessory.getServiceById(this.platform.Service.Switch, subtype);
                        if (oldSwitchService) {
                            this.accessory.removeService(oldSwitchService);
                        }
                    }
                    this.channels.set(buttonChannel.index, buttonChannel);
                    this.platform.log.debug('Added button channel %d to %s as %s', buttonChannel.index, this.accessory.displayName, this.exposeAsSwitch ? 'Switch' : 'StatelessProgrammableSwitch');
                }
            }
        }
        if (this.channels.size == 0) {
            this.platform.log.warn('No functional channels found for device %s', this.accessory.displayName);
        }
        else {
            this.updateDevice(accessory.context.device, platform.groups);
        }
    }
    getButtonMode() {
        const rawMode = String(this.accessoryConfig?.['buttonMode']
            || this.platform.config['buttonMode']
            || '').toLowerCase();
        if (rawMode === 'hidden') {
            return 'hidden';
        }
        if (rawMode === 'switch') {
            return 'switch';
        }
        if (rawMode === 'stateless' || rawMode === 'statless') {
            return 'stateless';
        }
        // Backward compatibility for v1.3.12-cp.1.
        if (this.accessoryConfig?.['buttonAsSwitch'] === true
            || this.platform.config['buttonAsSwitch'] === true) {
            return 'switch';
        }
        return 'stateless';
    }
    handleSwitchOnGet(channelIndex, callback) {
        const currentChannel = this.channels.get(channelIndex);
        callback(null, currentChannel?.virtualOn === true);
    }
    handleSwitchOnSet(channelIndex, value, callback) {
        const currentChannel = this.channels.get(channelIndex);
        if (currentChannel) {
            currentChannel.virtualOn = value === true;
            this.platform.log.debug('Virtual button switch %s channel %d set to %s from HomeKit', this.accessory.displayName, channelIndex, currentChannel.virtualOn ? 'ON' : 'OFF');
        }
        callback(null);
    }
    /* Update device state */
    updateDevice(hmIPDevice, groups) {
        super.updateDevice(hmIPDevice, groups);
        for (const id in hmIPDevice.functionalChannels) {
            const channel = hmIPDevice.functionalChannels[id];
            if (channel.functionalChannelType === 'SINGLE_KEY_CHANNEL') {
                const buttonChannel = channel;
                const currentChannel = this.channels.get(buttonChannel.index);
                // this.platform.log.info(`Button update: ${JSON.stringify(channel)}`);
                if (currentChannel) {
                    if (buttonChannel.label !== null && buttonChannel.label != '' &&
                        buttonChannel.label != currentChannel.label) {
                        currentChannel.label = buttonChannel.label;
                        currentChannel.hapService.displayName = buttonChannel.label;
                        currentChannel.hapService.updateCharacteristic(this.platform.Characteristic.Name, currentChannel.label);
                        this.platform.log.debug('Button label of %s channel %d changed to %s', this.accessory.displayName, currentChannel.index, currentChannel.label);
                    }
                }
            }
        }
    }
    /* Device channel event */
    channelEvent(channelId, channelEventType) {
        const currentChannel = this.channels.get(channelId);
        if (currentChannel) {
            let hkEvent = null;
            if (channelEventType === 'KEY_PRESS_SHORT' && currentChannel.lastEvent !== 'KEY_PRESS_LONG_START') {
                hkEvent = this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
            }
            else if (channelEventType === 'KEY_PRESS_LONG_STOP') {
                hkEvent = this.platform.Characteristic.ProgrammableSwitchEvent.LONG_PRESS;
            }
            currentChannel.lastEvent = channelEventType;
            if (hkEvent !== null) {
                if (this.exposeAsSwitch) {
                    this.updateVirtualSwitch(currentChannel, channelId, channelEventType);
                }
                else {
                    const characteristic = currentChannel.hapService.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent);
                    if (!characteristic) {
                        this.platform.log.warn(`Unable to send event of button ${this.accessory.displayName}`);
                    }
                    else {
                        characteristic.sendEventNotification(hkEvent);
                        this.platform.log.info(`${this.accessory.displayName}, Button ${channelId} Event: ${hkEvent}`);
                    }
                }
            }
        }
    }
    updateVirtualSwitch(currentChannel, channelId, channelEventType) {
        if (this.switchMode === 'momentary') {
            currentChannel.virtualOn = true;
            currentChannel.hapService.updateCharacteristic(this.platform.Characteristic.On, true);
            this.platform.log.info('%s, Button %d Event: %s -> virtual switch ON', this.accessory.displayName, channelId, channelEventType);
            setTimeout(() => {
                currentChannel.virtualOn = false;
                currentChannel.hapService.updateCharacteristic(this.platform.Characteristic.On, false);
                this.platform.log.debug('%s, Button %d virtual switch reset to OFF', this.accessory.displayName, channelId);
            }, this.momentaryResetMs);
            return;
        }
        currentChannel.virtualOn = !currentChannel.virtualOn;
        currentChannel.hapService.updateCharacteristic(this.platform.Characteristic.On, currentChannel.virtualOn);
        this.platform.log.info('%s, Button %d Event: %s -> virtual switch %s', this.accessory.displayName, channelId, channelEventType, currentChannel.virtualOn ? 'ON' : 'OFF');
    }
}
exports.HmIPButton = HmIPButton;
//# sourceMappingURL=HmIPButton.js.map