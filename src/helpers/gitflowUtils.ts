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

export function checkForBranch(rootDir, branchName) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            let options = { cwd: rootDir };
            let spawn = require('child_process').spawn;
            let ls = spawn(gitExecutable, ['show-ref', '--verify', '--quiet', 'refs/heads/' + branchName], options);
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

export function initializeWithDefaults(rootDir) {
    return gitUtils.getGitPath().then(function(gitExecutable) {
        return new Promise(function(resolve, reject) {
            let options = { cwd: rootDir };
            let spawn = require('child_process').spawn;
            let ls = spawn(gitExecutable, ['checkout', '-b', 'develop'], options);
            let log = '';
            let error = '';
            ls.stdout.on('data', function(data) {
                log += data + '\n';
            });
            ls.stderr.on('data', function(data) {
                error += data + '\n';
            });
            ls.on('exit', function(code) {
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

export function startFeature(rootDir, featureName, baseBranch) {
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
                if(!baseBranch)
                    baseBranch = 'develop';

                let options = { cwd: rootDir };
                let spawn = require('child_process').spawn;
                let ls = spawn(gitExecutable, ['checkout', '-b', 'feature/' + featureName, baseBranch], options);
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
            let ls1 = spawn(gitExecutable, ['rev-parse', '--abbrev-ref', 'HEAD'], options);
            var branchData = '';
            var inFeature = false;
            var currentBranch = '';
            let log = '';
            let error = '';
            ls1.stdout.on('data', function (data) {
                branchData += data;
            });
            ls1.stderr.on('data', function (data) {
                error += data;
            });
            ls1.on('exit', function(code) {
                if(code > 0) {
                    reject(error);
                    return;
                }

                currentBranch = branchData.replace(/ /g,'').trim().split('\n')[0];
                inFeature = currentBranch.startsWith('feature/');

                if(!inFeature) {
                    reject('Not currently on a Feature branch');
                    return;
                }
                let ls2 = spawn(gitExecutable, ['checkout', 'develop'], options);
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
    
                    let ls3 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                    ls3.stdout.on('data', function (data) {
                        log += data + '\n';
                    });
                    ls3.stderr.on('data', function (data) {
                        error += data;
                    });
                    ls3.on('exit', function (code) {
                        let ls4 = spawn(gitExecutable, ['branch', '-d', currentBranch], options);
                        ls4.stdout.on('data', function (data) {
                            log += data + '\n';
                        });
                        ls4.stderr.on('data', function (data) {
                            error += data;
                        });
                        ls4.on('exit', function (code) {
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
                let ls = spawn(gitExecutable, ['checkout', '-b', 'release/' + releaseName, 'develop'], options);
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
            let ls1 = spawn(gitExecutable, ['rev-parse', '--abbrev-ref', 'HEAD'], options);
            var branchData = '';
            var inRelease = false;
            var currentBranch = '';
            let log = '';
            let error = '';
            ls1.stdout.on('data', function (data) {
                branchData += data;
            });
            ls1.stderr.on('data', function (data) {
                error += data;
            });
            ls1.on('exit', function(code) {
                if(code > 0) {
                    reject(error);
                    return;
                }

                currentBranch = branchData.replace(/ /g,'').trim().split('\n')[0];
                inRelease = currentBranch.startsWith('release/');
                
                if(!inRelease) {
                    reject('Not currently on a Release branch');
                    return;
                }
                let ls2 = spawn(gitExecutable, ['checkout', 'master'], options);
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
    
                    let ls3 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                    ls3.stdout.on('data', function (data) {
                        log += data + '\n';
                    });
                    ls3.stderr.on('data', function (data) {
                        error += data;
                    });
                    ls3.on('exit', function (code) {
                        let ls4 = spawn(gitExecutable, ['checkout', 'develop'], options);
                        ls4.stdout.on('data', function (data) {
                            log += data + '\n';
                        });
                        ls4.stderr.on('data', function (data) {
                            error += data;
                        });
                        ls4.on('exit', function (code) {
                            if(code > 0) {
                                reject(error);
                                return;
                            }
            
                            let ls5 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                            ls5.stdout.on('data', function (data) {
                                log += data + '\n';
                            });
                            ls5.stderr.on('data', function (data) {
                                error += data;
                            });
                            ls5.on('exit', function (code) {
                                let ls6 = spawn(gitExecutable, ['branch', '-d', currentBranch], options);
                                ls6.stdout.on('data', function (data) {
                                    log += data + '\n';
                                });
                                ls6.stderr.on('data', function (data) {
                                    error += data;
                                });
                                ls6.on('exit', function (code) {
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
                let ls = spawn(gitExecutable, ['checkout', '-b', 'hotfix/' + hotfixName, 'master'], options);
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
            let ls1 = spawn(gitExecutable, ['rev-parse', '--abbrev-ref', 'HEAD'], options);
            var branchData = '';
            var inHotfix = false;
            var currentBranch = '';
            let log = '';
            let error = '';
            ls1.stdout.on('data', function (data) {
                branchData += data;
            });
            ls1.stderr.on('data', function (data) {
                error += data;
            });
            ls1.on('exit', function(code) {
                if(code > 0) {
                    reject(error);
                    return;
                }

                currentBranch = branchData.replace(/ /g,'').trim().split('\n')[0];
                inHotfix = currentBranch.startsWith('hotfix/');
                
                if(!inHotfix) {
                    reject('Not currently on a Hotfix branch');
                    return;
                }
                let ls2 = spawn(gitExecutable, ['checkout', 'master'], options);
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
    
                    let ls3 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                    ls3.stdout.on('data', function (data) {
                        log += data + '\n';
                    });
                    ls3.stderr.on('data', function (data) {
                        error += data;
                    });
                    ls3.on('exit', function (code) {
                        let ls4 = spawn(gitExecutable, ['checkout', 'develop'], options);
                        ls4.stdout.on('data', function (data) {
                            log += data + '\n';
                        });
                        ls4.stderr.on('data', function (data) {
                            error += data;
                        });
                        ls4.on('exit', function (code) {
                            if(code > 0) {
                                reject(error);
                                return;
                            }
            
                            let ls5 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                            ls5.stdout.on('data', function (data) {
                                log += data + '\n';
                            });
                            ls5.stderr.on('data', function (data) {
                                error += data;
                            });
                            ls5.on('exit', function (code) {
                                let ls6 = spawn(gitExecutable, ['branch', '-d', currentBranch], options);
                                ls6.stdout.on('data', function (data) {
                                    log += data + '\n';
                                });
                                ls6.stderr.on('data', function (data) {
                                    error += data;
                                });
                                ls6.on('exit', function (code) {
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
                });
            });
        });
    });
}


