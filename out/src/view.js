"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StatusBarView {
    constructor(statusBarItem) {
        this._statusBarItem = statusBarItem;
        this._statusBarItem.command = "extension.gitflow4code";
    }
    refresh(text) {
        this._statusBarItem.text = 'Finish feature';
        this._statusBarItem.show();
    }
}
exports.StatusBarView = StatusBarView;
//# sourceMappingURL=view.js.map