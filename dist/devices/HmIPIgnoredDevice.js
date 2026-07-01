"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmIPIgnoredDevice = void 0;
const HmIPGenericDevice_1 = require("./HmIPGenericDevice");
/**
 * Device known to the plugin but intentionally not exposed to HomeKit.
 */
class HmIPIgnoredDevice extends HmIPGenericDevice_1.HmIPGenericDevice {
    hidden = true;
    constructor(platform, accessory, reason) {
        super(platform, accessory);
        this.hidden = true;
        this.platform.log.info('Ignoring %s (%s): %s', accessory.context.device.label, accessory.context.device.modelType, reason);
    }
}
exports.HmIPIgnoredDevice = HmIPIgnoredDevice;
//# sourceMappingURL=HmIPIgnoredDevice.js.map