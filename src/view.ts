import {StatusBarItem} from 'vscode';

export interface IView {
    /** 
     * Refresh the view
     */
    refresh(text: string): void;
}

export class StatusBarView implements IView {
    private _statusBarItem: StatusBarItem;

    constructor(statusBarItem: StatusBarItem) {
        this._statusBarItem = statusBarItem;
        this._statusBarItem.command = "extension.gitflow4code";
    }

    refresh(text: string) {
        this._statusBarItem.text = 'Finish feature';
        this._statusBarItem.show();
    }
}