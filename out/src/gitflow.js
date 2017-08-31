'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const initCommands = require("./commands/init");
const featureCommands = require("./commands/features");
const releaseCommands = require("./commands/releases");
const hotfixCommands = require("./commands/hotfixes");
const gitCommands = require("./commands/gitCommands");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "gitflow4code" is now active!');
    // let featureFinisher = new FeatureStatusItem();
    // featureFinisher.showFeatureStatus();
    var outChannel;
    outChannel = vscode.window.createOutputChannel('Git');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('gitflow.GitFlow', () => {
        // The code you place here will be executed every time your command is executed
        var itemPickList = [
            {
                label: "Initialize",
                description: "Command to initialize the git repository for feature branch flow"
            },
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
            },
            {
                label: "Get Status",
                description: "Runs git status on command line"
            }
        ];
        vscode.window.showQuickPick(itemPickList).then(function (item) {
            if (!item)
                return;
            outChannel.clear();
            switch (item.label) {
                case itemPickList[0].label:
                    initCommands.run(outChannel);
                    break;
                case itemPickList[1].label:
                    featureCommands.run(outChannel);
                    break;
                case itemPickList[2].label:
                    releaseCommands.run(outChannel);
                    break;
                case itemPickList[3].label:
                    hotfixCommands.run(outChannel);
                    break;
                default:
                    gitCommands.run(outChannel);
                    break;
            }
        });
    });
    // context.subscriptions.push(featureFinisher);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
class FeatureStatusItem {
    showFeatureStatus() {
        if (!this._statusBarItem)
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._statusBarItem.text = 'feature test';
        this._statusBarItem.command = 'hello';
        this._statusBarItem.show();
    }
    dispose() {
        this._statusBarItem.dispose();
    }
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=gitflow.js.map