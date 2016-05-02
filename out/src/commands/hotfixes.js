"use strict";
var vscode = require('vscode');
var gitflowUtils = require('../helpers/gitflowUtils');
var gitUtils = require('../helpers/gitUtils');
function run(outChannel) {
    var itemPickList = [
        {
            label: "Start Hotfix",
            description: ""
        },
        {
            label: "Finish Hotfix",
            description: ""
        }
    ];
    vscode.window.showQuickPick(itemPickList).then(function (item) {
        if (!item)
            return;
        outChannel.clear();
        if (item.label === itemPickList[0].label)
            vscode.window.showInputBox({ prompt: 'Name of Hotfix: ' }).then(function (val) { return startHotfix(outChannel, val); });
        else
            finishHotfix(outChannel);
    });
}
exports.run = run;
function startHotfix(outChannel, featureName) {
    gitUtils.getGitRepositoryPath(vscode.window.activeTextEditor.document.fileName).then(function (gitRepositoryPath) {
        gitflowUtils.startHotfix(gitRepositoryPath, featureName).then(startHotfix, genericErrorHandler);
        function startHotfix(log) {
            if (log.length === 0) {
                vscode.window.showInformationMessage('Nothing to show');
                return;
            }
            outChannel.append(log);
            outChannel.show();
        }
        function genericErrorHandler(error) {
            if (error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
                vscode.window.showErrorMessage('Cannot find git installation');
            else {
                outChannel.appendLine(error);
                outChannel.show();
                vscode.window.showErrorMessage('There was an error, please view details in output log');
            }
        }
    }).catch(function (error) {
        if (error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
            vscode.window.showErrorMessage('Cannot find git installation');
        else {
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage('There was an error, please view details in output log');
        }
    });
}
function finishHotfix(outChannel) {
    gitUtils.getGitRepositoryPath(vscode.window.activeTextEditor.document.fileName).then(function (gitRepositoryPath) {
        gitflowUtils.finishHotfix(gitRepositoryPath).then(finishHotfix, genericErrorHandler);
        function finishHotfix(log) {
            if (log.length === 0) {
                vscode.window.showInformationMessage('Nothing to show');
                return;
            }
            outChannel.append(log);
            outChannel.show();
        }
        function genericErrorHandler(error) {
            if (error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
                vscode.window.showErrorMessage('Cannot find git installation');
            else {
                outChannel.appendLine(error);
                outChannel.show();
                vscode.window.showErrorMessage('There was an error, please view details in output log');
            }
        }
    }).catch(function (error) {
        if (error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
            vscode.window.showErrorMessage('Cannot find git installation');
        else {
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage('There was an error, please view details in output log');
        }
    });
}
//# sourceMappingURL=hotfixes.js.map