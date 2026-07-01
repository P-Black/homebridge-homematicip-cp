"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmIPAccessory = void 0;
const settings_1 = require("./settings");
/**
 * Accessory wrapper
 */
class HmIPAccessory {
    api;
    log;
    accessory;
    isFromCache;
    constructor(api, log, accessory, isFromCache) {
        this.api = api;
        this.log = log;
        this.accessory = accessory;
        this.isFromCache = isFromCache;
    }
    register() {
        if (this.isFromCache) {
            this.log.debug('Updating accessory: %s (%s) -> uuid %s', this.accessory.displayName, this.accessory.context.device.id, this.accessory.UUID);
            this.api.updatePlatformAccessories([this.accessory]);
        }
        else {
            this.log.info('Register accessory: %s (%s) -> uuid %s', this.accessory.displayName, this.accessory.context.device.id, this.accessory.UUID);
            this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [this.accessory]);
        }
    }
}
exports.HmIPAccessory = HmIPAccessory;
//# sourceMappingURL=HmIPAccessory.js.map