'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigSettings {
    constructor(master, develop, features, releases, hotfixes) {
        this.develop = '';
        this.master = '';
        this.releases = '';
        this.hotfixes = '';
        this.features = '';
        this.support = '';
        this.master = master;
        this.develop = develop;
        this.features = features;
        this.releases = releases;
        this.hotfixes = hotfixes;
    }
}
exports.ConfigSettings = ConfigSettings;
//# sourceMappingURL=configSettings.js.map