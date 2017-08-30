'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var initCommands = require('./commands/init');
var featureCommands = require('./commands/features');
var releaseCommands = require('./commands/releases');
var hotfixCommands = require('./commands/hotfixes');
var gitCommands = require('./commands/gitCommands');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "gitflow4code" is now active!');
    var workspace = vscode.workspace;
    // launch.json configuration
    var config = workspace.getConfiguration();
    // retrieve values for gitflow4code
    var configValues = config.get('gitflow4code');
    // let featureFinisher = new FeatureStatusItem();
    // featureFinisher.showFeatureStatus();
    var outChannel;
    outChannel = vscode.window.createOutputChannel('Git');
    //first we'll check to see if repo is initialized
    // let developExists = initCommands.checkForInit(outChannel, configValues.develop);
    // let masterExists = initCommands.checkForInit(outChannel, configValues.master);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('gitflow.GitFlow', function () {
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
    context.subscriptions.push(featureFinisher);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
var FeatureStatusItem = (function () {
    function FeatureStatusItem() {
    }
    FeatureStatusItem.prototype.showFeatureStatus = function () {
        if (!this._statusBarItem)
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._statusBarItem.text = 'feature test';
        this._statusBarItem.command = 'hello';
        this._statusBarItem.show();
    };
    FeatureStatusItem.prototype.dispose = function () {
        this._statusBarItem.dispose();
    };
    return FeatureStatusItem;
}());
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=gitflow.js.map