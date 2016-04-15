'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as featureCommands from './commands/features';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "gitflow4code" is now active!');
    var outChannel;
    outChannel = vscode.window.createOutputChannel('Git');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('gitflow.GitFlow', () => {
        // The code you place here will be executed every time your command is executed
        var itemPickList = [
            { 
                label: "Start Feature",
                description: ""
            },
            {
                label: "Finish Feature",
                description: ""
            }
        ];
        vscode.window.showQuickPick(itemPickList).then(function(item) {
            if(!item) return;
            
            outChannel.clear();
            if(item.label === itemPickList[0].label)
                vscode.window.showInputBox({ prompt: 'Name of Feature: ' }).then(val => featureCommands.runStartFeature(outChannel, val));
            else
                featureCommands.runFinishFeature(outChannel);
            
        });
        
    });

    context.subscriptions.push(disposable);
    
}

// this method is called when your extension is deactivated
export function deactivate() {
}