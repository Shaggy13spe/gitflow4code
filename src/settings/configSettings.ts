'use strict';

export class InitConfigSettings {

    constructor(master: string, develop: string, features: string, releases: string, hotfixes: string) {
        this.master = master;
        this.develop = develop;
        this.features = features;
        this.releases = releases;
        this.hotfixes = hotfixes;
    } 

    develop: string = '';
    master: string = '';
    releases: string = '';
    hotfixes: string = '';
    features: string = '';
    support: string = '';
}