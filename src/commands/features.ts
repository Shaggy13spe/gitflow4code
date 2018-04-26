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
                label: 'Start Feature from ' + initValues.develop,
                description: ''
            },
            { 
                label: 'Start Feature from another base branch',
                description: ''
            }
        ];
        
        vscode.window.showQuickPick(itemPickList).then(function(item) {
            if(!item) return;
            
            outChannel.clear();
            if(item.label === itemPickList[0].label) 
                vscode.window.showInputBox({ prompt: 'Name of Feature: ' }).then(val => startFeature(outChannel, val, initValues.develop));
            else {
                gitUtils.getBranchList(workspace.rootPath).then((features) => {
                    var branchPickList = [];
                    features.forEach(branchName => {
                        if(branchName === initValues.develop)
                            branchPickList.push( { label: initValues.develop, description: 'create feature branch using ' + initValues.develop + ' as your base'});
                        else
                            branchPickList.push( { label: branchName, description: 'create feature branch using ' + branchName + ' as your base'});
                    });
                
                    vscode.window.showQuickPick(branchPickList).then(function(item) {
                        if(!item) return;
                
                        outChannel.clear();
                        vscode.window.showInputBox({ prompt: 'Name of Feature: ' }).then(val => startFeature(outChannel, val, item.label));
                    });
                });
            }
        });
    }
    else if (action === 'finish') {
        if(askForDeletion)
            vscode.window.showInputBox({ prompt: 'Would you like this feature branch deleted after finishing? (y/n)' }).then(function(val) {
                if(val !== undefined && (val.toLowerCase() === 'y' ||  val.toLowerCase() === 'n')) { 
                    var deleteBranch = val.toLowerCase() === 'y';
                    finishFeature(outChannel, deleteBranch); 
                }
            });
        else 
            finishFeature(outChannel, deleteByDefault);
    }
}

function startFeature(outChannel, featureName, baseBranch) {
    if(featureName !== undefined) // User chose to Cancel/Esc operation
        if(featureName !== '')
            gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
                gitflowUtils.startFeature(gitRepositoryPath, featureName, baseBranch)
                    .then(startFeature, genericErrorHandler)
                    .catch(genericErrorHandler)
            }).catch(genericErrorHandler);
        else
            genericErrorHandler('Name of feature cannot be blank');

    function startFeature(log) {
        if(log.length === 0) {
            vscode.window.showInformationMessage('Nothing to show');
            return;
        }

        let featuresConfig = config.get('gitflow4code.features') as BranchSetting[];
        featuresConfig.push(new BranchSetting(initValues.features + featureName, baseBranch));
        config.update('gitflow4code.features', featuresConfig);
        
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

function finishFeature(outChannel, deleteBranch) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getCurrentBranchName(vscode.workspace.rootPath).then((branchName) => {
            if(branchName.toString().startsWith(initValues.features)) {
                let featuresConfig = config.get('gitflow4code.features') as BranchSetting[];
                let featureSetting = featuresConfig.find((feature) => feature.name === branchName.toString());
                if(!featureSetting) 
                    featureSetting = new BranchSetting(branchName.toString(), initValues.develop);

                gitflowUtils.finishFeature(gitRepositoryPath, branchName.toString(), featureSetting.base, deleteBranch).then(finishFeature, genericErrorHandler);
                function finishFeature(log) {
                    if(log.length === 0) {
                        vscode.window.showInformationMessage('Nothing to show');
                        return;
                    }

                    if(deleteBranch) {
                        let featureIndex = featuresConfig.indexOf(featureSetting);
                        featuresConfig.splice(featureIndex, 1);
                        config.update('gitflow4code.features', featuresConfig);
                    }
                    
                    outChannel.append(log);
                    outChannel.show();
                }
                 
            }
            else 
                vscode.window.showErrorMessage('Not currently on a Feature branch');
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