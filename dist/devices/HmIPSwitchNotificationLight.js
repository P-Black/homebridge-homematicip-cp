"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmIPSwitchNotificationLight = void 0;
const HmIPGenericDevice_1 = require("./HmIPGenericDevice");
class NotificationLight {
    index;
    label;
    simpleColor;
    service;
    hue = 0;
    saturation = 0;
    lightness = 0;
    brightness = 0;
    on = false;
    constructor(name, channelIdx, lightbulb) {
        this.label = name;
        this.index = channelIdx;
        this.service = lightbulb;
    }
}
/* HmIP color palette based on HSL values */
const HmIPColorPaletteHSL = new Map([
    ['BLACK', [0, 0, 0]],
    ['BLUE', [240, 100, 50]],
    ['GREEN', [120, 100, 50]],
    ['TURQUOISE', [180, 100, 50]],
    ['RED', [0, 100, 50]],
    ['PURPLE', [300, 100, 50]],
    ['YELLOW', [60, 100, 50]],
    ['WHITE', [0, 0, 100]]
]);
const HmIPTopLightChannelIndex = 2;
const HmIPBottomLightChannelIndex = 3;
/**
 * HomematicIP switch with notification light
 *
 * Switches
 *
 * HMIP-BSL (Brand Switch Notification Light)
 *
 */
class HmIPSwitchNotificationLight extends HmIPGenericDevice_1.HmIPGenericDevice {
    service;
    on = false;
    button1Led;
    button2Led;
    topLight;
    bottomLight;
    simpleSwitch = false;
    constructor(platform, accessory) {
        super(platform, accessory);
        this.platform.log.debug(`Created switch ${accessory.context.device.label}`);
        this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.label);
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .on('get', this.handleOnGet.bind(this))
            .on('set', this.handleOnSet.bind(this));
        this.simpleSwitch = this.accessoryConfig?.['simpleSwitch'] === true;
        if (!this.simpleSwitch) {
            this.button1Led = this.accessory.getServiceById(this.platform.Service.Lightbulb, 'Button1');
            if (!this.button1Led) {
                this.button1Led = new this.platform.Service.Lightbulb(accessory.context.device.label, 'Button1');
                if (this.button1Led) {
                    this.button1Led = this.accessory.addService(this.button1Led);
                }
                else {
                    this.platform.log.error('Error adding service to %s for button 1 led', accessory.context.device.label);
                }
            }
            this.button2Led = this.accessory.getServiceById(this.platform.Service.Lightbulb, 'Button2');
            if (!this.button2Led) {
                this.button2Led = new this.platform.Service.Lightbulb(accessory.context.device.label, 'Button2');
                if (this.button2Led) {
                    this.button2Led = this.accessory.addService(this.button2Led);
                }
                else {
                    this.platform.log.error('Error adding service to %s for button 2 led', accessory.context.device.label);
                }
            }
            this.button1Led.getCharacteristic(this.platform.Characteristic.On)
                .on('get', this.handleButton1LedOnGet.bind(this))
                .on('set', this.handleButton1LedOnSet.bind(this));
            this.button1Led.getCharacteristic(this.platform.Characteristic.Brightness)
                .on('get', this.handleButton1LedBrightnessGet.bind(this))
                .on('set', this.handleButton1LedBrightnessSet.bind(this));
            this.button1Led.getCharacteristic(this.platform.Characteristic.Hue)
                .on('get', this.handleButton1LedHueGet.bind(this))
                .on('set', this.handleButton1LedHueSet.bind(this));
            this.button1Led.getCharacteristic(this.platform.Characteristic.Saturation)
                .on('get', this.handleButton1LedSaturationGet.bind(this))
                .on('set', this.handleButton1LedSaturationSet.bind(this));
            this.button2Led.getCharacteristic(this.platform.Characteristic.On)
                .on('get', this.handleButton2LedOnGet.bind(this))
                .on('set', this.handleButton2LedOnSet.bind(this));
            this.button2Led.getCharacteristic(this.platform.Characteristic.Brightness)
                .on('get', this.handleButton2LedBrightnessGet.bind(this))
                .on('set', this.handleButton2LedBrightnessSet.bind(this));
            this.button2Led.getCharacteristic(this.platform.Characteristic.Hue)
                .on('get', this.handleButton2LedHueGet.bind(this))
                .on('set', this.handleButton2LedHueSet.bind(this));
            this.button2Led.getCharacteristic(this.platform.Characteristic.Saturation)
                .on('get', this.handleButton2LedSaturationGet.bind(this))
                .on('set', this.handleButton2LedSaturationSet.bind(this));
            this.topLight = new NotificationLight('Button 1', HmIPTopLightChannelIndex, this.button1Led);
            this.bottomLight = new NotificationLight('Button 2', HmIPBottomLightChannelIndex, this.button2Led);
        }
        else {
            const topLightService = this.accessory.getServiceById(this.platform.Service.Lightbulb, 'Button1');
            if (topLightService !== undefined) {
                this.accessory.removeService(topLightService);
            }
            const bottomLightService = this.accessory.getServiceById(this.platform.Service.Lightbulb, 'Button2');
            if (bottomLightService !== undefined) {
                this.accessory.removeService(bottomLightService);
            }
            this.platform.log.info('Removing light services from %s (config=%s)', accessory.context.device.label, this.simpleSwitch);
        }
        this.updateDevice(accessory.context.device, platform.groups);
    }
    handleOnGet(callback) {
        this.platform.log.debug('Current switch state of %s is %s', this.accessory.displayName, this.on ? 'ON' : 'OFF');
        callback(null, this.on);
    }
    async handleOnSet(value, callback) {
        this.platform.log.info('Setting switch %s to %s', this.accessory.displayName, value ? 'ON' : 'OFF');
        const body = {
            channelIndex: 1,
            deviceId: this.accessory.context.device.id,
            on: value,
        };
        await this.platform.connector.apiCall('device/control/setSwitchState', body);
        callback(null, value);
    }
    handleButton1LedOnGet(callback) {
        this.platform.log.debug('Get light state of %s:%s (%s)', this.accessory.displayName, this.topLight.label, (this.topLight.on == true) ? 'ON' : 'OFF');
        callback(null, this.topLight?.on);
    }
    async handleButton1LedOnSet(value, callback) {
        this.platform.log.info('Set light state of %s:%s to %s', this.accessory.displayName, this.topLight.label, (Boolean(value)) ? 'ON' : 'OFF');
        if (value && this.topLight.brightness === 0) {
            await this.handleButton1LedBrightnessSet(100, callback);
        }
        else if (!value) {
            await this.handleButton1LedBrightnessSet(0, callback);
        }
        else {
            callback(null, value);
        }
    }
    handleButton1LedBrightnessGet(callback) {
        this.platform.log.debug('Get light brightness of %s:%s (%s %%)', this.accessory.displayName, this.topLight.label, this.topLight.brightness);
        callback(null, this.topLight.brightness);
    }
    async handleButton1LedBrightnessSet(value, callback) {
        this.platform.log.debug('Set light brightness of %s:%s to %s %%', this.accessory.displayName, this.topLight.label, value);
        const body = {
            channelIndex: HmIPTopLightChannelIndex,
            deviceId: this.accessory.context.device.id,
            dimLevel: value / 100.0,
        };
        await this.platform.connector.apiCall('device/control/setDimLevel', body);
        callback(null, value);
    }
    handleButton1LedHueGet(callback) {
        this.platform.log.debug('Get light hue of %s:%s (%s)', this.accessory.displayName, this.topLight.label, this.topLight.hue);
        callback(null, this.topLight.hue);
    }
    async handleButton1LedHueSet(value, callback) {
        this.topLight.hue = value;
        const color = this.getNearestHmIPColorFromHSL(this.topLight.hue, this.topLight.saturation, this.topLight.lightness);
        this.platform.log.debug('Set light hue of %s:%s to %s (%s)', this.accessory.displayName, this.topLight.label, this.topLight.hue, color);
        const body = {
            channelIndex: HmIPTopLightChannelIndex,
            deviceId: this.accessory.context.device.id,
            dimLevel: this.topLight.brightness / 100.0,
            simpleRGBColorState: color
        };
        await this.platform.connector.apiCall('device/control/setSimpleRGBColorDimLevel', body);
        callback(null, value);
    }
    handleButton1LedSaturationGet(callback) {
        this.platform.log.debug('Get light saturation of %s:%s (%s %%)', this.accessory.displayName, this.topLight.label, this.topLight.saturation);
        callback(null, this.topLight.saturation);
    }
    async handleButton1LedSaturationSet(value, callback) {
        this.topLight.saturation = value;
        this.platform.log.debug('Set light saturation of %s:%s to %s %%', this.accessory.displayName, this.topLight.label, value);
        callback(null, value);
    }
    handleButton2LedOnGet(callback) {
        this.platform.log.debug('Get light state of %s:%s (%s)', this.accessory.displayName, this.bottomLight.label, (this.bottomLight.on == true) ? 'ON' : 'OFF');
        callback(null, this.bottomLight.on);
    }
    async handleButton2LedOnSet(value, callback) {
        this.platform.log.info('Set light state of %s:%s to %s', this.accessory.displayName, this.bottomLight.label, (Boolean(value)) ? 'ON' : 'OFF');
        if (value && this.bottomLight.brightness === 0) {
            await this.handleButton2LedBrightnessSet(100, callback);
        }
        else if (!value) {
            await this.handleButton2LedBrightnessSet(0, callback);
        }
        else {
            callback(null, value);
        }
    }
    handleButton2LedBrightnessGet(callback) {
        this.platform.log.debug('Get light brightness of %s:%s (%s %%)', this.accessory.displayName, this.bottomLight.label, this.bottomLight.brightness);
        callback(null, this.bottomLight.brightness);
    }
    async handleButton2LedBrightnessSet(value, callback) {
        this.platform.log.debug('Set light brightness of %s:%s to %s %%', this.accessory.displayName, this.bottomLight.label, value);
        const body = {
            channelIndex: HmIPBottomLightChannelIndex,
            deviceId: this.accessory.context.device.id,
            dimLevel: value / 100.0,
        };
        await this.platform.connector.apiCall('device/control/setDimLevel', body);
        callback(null, value);
    }
    handleButton2LedHueGet(callback) {
        this.platform.log.debug('Get light hue of %s:%s (%s)', this.accessory.displayName, this.bottomLight.label, this.bottomLight.hue);
        callback(null, this.bottomLight.hue);
    }
    async handleButton2LedHueSet(value, callback) {
        this.bottomLight.hue = value;
        const color = this.getNearestHmIPColorFromHSL(this.bottomLight.hue, this.bottomLight.saturation, this.bottomLight.lightness);
        this.platform.log.debug('Set light hue of %s:%s to %s (%s)', this.accessory.displayName, this.bottomLight.label, this.bottomLight.hue, color);
        const body = {
            channelIndex: HmIPBottomLightChannelIndex,
            deviceId: this.accessory.context.device.id,
            dimLevel: this.bottomLight.brightness / 100.0,
            simpleRGBColorState: color
        };
        await this.platform.connector.apiCall('device/control/setSimpleRGBColorDimLevel', body);
        callback(null, value);
    }
    handleButton2LedSaturationGet(callback) {
        this.platform.log.debug('Get light saturation of %s:%s (%s %%)', this.accessory.displayName, this.bottomLight.label, this.bottomLight.saturation);
        callback(null, this.bottomLight.saturation);
    }
    async handleButton2LedSaturationSet(value, callback) {
        this.bottomLight.saturation = value;
        this.platform.log.debug('Set light saturation of %s:%s to %s %%', this.accessory.displayName, this.bottomLight.label, value);
        callback(null, value);
    }
    updateLightState(light, channel) {
        if (light.index === channel.index && light.service !== undefined) {
            if (light.label !== channel.label) {
                light.label = channel.label;
                this.platform.log.debug('Update light label of %s to %s', this.accessory.displayName, light.label);
                light.service.displayName = light.label;
                light.service.updateCharacteristic(this.platform.Characteristic.Name, light.label);
            }
            if (light.on !== channel.on) {
                light.on = channel.on;
                this.platform.log.debug('Update light state of %s:%s to %s', this.accessory.displayName, light.label, light.on ? 'ON' : 'OFF');
                light.service.updateCharacteristic(this.platform.Characteristic.On, light.on);
            }
            const brightness = channel.dimLevel * 100.0;
            if (brightness !== null && brightness !== light.brightness) {
                light.brightness = brightness;
                this.platform.log.debug('Update light brightness of %s:%s to %s %%', this.accessory.displayName, light.label, light.brightness.toFixed(0));
                light.service.updateCharacteristic(this.platform.Characteristic.Brightness, light.brightness);
            }
            if (light.simpleColor !== channel.simpleRGBColorState) {
                const newColor = channel.simpleRGBColorState;
                this.platform.log.debug('Update light color of %s:%s to %s', this.accessory.displayName, light.label, newColor);
                const hsl = HmIPColorPaletteHSL.get(newColor);
                if (hsl !== undefined) {
                    light.simpleColor = newColor;
                    if (newColor !== 'BLACK') {
                        light.hue = hsl[0];
                        light.saturation = hsl[1];
                        light.lightness = hsl[2];
                        light.service.updateCharacteristic(this.platform.Characteristic.Hue, light.hue);
                        light.service.updateCharacteristic(this.platform.Characteristic.Saturation, light.saturation);
                    }
                }
                else {
                    this.platform.log.error('Light color not supported for %s:%s', this.accessory.displayName, light.label);
                }
            }
        }
    }
    updateDevice(hmIPDevice, groups) {
        super.updateDevice(hmIPDevice, groups);
        for (const id in hmIPDevice.functionalChannels) {
            const channel = hmIPDevice.functionalChannels[id];
            //this.platform.log.info(`Switch update: ${JSON.stringify(channel)}`);
            if (channel.functionalChannelType === 'SWITCH_CHANNEL') {
                const switchChannel = channel;
                this.platform.log.debug(`Switch update: ${JSON.stringify(channel)}`);
                if (switchChannel.on !== null && switchChannel.on !== this.on) {
                    this.on = switchChannel.on;
                    this.platform.log.info('Switch state of %s changed to %s', this.accessory.displayName, this.on ? 'ON' : 'OFF');
                    this.service.updateCharacteristic(this.platform.Characteristic.On, this.on);
                }
            }
            if (channel.functionalChannelType === 'NOTIFICATION_LIGHT_CHANNEL' && !this.simpleSwitch) {
                const notificationLightChannel = channel;
                this.updateLightState(this.topLight, notificationLightChannel);
                this.updateLightState(this.bottomLight, notificationLightChannel);
            }
        }
    }
    /* loop over HmIPColorPaletteHSL and find nearest color to a given HSL */
    getNearestHmIPColorFromHSL(h, s, l) {
        let minDistance = 360;
        let nearestHmIPColor;
        for (const [key, value] of HmIPColorPaletteHSL) {
            const hsb = value;
            const dh = Math.min(Math.abs(h - hsb[0]), 360 - Math.abs(h - hsb[0])) / 180.0;
            const ds = Math.abs(s - hsb[1]) / 100.0;
            const dl = Math.abs(l - hsb[2]) / 100.0;
            const distance = Math.sqrt(dh * dh + ds * ds + dl * dl);
            if (distance <= minDistance) {
                minDistance = distance;
                nearestHmIPColor = key;
            }
        }
        this.platform.log.debug('Function:getNearestHmIPColorFromHSL() for h:%s s:%s l:%s is %s with distance %s', h, s, l, nearestHmIPColor, minDistance);
        return nearestHmIPColor;
    }
}
exports.HmIPSwitchNotificationLight = HmIPSwitchNotificationLight;
//# sourceMappingURL=HmIPSwitchNotificationLight.js.map