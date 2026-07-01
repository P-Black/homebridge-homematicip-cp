"use strict";
const settings_1 = require("./settings");
const HmIPPlatform_1 = require("./HmIPPlatform");
module.exports = (api) => {
    api.registerPlatform(settings_1.PLATFORM_NAME, HmIPPlatform_1.HmIPPlatform);
};
//# sourceMappingURL=index.js.map