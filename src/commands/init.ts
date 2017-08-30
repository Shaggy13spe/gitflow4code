import * as vscode from 'vscode';
import * as gitflowUtils from '../helpers/gitflowUtils';
import * as gitUtils from '../helpers/gitUtils';
import * as path from 'path';

export function run(outChannel) {
    var itemPickList = [
        {
            label: "Initialize with defaults",
            description: "Initialize gitflow with [develop], [master], [feature], [release], [hotfix], and [support]"
        },
        {
            label: "Initialize with custom values",
            description: "Initialize gitflow with custom values"
        }
    ];
    vscode.window.showQuickPick(itemPickList).then(function(item) {
        if(!item) return;

        outChannel.clear();
        if(item.label === itemPickList[0].label)
            initializeWithDefaults(outChannel);
    });
}

function initializeWithDefaults(outChannel) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function(getGitRepositoryPath) {
        gitflowUtils.initializeWithDefaults(getGitRepositoryPath).then(initializeSuccess, initializeFailed);
            function initializeSuccess(log) {
                if(log.length === 0) {
                    vscode.window.showInformationMessage('Nothing to show');
                    return;
                }

                outChannel.append(log);
                outChannel.show();
            }
            function initializeFailed(error) {
                if(error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
                    vscode.window.showErrorMessage('Cannot find git installation');
                else {
                    outChannel.appendLine(error);
                    outChannel.show();
                    vscode.window.showErrorMessage('There was an error, please view details in output log');
                }
            }
        }).catch(function (error) {
            if(error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
                vscode.window.showErrorMessage('Cannot find git installation');
            else {
                outChannel.appendLine(error);
                outChannel.show();
                vscode.window.showErrorMessage('There was an error, please view details in output log');
            }
    }).catch(function (error) {
        if(error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
            vscode.window.showErrorMessage('Cannot find git installation');
        else {
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage('There was an error, please view details in output log');
        }
    });
}

export function checkForInit(outChannel, branchName) {
    if(!branchName) return;

    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function(getGitRepositoryPath) {
        gitflowUtils.checkForBranch(getGitRepositoryPath, branchName).then(initializeSuccess, initializeFailed);
            function initializeSuccess(log) {
                if(log.length === 0) {
                    return false;
                }

                outChannel.append(log);
                outChannel.show();
            }
            function initializeFailed(error) {
                if(error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
                    vscode.window.showErrorMessage('Cannot find git installation');
                else {
                    outChannel.appendLine(error);
                    outChannel.show();
                    vscode.window.showErrorMessage('There was an error, please view details in output log');
                }
            }
        }).catch(function (error) {
            if(error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
                vscode.window.showErrorMessage('Cannot find git installation');
            else {
                outChannel.appendLine(error);
                outChannel.show();
                vscode.window.showErrorMessage('There was an error, please view details in output log');
            }
    }).catch(function (error) {
        if(error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
            vscode.window.showErrorMessage('Cannot find git installation');
        else {
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage('There was an error, please view details in output log');
        }
    });
}