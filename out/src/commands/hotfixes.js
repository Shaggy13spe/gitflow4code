"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const gitflowUtils = require("../helpers/gitflowUtils");
const gitUtils = require("../helpers/gitUtils");
const branchSettings_1 = require("../settings/branchSettings");
const config = vscode_1.workspace.getConfiguration();
const configValues = config.get('gitflow4code.init');
function run(outChannel) {
    var itemPickList = [
        {
            label: 'Start Hotfix from ' + configValues.master,
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
    vscode.window.showQuickPick(itemPickList).then(function (item) {
        if (!item)
            return;
        outChannel.clear();
        if (item.label === itemPickList[0].label)
            vscode.window.showInputBox({ prompt: 'Name of Hotfix: ' }).then(val => startHotfix(outChannel, val, configValues.master));
        else if (item.label === itemPickList[1].label)
            getBranchNames(outChannel, item.label);
        else
            vscode.window.showInputBox({ prompt: 'Tag this hotfix with: ' }).then(val => finishHotfix(outChannel, val));
    });
}
exports.run = run;
function getBranchNames(outChannel, branchName) {
    var branchList = gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getBranchList(gitRepositoryPath).then((branches) => {
            var branchList = branches;
            var filteredBranchList = branchList.map((value) => {
                // if(value.replace('*', '').trim() !== configValues.develop || value.replace('*', '').trim().startsWith(configValues.hotfixes))
                return value.replace('*', '').trim();
            }).filter(x => !!x);
            var branchPickList = [];
            filteredBranchList.forEach(branchName => {
                if (branchName === configValues.develop)
                    branchPickList.push({ label: configValues.develop, description: 'create hotfix branch using ' + configValues.master + ' as your base' });
                else
                    branchPickList.push({ label: branchName, description: 'create hotfix branch using ' + branchName + ' as your base' });
            });
            vscode.window.showQuickPick(branchPickList).then(function (item) {
                if (!item)
                    return;
                outChannel.clear();
                vscode.window.showInputBox({ prompt: 'Name of Release: ' }).then(val => startHotfix(outChannel, val, item.label));
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
function startHotfix(outChannel, hotfixName, baseBranch) {
    if (hotfixName !== undefined)
        if (hotfixName !== '')
            gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
                gitflowUtils.startHotfix(gitRepositoryPath, hotfixName, baseBranch)
                    .then(startHotfix, genericErrorHandler)
                    .catch(genericErrorHandler);
            }).catch(genericErrorHandler);
        else
            genericErrorHandler('Name of hotfix cannot be blank');
    function startHotfix(log) {
        if (log.length === 0) {
            vscode.window.showInformationMessage('Nothing to show');
            return;
        }
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
function finishHotfix(outChannel, hotfixTag) {
    gitUtils.getGitRepositoryPath(vscode.workspace.rootPath).then(function (gitRepositoryPath) {
        gitUtils.getCurrentBranchName(vscode.workspace.rootPath).then((branchName) => {
            let hotfixesConfig = config.get('gitflow4code.hotfixes');
            let hotfixSetting = hotfixesConfig.find((hotfix) => hotfix.name === branchName.toString());
            if (!hotfixSetting)
                hotfixSetting = new branchSettings_1.BranchSetting(branchName.toString(), configValues.develop);
            gitflowUtils.finishHotfix(gitRepositoryPath, hotfixSetting.base, hotfixTag).then(finishHotfix, genericErrorHandler);
            function finishHotfix(log) {
                if (log.length === 0) {
                    vscode.window.showInformationMessage('Nothing to show');
                    return;
                }
                outChannel.append(log);
                outChannel.show();
            }
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
//# sourceMappingURL=hotfixes.js.map