'use strict';
import * as vscode from 'vscode';
import { workspace, window, commands, extensions } from 'vscode';
import * as path from 'path';
import * as child_process_1 from 'child_process';
import * as fs from 'fs';

const api = extensions.getExtension('vscode.git').exports;

export function getGitRepositoryPath(fileName) {
    fileName += '/.';
    return api.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            let options = { cwd: path.dirname(fileName) };
            let util = require('util');
            let spawn = require('child_process').spawn;
            let ls = spawn(gitExecutable, ['rev-parse', '--git-dir'], options);
            let log = '';
            let error = '';
            ls.stdout.on('data', function (data) {
                log =+ data + '\n';
            });
            ls.stderr.on('data', function (data) {
                error += data;
            });
            ls.on('exit', function (code) {
                if(error.length > 0) {
                    reject(error);
                    return;
                }
                if(path.dirname(log) === '.') {
                    log = path.dirname(fileName) + '/' + log;
                }
                resolve(path.dirname(log));
            });
        }); 
    });
}

export function getStatus(rootDir) {
    return api.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            let options = { cwd: rootDir };
            let util = require('util');
            let spawn = require('child_process').spawn;
            let ls = spawn(gitExecutable, ['status'], options);
            let log = '';
            let error = '';
            ls.stdout.on('data', function (data) {
                log += data + '\n';
            });
            ls.stderr.on('data', function (data) {
                error += data;
            });
            ls.on('exit', function (data) {
                if(error.length > 0) {
                    reject(error);
                    return;
                }
                resolve(log);
            });
        });
    });
}

export function getCurrentBranchName(rootDir) {
    return api.getGitPath().then((gitExecutable) => {
        return new Promise(function (resolve, reject) {
            var options = { cwd: rootDir };
            var util = require('util');
            var spawn = require('child_process').spawn;
            var ls = spawn(gitExecutable, ['rev-parse', '--abbrev-ref', 'HEAD'], options);
            var log = '';
            var error = '';
            ls.stdout.on('data', function (data) {
                log += data + '\n';
            });
            ls.stderr.on('data', function (data) {
                error += data;
            });
            ls.on('exit', function (data) {
                if (error.length > 0) {
                    reject(error);
                    return;
                }
                resolve(log.replace(/ /g,'').trim().split('\n')[0]);
            });
        });
    });
}

export function checkForBranch(rootDir, branchName) {
    return api.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            let options = { cwd: rootDir };
            let spawn = require('child_process').spawn;
            let ls = spawn(gitExecutable, ['show-ref', '--verify', '--quiet', 'refs/heads/' + branchName], options);
            ls.on('exit', function (code) {
                resolve(code === 0);
            });
        });
    });
}

export function getBranchList(fileName) {
    return getGitRepositoryPath(fileName).then((rootDir) => {
        return api.getGitPath().then(function (gitExecutable) {
            return new Promise(function (resolve, reject) {
                let options = { cwd: rootDir };
                let util = require('util');
                let spawn = require('child_process').spawn;
                let ls = spawn(gitExecutable, ['branch'], options);
                let log = '';
                let error = '';
                ls.stdout.on('data', function (data) {
                    log += data;
    
                });
                ls.stderr.on('data', function (data) {
                    error += data;
                });
                ls.on('exit', function (data) {
                    if(error.length > 0) {
                        reject(error);
                        return;
                    }
    
                    var branchList = log.split('\n') as string[];
                
                    var filteredBranchList = branchList.map((value) => {
                        return value.replace('*', '').trim();
                    }).filter(x => !!x);
    
                    resolve(filteredBranchList);
                });
            });
        });
    });
}