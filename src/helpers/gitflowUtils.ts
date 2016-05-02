'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as child_process_1 from 'child_process';
import * as fs from 'fs';
import * as gitUtils from '../helpers/gitUtils';

export function startFeature(rootDir, featureName) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
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
        });
    });
}

export function finishRelease(rootDir) {
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
                let ls2 = spawn(gitExecutable, ['flow', 'release', 'finish', currentBranch], options);
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
        });
    });
}

export function finishHotfix(rootDir) {
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
                let ls2 = spawn(gitExecutable, ['flow', 'hotfix', 'finish', currentBranch], options);
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


