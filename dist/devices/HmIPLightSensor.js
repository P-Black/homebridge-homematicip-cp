"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmIPLightSensor = void 0;
const HmIPGenericDevice_1 = require("./HmIPGenericDevice");
/**
 * HomematicIP light sensor
 *
 * HmIP-SLO (Light Sensor outdoor)
 */
class HmIPLightSensor extends HmIPGenericDevice_1.HmIPGenericDevice {
    service;
    averageIllumination = 0;
    constructor(platform, accessory) {
        super(platform, accessory);
        this.platform.log.debug('Created light sensor %s', accessory.context.device.label);
        this.service = this.accessory.getService(this.platform.Service.LightSensor)
            || this.accessory.addService(this.platform.Service.LightSensor);
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.label);
        this.updateDevice(accessory.context.device, platform.groups);
        this.service.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
            .on('get', this.handleCurrentAmbientLightLevelGet.bind(this));
    }
    handleCurrentAmbientLightLevelGet(callback) {
        callback(null, this.averageIllumination);
    }
    updateDevice(hmIPDevice, groups) {
        super.updateDevice(hmIPDevice, groups);
        for (const id in hmIPDevice.functionalChannels) {
            const channel = hmIPDevice.functionalChannels[id];
            if (channel.functionalChannelType === 'LIGHT_SENSOR_CHANNEL') {
                const lightSensorChannel = channel;
                this.platform.log.debug('Light sensor update: %s', JSON.stringify(channel));
                if (lightSensorChannel.averageIllumination !== null && lightSensorChannel.averageIllumination !== this.averageIllumination) {
                    this.averageIllumination = lightSensorChannel.averageIllumination;
                    this.platform.log.debug('Average light level of %s changed to %s lx', this.accessory.displayName, this.averageIllumination);
                    this.service.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, this.averageIllumination);
                }
            }
        }
    }
}
exports.HmIPLightSensor = HmIPLightSensor;
//# sourceMappingURL=HmIPLightSensor.js.map