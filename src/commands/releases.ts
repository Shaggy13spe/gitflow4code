import * as vscode from 'vscode';
import { workspace } from 'vscode';
import * as gitflowUtils from '../helpers/gitflowUtils';
import * as gitUtils from '../helpers/gitUtils';
import * as path from 'path';
import { ConfigSettings } from '../settings/configSettings';
import { BranchSetting } from '../settings/branchSettings';

const config = workspace.getConfiguration();
const configValues = config.get('gitflow4code.init') as ConfigSettings;

export function run(outChannel) {
    var itemPickList = [
            { 
                label: 'Start Release from ' + configValues.develop,
                description: ''
            },
            { 
                label: 'Start Release from another base branch',
                description: ''
            },
            {
                label: 'Finish Release',
                description: ''
            }
        ];
    vscode.window.showQuickPick(itemPickList).then(function(item) {
        if(!item) return;
        
        outChannel.clear();
        if(item.label === itemPickList[0].label)
            vscode.window.showInputBox({ prompt: 'Name of Release: ' }).then(val => startRelease(outChannel, val, configValues.develop));
        else if(item.label === itemPickList[1].label)
            getBranchNames(outChannel, item.label);
        else 
            vscode.window.showInputBox({ prompt: 'Tag this release with: ' }).then(val => finishRelease(outChannel, val));
    
    });
}

function getBranchNames(outChannel, branchName) {
    var branchList = gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getBranchList(gitRepositoryPath).then((branches) => {

            var branchList = branches as string[];
            
            var filteredBranchList = branchList.map((value) => {
                // if(value.replace('*', '').trim() !== configValues.master && !value.replace('*', '').trim().startsWith(configValues.hotfixes))
                return value.replace('*', '').trim();
            }).filter(x => !!x);
        
            var branchPickList = [];
            filteredBranchList.forEach(branchName => {
                if(branchName === configValues.develop)
                    branchPickList.push( { label: configValues.develop, description: 'create release branch using ' + configValues.develop + ' as your base'});
                else
                    branchPickList.push( { label: branchName, description: 'create release branch using ' + branchName + ' as your base'});
            });
        
            vscode.window.showQuickPick(branchPickList).then(function(item) {
                if(!item) return;
        
                outChannel.clear();
                vscode.window.showInputBox({ prompt: 'Name of Release: ' }).then(val => startRelease(outChannel, val, item.label));
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

function startRelease(outChannel, releaseName, baseBranch) {
    if(releaseName !== undefined) // User chose to Cancel/Esc operation
        if(releaseName !== '')
            gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
                gitflowUtils.startRelease(gitRepositoryPath, releaseName, baseBranch)
                    .then(startRelease, genericErrorHandler)
                    .catch(genericErrorHandler)
            }).catch(genericErrorHandler);
        else
            genericErrorHandler('Name of release cannot be blank');

    function startRelease(log) {
        if(log.length === 0) {
            vscode.window.showInformationMessage('Nothing to show');
            return;
        }

        let releasesConfig = config.get('gitflow4code.releases') as BranchSetting[];
        releasesConfig.push(new BranchSetting(configValues.releases + releaseName, baseBranch));
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

function finishRelease(outChannel, releaseTag) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getCurrentBranchName(vscode.workspace.rootPath).then((branchName) => {
            let releasesConfig = config.get('gitflow4code.releases') as BranchSetting[];
            let releaseSetting = releasesConfig.find((release) => release.name === branchName.toString());
            if(!releaseSetting)
                releaseSetting = new BranchSetting(branchName.toString(), configValues.develop);
            
            gitflowUtils.finishRelease(gitRepositoryPath, releaseSetting.base, releaseTag).then(finishRelease, genericErrorHandler);
            function finishRelease(log) {
                if(log.length === 0) {
                    vscode.window.showInformationMessage('Nothing to show');
                    return;
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