'use strict';

export class BranchSetting {

    constructor(name: string, base: string, pushAfterFinishing: boolean) {
        this.name = name;
        this.base = base;
        this.pushAfterFinishing = pushAfterFinishing;
    } 

    name: string = '';
    base: string = '';
    pushAfterFinishing: boolean = false;
}