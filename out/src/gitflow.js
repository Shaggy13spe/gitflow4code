'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var featureCommands = require('./commands/features');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "gitflow4code" is now active!');
    var outChannel;
    outChannel = vscode.window.createOutputChannel('Git');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('gitflow.GitFlow', function () {
        // The code you place here will be executed every time your command is executed
        var itemPickList = [
            {
                label: "Features",
                description: "Commands for managing git-flow features"
            },
            {
                label: "Releases",
                description: "Commands for managing git-flow releases"
            },
            {
                label: "Hotfixes",
                description: "Commands for managing git-flow hotfixes"
            }
        ];
        vscode.window.showQuickPick(itemPickList).then(function (item) {
            if (!item)
                return;
            outChannel.clear();
            if (item.label === itemPickList[0].label)
                featureCommands.run(outChannel);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=gitflow.js.map