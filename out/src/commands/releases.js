"use strict";
var vscode = require('vscode');
var gitflowUtils = require('../helpers/gitflowUtils');
var gitUtils = require('../helpers/gitUtils');
function run(outChannel) {
    var itemPickList = [
        {
            label: "Start Release",
            description: ""
        },
        {
            label: "Finish Release",
            description: ""
        }
    ];
    vscode.window.showQuickPick(itemPickList).then(function (item) {
        if (!item)
            return;
        outChannel.clear();
        if (item.label === itemPickList[0].label)
            vscode.window.showInputBox({ prompt: 'Name of Release: ' }).then(function (val) { return startRelease(outChannel, val); });
        else
            finishRelease(outChannel);
    });
}
exports.run = run;
function startRelease(outChannel, releaseName) {
    gitUtils.getGitRepositoryPath(vscode.window.activeTextEditor.document.fileName).then(function (gitRepositoryPath) {
        gitflowUtils.startRelease(gitRepositoryPath, releaseName).then(startRelease, genericErrorHandler);
        function startRelease(log) {
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
function finishRelease(outChannel) {
    gitUtils.getGitRepositoryPath(vscode.window.activeTextEditor.document.fileName).then(function (gitRepositoryPath) {
        gitflowUtils.finishRelease(gitRepositoryPath).then(finishRelease, genericErrorHandler);
        function finishRelease(log) {
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
//# sourceMappingURL=releases.js.map