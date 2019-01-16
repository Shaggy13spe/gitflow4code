'use strict';

import { Git, IGit } from './git/git';
import { ConfigurationChangeEvent, Disposable, window, WindowState, workspace, WorkspaceFolder, WorkspaceFoldersChangeEvent } from 'vscode';

export { IGit }

export class GitService implements Disposable {
    private readonly _disposable: Disposable;

    constructor() {
        this._disposable = Disposable.from();
    }

    static initialize(): Promise<IGit> {
        return Git.getGitInfo();
    }

    dispose() {
        this._disposable && this._disposable.dispose();
    }
}
