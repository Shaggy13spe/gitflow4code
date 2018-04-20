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

export function run(outChannel) {
    var itemPickList = [
            { 
                label: 'Start Hotfix from ' + initValues.master,
                description: ''
            },
            { 
                label: 'Start Hotfix from another base branch',
                description: ''
            },
            {
                label: 'Finish Hotfix',
                description: ''
            }
        ];
    vscode.window.showQuickPick(itemPickList).then(function(item) {
        if(!item) return;
        
        outChannel.clear();
        if(item.label === itemPickList[0].label)
            vscode.window.showInputBox({ prompt: 'Name of Hotfix: ' }).then(val => startHotfix(outChannel, val, initValues.master));
        else if(item.label === itemPickList[1].label)
            getBranchNames(outChannel, item.label);
        else {
            if(askForDeletion)
                vscode.window.showInputBox({ prompt: 'Tag this hotfix with: ' }).then(function(tag) {
                    vscode.window.showInputBox({ prompt: 'Would you like this hotfix branch deleted after finishing? (y/n)' }).then(function(val) {
                        if(val !== undefined && (val.toLowerCase() === 'y' ||  val.toLowerCase() === 'n')) { 
                            var deleteBranch = val.toLowerCase() === 'y';
                            finishHotfix(outChannel, tag, val);
                        }
                    });
                });
            else
                vscode.window.showInputBox({ prompt: 'Tag this hotfix with: ' }).then(tag => finishHotfix(outChannel, tag, false));
        }
    });
}

function getBranchNames(outChannel, branchName) {
    var branchList = gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getBranchList(gitRepositoryPath).then((branches) => {

            var branchList = branches as string[];
            
            var filteredBranchList = branchList.map((value) => {
                // if(value.replace('*', '').trim() !== configValues.develop || value.replace('*', '').trim().startsWith(configValues.hotfixes))
                return value.replace('*', '').trim();
            }).filter(x => !!x);
        
            var branchPickList = [];
            filteredBranchList.forEach(branchName => {
                if(branchName === initValues.develop)
                    branchPickList.push( { label: initValues.develop, description: 'create hotfix branch using ' + initValues.master + ' as your base'});
                else
                branchPickList.push( { label: branchName, description: 'create hotfix branch using ' + branchName + ' as your base'});
            });
        
            vscode.window.showQuickPick(branchPickList).then(function(item) {
                if(!item) return;
        
                outChannel.clear();
                vscode.window.showInputBox({ prompt: 'Name of Release: ' }).then(val => startHotfix(outChannel, val, item.label));
            });
        }, genericErrorHandler);
    });

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

function startHotfix(outChannel, hotfixName, baseBranch) {
    if(hotfixName !== undefined) // User chose to Cancel/Esc operation
        if(hotfixName !== '')
            gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
                gitflowUtils.startHotfix(gitRepositoryPath, hotfixName, baseBranch)
                    .then(startHotfix, genericErrorHandler)
                    .catch(genericErrorHandler)
            }).catch(genericErrorHandler);
        else
            genericErrorHandler('Name of hotfix cannot be blank');

    function startHotfix(log) {
        if(log.length === 0) {
            vscode.window.showInformationMessage('Nothing to show');
            return;
        }
        
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

function finishHotfix(outChannel, hotfixTag, deleteBranch) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getCurrentBranchName(vscode.workspace.rootPath).then((branchName) => {
            let hotfixesConfig = config.get('gitflow4code.hotfixes') as BranchSetting[];
            let hotfixSetting = hotfixesConfig.find((hotfix) => hotfix.name === branchName.toString());
            if(!hotfixSetting)
                hotfixSetting = new BranchSetting(branchName.toString(), initValues.develop);

            gitflowUtils.finishHotfix(gitRepositoryPath, hotfixSetting.base, hotfixTag, deleteBranch).then(finishHotfix, genericErrorHandler);
            function finishHotfix(log) {
                if(log.length === 0) {
                    vscode.window.showInformationMessage('Nothing to show');
                    return;
                }

                if(deleteBranch) {
                    let hotfixIndex = hotfixesConfig.indexOf(hotfixSetting);
                    hotfixesConfig.splice(hotfixIndex, 1);
                    config.update('gitflow4code.releases', hotfixesConfig);
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