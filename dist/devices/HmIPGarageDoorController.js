"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmIPGarageDoorController = void 0;
const HmIPGenericDevice_1 = require("./HmIPGenericDevice");
var DoorState;
(function (DoorState) {
    DoorState["CLOSED"] = "CLOSED";
    DoorState["OPEN"] = "OPEN";
    DoorState["VENTILATION_POSITION"] = "VENTILATION_POSITION";
    DoorState["POSITION_UNKNOWN"] = "POSITION_UNKNOWN";
})(DoorState || (DoorState = {}));
/**
 * HomematicIP garage door controller
 *
 * HmIP-WGC (Wall Mounted Garage Door Controller)
 *
 */
class HmIPGarageDoorController extends HmIPGenericDevice_1.HmIPGenericDevice {
    service;
    currentDoorState = DoorState.CLOSED;
    previousDoorState = DoorState.CLOSED;
    processing = false;
    targetDoorState = this.platform.Characteristic.TargetDoorState.CLOSED;
    constructor(platform, accessory) {
        super(platform, accessory);
        this.platform.log.debug(`Created garage door ${accessory.context.device.label}`);
        this.service = this.accessory.getService(this.platform.Service.GarageDoorOpener)
            || this.accessory.addService(this.platform.Service.GarageDoorOpener);
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.label);
        this.service.getCharacteristic(this.platform.Characteristic.CurrentDoorState)
            .on('get', this.handleCurrentDoorStateGet.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState)
            .on('get', this.handleTargetDoorStateGet.bind(this))
            .on('set', this.handleTargetDoorStateSet.bind(this));
        this.updateDevice(accessory.context.device, platform.groups);
    }
    handleCurrentDoorStateGet(callback) {
        callback(null, this.getHmKitCurrentDoorState(this.currentDoorState));
    }
    handleTargetDoorStateGet(callback) {
        callback(null, this.targetDoorState);
    }
    async handleTargetDoorStateSet(value, callback) {
        this.targetDoorState = value;
        this.platform.log.info('Setting garage door %s to %s', this.accessory.displayName, value === this.platform.Characteristic.TargetDoorState.OPEN ? 'OPEN' : 'CLOSED');
        const body = {
            channelIndex: 2,
            deviceId: this.accessory.context.device.id,
        };
        await this.platform.connector.apiCall('device/control/startImpulse', body);
        callback(null);
    }
    updateDevice(hmIPDevice, groups) {
        super.updateDevice(hmIPDevice, groups);
        for (const id in hmIPDevice.functionalChannels) {
            const channel = hmIPDevice.functionalChannels[id];
            if (channel.functionalChannelType === 'IMPULSE_OUTPUT_CHANNEL') {
                const impulseOutputChannel = channel;
                this.platform.log.debug(`Garage door update: ${JSON.stringify(channel)}`);
                if (this.targetDoorState !== this.getHmKitCurrentDoorState(this.currentDoorState)) {
                    this.previousDoorState = this.currentDoorState;
                    this.currentDoorState = this.getHmIPCurrentDoorState(this.targetDoorState);
                    this.platform.log.info('Garage door state of %s changed to %s', this.accessory.displayName, this.currentDoorState);
                    this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.getHmKitCurrentDoorState(this.currentDoorState));
                }
                if (impulseOutputChannel.processing !== null && impulseOutputChannel.processing !== this.processing) {
                    this.processing = impulseOutputChannel.processing;
                    this.platform.log.debug('Garage door processing state of %s changed to %s', this.accessory.displayName, this.processing);
                    if (!this.processing && this.currentDoorState !== DoorState.OPEN && this.currentDoorState !== DoorState.CLOSED) {
                        this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.platform.Characteristic.CurrentDoorState.STOPPED);
                    }
                }
                this.updateTargetDoorState();
            }
        }
    }
    getHmKitCurrentDoorState(hmIPDoorState) {
        switch (hmIPDoorState) {
            case DoorState.CLOSED:
                return this.platform.Characteristic.CurrentDoorState.CLOSED;
            case DoorState.OPEN:
                return this.platform.Characteristic.CurrentDoorState.OPEN;
            case DoorState.VENTILATION_POSITION:
                return this.platform.Characteristic.CurrentDoorState.STOPPED;
            case DoorState.POSITION_UNKNOWN:
                if (this.previousDoorState === DoorState.CLOSED) {
                    return this.platform.Characteristic.CurrentDoorState.OPENING;
                }
                else {
                    return this.platform.Characteristic.CurrentDoorState.CLOSING;
                }
        }
    }
    getHmIPCurrentDoorState(hmKitDoorState) {
        switch (hmKitDoorState) {
            case this.platform.Characteristic.CurrentDoorState.CLOSED:
                return DoorState.CLOSED;
            case this.platform.Characteristic.CurrentDoorState.OPEN:
                return DoorState.OPEN;
            case this.platform.Characteristic.CurrentDoorState.STOPPED:
                return DoorState.VENTILATION_POSITION;
            case this.platform.Characteristic.CurrentDoorState.OPENING:
                return DoorState.POSITION_UNKNOWN;
            case this.platform.Characteristic.CurrentDoorState.CLOSING:
                return DoorState.POSITION_UNKNOWN;
        }
        return DoorState.POSITION_UNKNOWN;
    }
    updateTargetDoorState() {
        let newTargetDoorState;
        if (this.processing) {
            if (this.previousDoorState === DoorState.CLOSED) {
                newTargetDoorState = this.platform.Characteristic.TargetDoorState.OPEN;
            }
            else {
                newTargetDoorState = this.platform.Characteristic.TargetDoorState.CLOSED;
            }
        }
        else {
            if (this.currentDoorState === DoorState.CLOSED) {
                newTargetDoorState = this.platform.Characteristic.TargetDoorState.CLOSED;
            }
            else {
                newTargetDoorState = this.platform.Characteristic.TargetDoorState.OPEN;
            }
        }
        if (newTargetDoorState !== this.targetDoorState) {
            this.targetDoorState = newTargetDoorState;
            this.platform.log.info('Garage door target door state of %s logically changed to %s', this.accessory.displayName, this.targetDoorState);
            this.service.updateCharacteristic(this.platform.Characteristic.TargetDoorState, this.targetDoorState);
        }
    }
}
exports.HmIPGarageDoorController = HmIPGarageDoorController;
//# sourceMappingURL=HmIPGarageDoorController.js.map