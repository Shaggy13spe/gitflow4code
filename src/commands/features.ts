import * as vscode from 'vscode';
import { workspace } from 'vscode';
import * as gitflowUtils from '../helpers/gitflowUtils';
import * as gitUtils from '../helpers/gitUtils';
import * as path from 'path';
import { ConfigSettings } from '../settings/configSettings';
import { FeatureSetting } from '../settings/featureSettings';

const config = workspace.getConfiguration(); 
const configValues = config.get('gitflow4code.init') as ConfigSettings;

export function run(outChannel) {
    var itemPickList = [
            { 
                label: 'Start Feature from develop',
                description: ''
            },
            { 
                label: 'Start Feature from another feature branch',
                description: ''
            },
            {
                label: 'Finish Feature',
                description: ''
            }
        ];
    vscode.window.showQuickPick(itemPickList).then(function(item) {
        if(!item) return;
        
        outChannel.clear();
        if(item.label === itemPickList[0].label) 
            vscode.window.showInputBox({ prompt: 'Name of Feature: ' }).then(val => startFeature(outChannel, val, configValues.develop));
        else if(item.label === itemPickList[1].label)
            getBranchNames(outChannel, item.label);
        else
            finishFeature(outChannel);
        
    });
}

function getBranchNames(outChannel, branchName) {
    var branchList = gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getBranchList(gitRepositoryPath).then((branches) => {

            var branchList = branches as string[];
            
            var filteredBranchList = branchList.map((value) => {
                if(value.replace('*', '').trim() === configValues.develop || value.replace('*', '').trim().startsWith(configValues.features))
                    return value.replace('*', '').trim();
            }).filter(x => !!x);
        
            var branchPickList = [];
            filteredBranchList.forEach(branchName => {
                if(branchName === configValues.develop)
                    branchPickList.push( { label: configValues.develop, description: 'create feature branch using ' + configValues.develop + ' as your base'});
                else
                branchPickList.push( { label: branchName, description: 'create feature branch using ' + branchName + ' as your base'});
            });
        
            vscode.window.showQuickPick(branchPickList).then(function(item) {
                if(!item) return;
        
                outChannel.clear();
                vscode.window.showInputBox({ prompt: 'Name of Feature: ' }).then(val => startFeature(outChannel, val, item.label));
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

function startFeature(outChannel, featureName, baseBranch) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitflowUtils.startFeature(gitRepositoryPath, featureName, baseBranch).then(startFeature, genericErrorHandler);
            function startFeature(log) {
                if(log.length === 0) {
                    vscode.window.showInformationMessage('Nothing to show');
                    return;
                }

                let featuresConfig = config.get('gitflow4code.features') as FeatureSetting[];
                featuresConfig.push(new FeatureSetting(configValues.features + featureName, baseBranch));
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

function finishFeature(outChannel) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getCurrentBranchName(vscode.workspace.rootPath).then((branchName) => {
            if(branchName.toString().startsWith(configValues.features)) {
                let featuresConfig = config.get('gitflow4code.features') as FeatureSetting[];
                let featureSetting = featuresConfig.find((feature) => feature.name === branchName.toString());
                if(!featureSetting) 
                    featureSetting = new FeatureSetting(branchName.toString(), configValues.develop);
                    
                gitflowUtils.finishFeature(gitRepositoryPath, branchName.toString(), featureSetting.base).then(finishFeature, genericErrorHandler);
                function finishFeature(log) {
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
            else 
                vscode.window.showErrorMessage('Not currently on a Feature branch');
        })
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