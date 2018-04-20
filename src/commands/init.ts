import * as vscode from 'vscode';
import { workspace } from 'vscode';
import * as gitflowUtils from '../helpers/gitflowUtils';
import * as gitUtils from '../helpers/gitUtils';
import * as path from 'path';
import { InitConfigSettings } from '../settings/configSettings';

export function run(outChannel) {
    let configSettings = new InitConfigSettings('master', 'develop', 'feature/', 'release/', 'hotfix/');
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
            outChannel.clear();
            vscode.window.showInputBox({ prompt: 'Branch name for production releases: [master]'}).then(val => setMaster(outChannel, configSettings, val));
        }
    });
}

function setMaster(outChannel, configSettings, val) {
    if(val !== '')
        configSettings.master = val;
    vscode.window.showInputBox({ prompt: 'Branch name for "next release" development: [develop]'}).then(val => setDevelop(outChannel, configSettings, val));
}

function setDevelop(outChannel, configSettings, val) {
    if(val !== '')
        configSettings.develop = val;
    vscode.window.showInputBox({ prompt: 'Feature branch development: [feature/]'}).then(val => setFeature(outChannel, configSettings, val));
}

function setFeature(outChannel, configSettings, val) {
    if(val !== '')
        configSettings.features = val;
    vscode.window.showInputBox({ prompt: 'Release branch development: [release/]'}).then(val => setRelease(outChannel, configSettings, val));
}

function setRelease(outChannel, configSettings, val) {
    if(val !== '')
        configSettings.releases = val;
    vscode.window.showInputBox({ prompt: 'Hotfix branch development: [hotfix/]'}).then(val => setHotfix(outChannel, configSettings, val));
}

function setHotfix(outChannel, configSettings, val) {
    if(val !== '')
        configSettings.hotfixes = val;

    const config = workspace.getConfiguration(); 
    const configValues = config.get('gitflow4code.init') as InitConfigSettings;
    config.update('gitflow4code.init', configSettings, vscode.ConfigurationTarget.Workspace);
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function(getGitRepositoryPath) {
        gitflowUtils.initializeRepository(getGitRepositoryPath).then(initializeSuccess, genericErrorHandler);
            function initializeSuccess(log) {
                if(log.length === 0) {
                    vscode.window.showInformationMessage('Nothing to show');
                    return;
                }

                outChannel.append(log);
                outChannel.show();
            }
        }).catch(genericErrorHandler).catch(genericErrorHandler);

    function genericErrorHandler(error) {
        if(error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
            vscode.window.showErrorMessage('Cannot find git installation');
        else {
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage('There was an error, please view details in output log');
        }
    }
}

function initializeWithDefaults(outChannel) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function(getGitRepositoryPath) {
        gitflowUtils.initializeRepository(getGitRepositoryPath).then(initializeSuccess, genericErrorHandler);
            function initializeSuccess(log) {
                if(log.length === 0) {
                    vscode.window.showInformationMessage('Nothing to show');
                    return;
                }

                outChannel.append(log);
                outChannel.show();
            }
        }).catch(genericErrorHandler).catch(genericErrorHandler);

    function genericErrorHandler(error) {
        if(error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
            vscode.window.showErrorMessage('Cannot find git installation');
        else {
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage('There was an error, please view details in output log');
        }
    }
}