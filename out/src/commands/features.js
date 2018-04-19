"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const gitflowUtils = require("../helpers/gitflowUtils");
const gitUtils = require("../helpers/gitUtils");
const branchSettings_1 = require("../settings/branchSettings");
const config = vscode_1.workspace.getConfiguration();
const initValues = config.get('gitflow4code.init');
const askForDeletion = config.get('gitflow4code.askBeforeDeletion');
function run(outChannel) {
    var itemPickList = [
        {
            label: 'Start Feature from ' + initValues.develop,
            description: ''
        },
        {
            label: 'Start Feature from another base branch',
            description: ''
        },
        {
            label: 'Finish Feature',
            description: ''
        }
    ];
    vscode.window.showQuickPick(itemPickList).then(function (item) {
        if (!item)
            return;
        outChannel.clear();
        if (item.label === itemPickList[0].label)
            vscode.window.showInputBox({ prompt: 'Name of Feature: ' }).then(val => startFeature(outChannel, val, initValues.develop));
        else if (item.label === itemPickList[1].label)
            getBranchNames(outChannel, item.label);
        else {
            if (askForDeletion)
                vscode.window.showInputBox({ prompt: 'Would you like this feature branch deleted after finishing? (y/n)' }).then(val => processFinishRequest(outChannel, val));
            else
                finishFeature(outChannel, false);
        }
    });
}
exports.run = run;
function processFinishRequest(outChannel, val) {
    if (val !== undefined && (val.toLowerCase() === 'y' || val.toLowerCase() === 'n')) {
        var deleteBranch = val.toLowerCase() === 'y';
        finishFeature(outChannel, deleteBranch);
    }
}
function getBranchNames(outChannel, branchName) {
    var branchList = gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getBranchList(gitRepositoryPath).then((branches) => {
            var branchList = branches;
            var filteredBranchList = branchList.map((value) => {
                // if(value.replace('*', '').trim() === configValues.develop || value.replace('*', '').trim().startsWith(configValues.features))
                return value.replace('*', '').trim();
            }).filter(x => !!x);
            var branchPickList = [];
            filteredBranchList.forEach(branchName => {
                if (branchName === initValues.develop)
                    branchPickList.push({ label: initValues.develop, description: 'create feature branch using ' + initValues.develop + ' as your base' });
                else
                    branchPickList.push({ label: branchName, description: 'create feature branch using ' + branchName + ' as your base' });
            });
            vscode.window.showQuickPick(branchPickList).then(function (item) {
                if (!item)
                    return;
                outChannel.clear();
                vscode.window.showInputBox({ prompt: 'Name of Feature: ' }).then(val => startFeature(outChannel, val, item.label));
            });
        }, genericErrorHandler);
    });
    function genericErrorHandler(error) {
        if (error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
            vscode.window.showErrorMessage('Cannot find git installation');
        else {
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage('There was an error, please view details in output log');
        }
    }
}
function startFeature(outChannel, featureName, baseBranch) {
    if (featureName !== undefined)
        if (featureName !== '')
            gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
                gitflowUtils.startFeature(gitRepositoryPath, featureName, baseBranch)
                    .then(startFeature, genericErrorHandler)
                    .catch(genericErrorHandler);
            }).catch(genericErrorHandler);
        else
            genericErrorHandler('Name of feature cannot be blank');
    function startFeature(log) {
        if (log.length === 0) {
            vscode.window.showInformationMessage('Nothing to show');
            return;
        }
        let featuresConfig = config.get('gitflow4code.features');
        featuresConfig.push(new branchSettings_1.BranchSetting(initValues.features + featureName, baseBranch));
        config.update('gitflow4code.features', featuresConfig);
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
}
function finishFeature(outChannel, deleteBranch) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getCurrentBranchName(vscode.workspace.rootPath).then((branchName) => {
            if (branchName.toString().startsWith(initValues.features)) {
                let featuresConfig = config.get('gitflow4code.features');
                let featureSetting = featuresConfig.find((feature) => feature.name === branchName.toString());
                if (!featureSetting)
                    featureSetting = new branchSettings_1.BranchSetting(branchName.toString(), initValues.develop);
                gitflowUtils.finishFeature(gitRepositoryPath, branchName.toString(), featureSetting.base, deleteBranch).then(finishFeature, genericErrorHandler);
                function finishFeature(log) {
                    if (log.length === 0) {
                        vscode.window.showInformationMessage('Nothing to show');
                        return;
                    }
                    if (deleteBranch) {
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
        });
    }).catch(genericErrorHandler);
    function genericErrorHandler(error) {
        if (error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git')
            vscode.window.showErrorMessage('Cannot find git installation');
        else {
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage('There was an error, please view details in output log');
        }
    }
}
//# sourceMappingURL=features.js.map