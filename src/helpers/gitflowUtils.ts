'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as child_process_1 from 'child_process';
import * as fs from 'fs';
import * as gitUtils from '../helpers/gitUtils';

/*
A branch name can not:
    - Have a path component that begins with "."
    - Have a double dot ".."
    - Have an ASCII control character, "~", "^", ":" or SP, anywhere
    - End with a "/"
    - End with ".lock"
    - Contain a "\" (backslash)
*/

function hasIllegalChars(branchName) {

    if(branchName.indexOf('/') > 0) {
        var index = branchName.indexOf('/');
        if(index === branchName.length - 1)
            return true;
    }
    else if(branchName.indexOf('.lock') >= 0) {
        var index = branchName.indexOf('.lock');
        if(index === branchName.length - 5)
            return true;
    }
    else if(branchName.indexOf('.') >= 0)
        return true;
    else if(branchName.indexOf('..') >= 0)
        return true;
    else if(branchName.indexOf('~') >= 0)
        return true;
    else if(branchName.indexOf('^') >= 0)
        return true;
    else if(branchName.indexOf(':') >= 0)
        return true;
    else if(branchName.indexOf('\\') >= 0)
        return true;
        
    else return false;
}

export function startFeature(rootDir, featureName) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            featureName = featureName.replace(/ /g, '_');
            
            if(hasIllegalChars(featureName)) 
                reject('Branch name has illegal characters\n' +
                    'A branch name can not:\n' +
                    '\t- Have a path component that begins with "."\n' +
                    '\t- Have a double dot ".."\n' +
                    '\t- Have an ASCII control character, "~", "^", ":" or SP, anywhere\n' +
                    '\t- End with a "/"\n' +
                    '\t- End with ".lock"\n' +
                    '\t- Contain a "\" (backslash))');
            else {
                let options = { cwd: rootDir };
                let spawn = require('child_process').spawn;
                let ls = spawn(gitExecutable, ['flow', 'feature', 'start', featureName], options);
                let log = '';
                let error = '';
                ls.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls.stderr.on('data', function (data) {
                    error += data;
                });
                ls.on('exit', function (code) {
                    if(code > 0) {
                        reject(error);
                        return;
                    }
                    var message = log;
                    if(code === 0 && error.length > 0)
                        message += '\n\n' + error;
                        
                    resolve(message);
                });
            }   
            
          
        });
    });
}

export function finishFeature(rootDir) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function(resolve, reject) {
            let options = { cwd: rootDir };
            let spawn = require('child_process').spawn;
            let ls1 = spawn(gitExecutable, ['flow', 'feature', 'list'], options);
            var branchData = '';
            var features = [];
            var inFeature = false;
            var currentBranch = '';
            ls1.stdout.on('data', function (data) {
                branchData += data;
            });
            ls1.on('exit', function(data) {
                features = branchData.replace(/ /g,'').trim().split('\n');
                features.forEach(element => {
                    if(element.indexOf('*') === 0) {
                        inFeature = true;
                        currentBranch = element.substring(1);
                        return;
                    }
                });
                if(!inFeature) {
                    reject('Not currently on a Feature branch');
                    return;
                }
                let ls2 = spawn(gitExecutable, ['flow', 'feature', 'finish', currentBranch], options);
                let log = '';
                let error = '';
                ls2.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls2.stderr.on('data', function (data) {
                    error += data;
                });
                ls2.on('exit', function (code) {
                    if(code > 0) {
                        reject(error);
                        return;
                    }
                    var message = log;
                    if(code === 0 && error.length > 0)
                        message += '\n\n' + error;
                        
                    resolve(message);
                });
            });
        });
    });
}

export function startRelease(rootDir, releaseName) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            releaseName = releaseName.replace(/ /g, '_');
            
            if(hasIllegalChars(releaseName)) 
                reject('Branch name has illegal characters\n' +
                    'A branch name can not:\n' +
                    '\t- Have a path component that begins with "."\n' +
                    '\t- Have a double dot ".."\n' +
                    '\t- Have an ASCII control character, "~", "^", ":" or SP, anywhere\n' +
                    '\t- End with a "/"\n' +
                    '\t- End with ".lock"\n' +
                    '\t- Contain a "\" (backslash))');
            else {
                let options = { cwd: rootDir };
                let spawn = require('child_process').spawn;
                let ls = spawn(gitExecutable, ['flow', 'release', 'start', releaseName], options);
                let log = '';
                let error = '';
                ls.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls.stderr.on('data', function (data) {
                    error += data;
                });
                ls.on('exit', function (code) {
                    if(code > 0) {
                        reject(error);
                        return;
                    }
                    var message = log;
                    if(code === 0 && error.length > 0)
                        message += '\n\n' + error;
                        
                    resolve(message);
                });
            }
        });
    });
}

export function finishRelease(rootDir, releaseTag) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function(resolve, reject) {
            let options = { cwd: rootDir };
            let spawn = require('child_process').spawn;
            let ls1 = spawn(gitExecutable, ['flow', 'release', 'list'], options);
            var branchData = '';
            var releases = [];
            var inRelease = false;
            var currentBranch = '';
            ls1.stdout.on('data', function (data) {
                branchData += data;
            });
            ls1.on('exit', function(data) {
                releases = branchData.replace(/ /g,'').trim().split('\n');
                releases.forEach(element => {
                    if(element.indexOf('*') === 0) {
                        inRelease = true;
                        currentBranch = element.substring(1);
                        return;
                    }
                });
                if(!inRelease) {
                    reject('Not currently on a Release branch');
                    return;
                }
                
                let ls2 = spawn(gitExecutable, ['flow', 'release', 'finish', currentBranch, '-m ' + releaseTag], options);
                let log = '';
                let error = '';
                ls2.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls2.stderr.on('data', function (data) {
                    error += data;
                });
                ls2.on('exit', function (code) {
                    if(code > 0) {
                        reject(error);
                        return;
                    }
                    var message = log;
                    if(code === 0 && error.length > 0)
                        message += '\n\n' + error;
                        
                    resolve(message);
                });
            });  
        });
    });
}

export function startHotfix(rootDir, hotfixName) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            hotfixName = hotfixName.replace(/ /g, '_');
            
            if(hasIllegalChars(hotfixName)) 
                reject('Branch name has illegal characters\n' +
                    'A branch name can not:\n' +
                    '\t- Have a path component that begins with "."\n' +
                    '\t- Have a double dot ".."\n' +
                    '\t- Have an ASCII control character, "~", "^", ":" or SP, anywhere\n' +
                    '\t- End with a "/"\n' +
                    '\t- End with ".lock"\n' +
                    '\t- Contain a "\" (backslash))');
            else {
                let options = { cwd: rootDir };
                let spawn = require('child_process').spawn;
                let ls = spawn(gitExecutable, ['flow', 'hotfix', 'start', hotfixName], options);
                let log = '';
                let error = '';
                ls.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls.stderr.on('data', function (data) {
                    error += data;
                });
                ls.on('exit', function (code) {
                    if(code > 0) {
                        reject(error);
                        return;
                    }
                    var message = log;
                    if(code === 0 && error.length > 0)
                        message += '\n\n' + error;
                        
                    resolve(message);
                });
            }
        });
    });
}

export function finishHotfix(rootDir, hotfixTag) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function(resolve, reject) {
            let options = { cwd: rootDir };
            let spawn = require('child_process').spawn;
            let ls1 = spawn(gitExecutable, ['flow', 'hotfix', 'list'], options);
            var branchData = '';
            var hotfixes = [];
            var inHotfix = false;
            var currentBranch = '';
            ls1.stdout.on('data', function (data) {
                branchData += data;
            });
            ls1.on('exit', function(data) {
                hotfixes = branchData.replace(/ /g,'').trim().split('\n');
                hotfixes.forEach(element => {
                    if(element.indexOf('*') === 0) {
                        inHotfix = true;
                        currentBranch = element.substring(1);
                        return;
                    }
                });
                if(!inHotfix) {
                    reject('Not currently on a Hotfix branch');
                    return;
                }
                let ls2 = spawn(gitExecutable, ['flow', 'hotfix', 'finish', currentBranch, '-m ' + hotfixTag], options);
                let log = '';
                let error = '';
                ls2.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls2.stderr.on('data', function (data) {
                    error += data;
                });
                ls2.on('exit', function (code) {
                    if(code > 0) {
                        reject(error);
                        return;
                    }
                    var message = log;
                    if(code === 0 && error.length > 0)
                        message += '\n\n' + error;
                        
                    resolve(message);
                });
            });  
        });
    });
}


