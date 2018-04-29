'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { workspace, window, commands, extensions, Disposable } from 'vscode';
import * as initCommands from './commands/init';
import * as featureCommands from './commands/features';
import * as releaseCommands from './commands/releases';
import * as hotfixCommands from './commands/hotfixes';
import * as gitCommands from './commands/gitCommands';
import { InitConfigSettings } from './settings/configSettings';
import { getCurrentBranchName } from '../src/helpers/gitUtils';
import { toDisposable } from './util';

const config = workspace.getConfiguration(); 
const api = extensions.getExtension('vscode.git').exports;
const initValues = config.get('gitflow4code.init') as InitConfigSettings;
const showStatusBarFinisher = config.get('gitflow4code.showStatusBarFinisher') as boolean;

async function init(context: vscode.ExtensionContext, disposables: Disposable[]): Promise<void> {
    const outChannel = window.createOutputChannel('Git');
    disposables.push(outChannel);

    if(showStatusBarFinisher) {
        let statusFinisher = new FinishStatusItem();
        context.subscriptions.push(statusFinisher);
    }

    let initializeCommand = vscode.commands.registerCommand('gitflow.initialize', () => { initCommands.run(outChannel); });
    let startFeatureCommand = vscode.commands.registerCommand('gitflow.startFeature', () => { featureCommands.run(outChannel, 'start'); });
    let finishFeatureCommand = vscode.commands.registerCommand('gitflow.finishFeature', () => { featureCommands.run(outChannel, 'finish'); });
    let startReleaseCommand = vscode.commands.registerCommand('gitflow.startRelease', () => { releaseCommands.run(outChannel, 'start'); });
    let finishReleaseCommand = vscode.commands.registerCommand('gitflow.finishRelease', () => { releaseCommands.run(outChannel, 'finish'); });
    let startHotfixCommand = vscode.commands.registerCommand('gitflow.startHotfix', () => { hotfixCommands.run(outChannel, 'start'); });
    let releaseHotfixCommand = vscode.commands.registerCommand('gitflow.finishHotfix', () => { hotfixCommands.run(outChannel, 'finish'); });
    let gitStatusCommand = vscode.commands.registerCommand('gitflow.gitStatus', () => { gitCommands.run(outChannel); });

    context.subscriptions.push(initializeCommand);
    context.subscriptions.push(startFeatureCommand);
    context.subscriptions.push(finishFeatureCommand);
    context.subscriptions.push(startReleaseCommand);
    context.subscriptions.push(finishReleaseCommand);
    context.subscriptions.push(startHotfixCommand);
    context.subscriptions.push(releaseHotfixCommand);
    context.subscriptions.push(gitStatusCommand);
    
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): any {
    const disposables: Disposable[] = [];
    context.subscriptions.push(new Disposable(() => Disposable.from(...disposables).dispose()));

    init(context, disposables).catch(err => console.error(err));

    if(showStatusBarFinisher){
        let statusFinisher = new FinishStatusItem();
        getCurrentBranchName(vscode.workspace.rootPath).then((branchName) => {
            if(branchName.toString().startsWith(initValues.features)
                || branchName.toString().startsWith(initValues.releases)
                || branchName.toString().startsWith(initValues.hotfixes)) {

                statusFinisher.showStatusItem(branchName);
            }
            else
                statusFinisher.closeStatusItem();
        });

        // create file watcher to see if ./.git/HEAD has changed. If so, this an indication 
        // that the branch has changed
        const watcher = workspace.createFileSystemWatcher('**/.git/HEAD'); 

        watcher.onDidChange(() => {
            getCurrentBranchName(vscode.workspace.rootPath).then((branchName) => {
                if(branchName.toString().startsWith(initValues.features)
                    || branchName.toString().startsWith(initValues.releases)
                    || branchName.toString().startsWith(initValues.hotfixes)) {

                    statusFinisher.showStatusItem(branchName);
                }
                else
                    statusFinisher.closeStatusItem();
            });
        });
    }    
}

class FinishStatusItem {
    private _statusBarItem: vscode.StatusBarItem;

    public showStatusItem(branchName) {
        if(!this._statusBarItem)
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
             
        this._statusBarItem.text = '$(git-merge) Finish ' + branchName;

        let command = '';
        if(branchName.toString().startsWith(initValues.features))
            command = 'gitflow.finishFeature';
        else if(branchName.toString().startsWith(initValues.releases))
            command = 'gitflow.finishRelease';
        else if(branchName.toString().startsWith(initValues.hotfixes))
            command = 'gitflow.finishHotfix';

        this._statusBarItem.command = command;
        this._statusBarItem.show();
    }

    public closeStatusItem() {
        this._statusBarItem.hide();
    }

    dispose() {
        this._statusBarItem.dispose();
    }

}

// this method is called when your extension is deactivated
export function deactivate() {
}