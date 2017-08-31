import * as vscode from 'vscode';
import * as gitflowUtils from '../helpers/gitflowUtils';
import * as gitUtils from '../helpers/gitUtils';
import * as path from 'path';
import { ConfigSettings } from '../settings/configSettings';

///<reference path="../settings/configSettings.ts" />
export function run(outChannel) {
    let configSettings = new ConfigSettings('master', 'develop', 'feature/', 'release/', 'hotfix/');
    var itemPickList = [
        {
            label: "Initialize with defaults",
            description: "Initialize gitflow with [develop], [master], [feature/], [release/], and [hotfix/]"
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
        else {
            vscode.window.showInputBox({ prompt: 'Branch name for production releases: [master]'}).then(val => setMaster(configSettings, val));
        }
    });
}

function setMaster(configSettings, val) {
    if(val !== '')
        configSettings.master = val;
    vscode.window.showInputBox({ prompt: 'Branch name for "next release" development: [develop]'}).then(val => setDevelop(configSettings, val));
}

function setDevelop(configSettings, val) {
    if(val !== '')
        configSettings.develop = val;
    vscode.window.showInputBox({ prompt: 'Feature branch development: [feature/]'}).then(val => setFeature(configSettings, val));
}

function setFeature(configSettings, val) {
    if(val !== '')
        configSettings.features = val;
    vscode.window.showInputBox({ prompt: 'Release branch development: [release/]'}).then(val => setRelease(configSettings, val));
}

function setRelease(configSettings, val) {
    if(val !== '')
        configSettings.releases = val;
    vscode.window.showInputBox({ prompt: 'Hotfix branch development: [hotfix/]'}).then(val => setHotfix(configSettings, val));
}

function setHotfix(configSettings, val) {
    if(val !== '')
        configSettings.hotfixes = val;
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