import * as vscode from 'vscode';
import { workspace } from 'vscode';
import * as gitflowUtils from '../helpers/gitflowUtils';
import * as gitUtils from '../helpers/gitUtils';
import * as path from 'path';
import { InitConfigSettings } from '../settings/configSettings';
import { BranchSetting } from '../settings/branchSettings';

const config = workspace.getConfiguration();
const initValues = config.get('gitflow4code.init') as InitConfigSettings;
const askForDeletion = config.get('gitflow4code.askBeforeDeletion') as Boolean;
const deleteByDefault = config.get('gitflow4code.deleteBranchByDefault') as Boolean;

export function run(outChannel, action) {
    if(action === 'start') {
        var itemPickList = [
            { 
                label: 'Start Release from ' + initValues.develop,
                description: ''
            },
            { 
                label: 'Start Release from another base branch',
                description: ''
            }
        ];
        
        vscode.window.showQuickPick(itemPickList).then(function(item) {
            if(!item) return;
            
            outChannel.clear();
            if(item.label === itemPickList[0].label)
                vscode.window.showInputBox({ prompt: 'Name of Release: ', ignoreFocusOut: true }).then(val => startRelease(outChannel, val, initValues.develop));
            else if(item.label === itemPickList[1].label)
                gitUtils.getBranchList(workspace.rootPath).then((releases) => {
                    var branchPickList = [];
                    releases.forEach(branchName => {
                        if(branchName === initValues.develop)
                            branchPickList.push( { label: initValues.develop, description: 'create release branch using ' + initValues.develop + ' as your base'});
                        else
                            branchPickList.push( { label: branchName, description: 'create release branch using ' + branchName + ' as your base'});
                    });
                
                    vscode.window.showQuickPick(branchPickList).then(function(item) {
                        if(!item) return;
                
                        outChannel.clear();
                        vscode.window.showInputBox({ prompt: 'Name of Release: ', ignoreFocusOut: true }).then(val => startRelease(outChannel, val, item.label));
                    });
                });
            else {
            }
        });
    }
    else if (action === 'finish') {
        if(askForDeletion)
            vscode.window.showInputBox({ prompt: 'Tag this release with: ', ignoreFocusOut: true }).then(function(tag) {
                vscode.window.showInputBox({ prompt: 'Would you like this release branch deleted after finishing? (y/n)', ignoreFocusOut: true }).then(function(val) {
                    if(val !== undefined && (val.toLowerCase() === 'y' ||  val.toLowerCase() === 'n')) { 
                        var deleteBranch = val.toLowerCase() === 'y';
                        finishRelease(outChannel, tag, deleteBranch); 
                    }
                });
            });
        else
            vscode.window.showInputBox({ prompt: 'Tag this release with: ', ignoreFocusOut: true }).then(tag => finishRelease(outChannel, tag, deleteByDefault));
    }
}

function startRelease(outChannel, releaseName, baseBranch) {
    if(releaseName !== undefined) // User chose to Cancel/Esc operation
        if(releaseName !== '') {
            releaseName = releaseName.trim().replace(/ /g, '_');
            gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
                gitflowUtils.startRelease(gitRepositoryPath, releaseName, baseBranch)
                    .then(startRelease, genericErrorHandler)
                    .catch(genericErrorHandler)
            }).catch(genericErrorHandler);
        }
        else
            genericErrorHandler('Name of release cannot be blank');

    function startRelease(log) {
        if(log.length === 0) {
            vscode.window.showInformationMessage('Nothing to show');
            return;
        }

        let releasesConfig = config.get('gitflow4code.releases') as BranchSetting[];
        releasesConfig.push(new BranchSetting(initValues.releases + releaseName, baseBranch));
        config.update('gitflow4code.releases', releasesConfig);
        
        outChannel.append(log);
        outChannel.show();
    }
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

function finishRelease(outChannel, releaseTag, deleteBranch) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getCurrentBranchName(vscode.workspace.rootPath).then((branchName) => {
            let releasesConfig = config.get('gitflow4code.releases') as BranchSetting[];
            let releaseSetting = releasesConfig.find((release) => release.name === branchName.toString());
            if(!releaseSetting)
                releaseSetting = new BranchSetting(branchName.toString(), initValues.develop);
            
            gitflowUtils.finishRelease(gitRepositoryPath, releaseSetting.base, releaseTag, deleteBranch).then(finishRelease, genericErrorHandler);
            function finishRelease(log) {
                if(log.length === 0) {
                    vscode.window.showInformationMessage('Nothing to show');
                    return;
                }

                if(deleteBranch) {
                    let releaseIndex = releasesConfig.indexOf(releaseSetting);
                    releasesConfig.splice(releaseIndex, 1);
                    config.update('gitflow4code.releases', releasesConfig);
                }
                
                outChannel.append(log);
                outChannel.show();
            }
        })
    }).catch(genericErrorHandler);

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