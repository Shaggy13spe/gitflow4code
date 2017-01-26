"use strict";
var StatusBarView = (function () {
    function StatusBarView(statusBarItem) {
        this._statusBarItem = statusBarItem;
        this._statusBarItem.command = "extension.gitflow4code";
    }
    StatusBarView.prototype.refresh = function (text) {
        this._statusBarItem.text = 'Finish feature';
        this._statusBarItem.show();
    };
    return StatusBarView;
}());
exports.StatusBarView = StatusBarView;
//# sourceMappingURL=view.js.map