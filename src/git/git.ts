'use strict';

import { extensions } from 'vscode';

const gitExtension = extensions.getExtension('vscode.git').exports;
const gitApi = gitExtension.getAPI(1);

let git: IGit;

export interface IGit {
    path: string;
    version: string;
}

export class Git {
    
    static gitInfo(): IGit {
        return git;
    }

    static async getGitInfo(): Promise<IGit> {
        git = {
            path: gitApi.git.path,
            version: ''
        } 
        return git;
    }
}
