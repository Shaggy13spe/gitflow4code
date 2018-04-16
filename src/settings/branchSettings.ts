'use strict';

export class BranchSetting {

    constructor(name: string, base: string) {
        this.name = name;
        this.base = base;
    } 

    name: string = '';
    base: string = '';
}