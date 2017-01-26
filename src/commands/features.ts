import * as vscode from 'vscode';
import * as gitflowUtils from '../helpers/gitflowUtils';
import * as gitUtils from '../helpers/gitUtils';
import * as path from 'path';

export function run(outChannel) {
    var itemPickList = [
            { 
                label: "Start Feature",
                description: ""
            },
            {
                label: "Finish Feature",
                description: ""
            }
        ];
    vscode.window.showQuickPick(itemPickList).then(function(item) {
        if(!item) return;
        
        outChannel.clear();
        if(item.label === itemPickList[0].label)
            vscode.window.showInputBox({ prompt: 'Name of Feature: ' }).then(val => startFeature(outChannel, val));
        else
            finishFeature(outChannel);
        
    });
}

function startFeature(outChannel, featureName) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitflowUtils.startFeature(gitRepositoryPath, featureName).then(startFeature, genericErrorHandler);
        function startFeature(log) {
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
        gitflowUtils.finishFeature(gitRepositoryPath).then(finishFeature, genericErrorHandler);
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