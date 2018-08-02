'use strict';
import * as vscode from 'vscode';
import { workspace, extensions  } from 'vscode';
import * as path from 'path';
import * as child_process_1 from 'child_process';
import * as fs from 'fs';
import * as gitUtils from '../helpers/gitUtils';
import { InitConfigSettings } from '../settings/configSettings';
import { BranchSetting } from '../settings/branchSettings';

const api = extensions.getExtension('vscode.git').exports;

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
    else if(branchName.indexOf('/.') >= 0)
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

export function initializeRepository(rootDir) {
    return api.getGitPath().then(function(gitExecutable) {

        const config = workspace.getConfiguration(); 
        const configValues = config.get('gitflow4code.init') as InitConfigSettings;
        return new Promise(function(resolve, reject) {
            let log = '';
            let error = '';
            gitUtils.checkForBranch(rootDir, configValues.master).then(function(result) {
                if(!result) {
                    let options = { cwd: rootDir };
                    let spawn = require('child_process').spawn;
                    let ls = spawn(gitExecutable, ['branch', configValues.master], options);
                    ls.stdout.on('data', function(data) {
                        log += data + '\n';
                    });
                    ls.stderr.on('data', function(data) {
                        error += data + '\n';
                    });
                    ls.on('exit', function(code) {
                        if(code > 0) return;

                        log += 'Created production branch ' +  configValues.master + '\n\n';
                    });
                }
                gitUtils.checkForBranch(rootDir, configValues.develop).then(function(result) {
                    if(!result) {
                        let options = { cwd: rootDir };
                        let spawn = require('child_process').spawn;
                        let ls = spawn(gitExecutable, ['checkout', '-b', configValues.develop], options);
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
                    }
                    else
                        resolve('Repository already initialized');
                });
            });
            
        });

        
        
    });
}

export function startFeature(rootDir, featureName, baseBranch) {
    return api.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            const config = workspace.getConfiguration(); 
            const configValues = config.get('gitflow4code.init') as InitConfigSettings;
            const featurePrefix = configValues.features;
            
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
                    baseBranch = configValues.develop;

                let options = { cwd: rootDir };
                let spawn = require('child_process').spawn;
                let ls = spawn(gitExecutable, ['checkout', '-b', featurePrefix + featureName, baseBranch], options);
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

export function finishFeature(rootDir, featureName, baseBranch, deleteBranch) {
    return api.getGitPath().then(function (gitExecutable) {
        return new Promise(function(resolve, reject) {
            let options = { cwd: rootDir };
            let spawn = require('child_process').spawn;
            let log = '';
            let error = '';
            let ls1 = spawn(gitExecutable, ['checkout', baseBranch], options);
            ls1.stdout.on('data', function (data) {
                log += data + '\n';
            });
            ls1.stderr.on('data', function (data) {
                error += data;
            });
            ls1.on('exit', function (code) {
                if(code > 0) {
                    reject(error);
                    return;
                }

                let ls2 = spawn(gitExecutable, ['merge', '--no-ff', featureName], options);
                ls2.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls2.stderr.on('data', function (data) {
                    error += data;
                });
                ls2.on('exit', function (code) {
                    if(deleteBranch) {
                        let ls3 = spawn(gitExecutable, ['branch', '-d', featureName], options);
                        ls3.stdout.on('data', function (data) {
                            log += data + '\n';
                        });
                        ls3.stderr.on('data', function (data) {
                            error += data;
                        });
                        ls3.on('exit', function (code) {
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
                    else {
                        if(code > 0) {
                            reject(error);
                            return;
                        }
                        var message = log;
                        if(code === 0 && error.length > 0)
                            message += '\n\n' + error;
                            
                        resolve(message);
                    }
                });
            });
        });
    });
}

export function startRelease(rootDir, releaseName, baseBranch) {
    return api.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            const config = workspace.getConfiguration(); 
            const configValues = config.get('gitflow4code.init') as InitConfigSettings;
            const releasePrefix = configValues.releases;
            
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
                if(!baseBranch)
                    baseBranch = configValues.develop;

                let options = { cwd: rootDir };
                let spawn = require('child_process').spawn;
                let ls = spawn(gitExecutable, ['checkout', '-b', releasePrefix + releaseName, baseBranch], options);
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

export function finishRelease(rootDir, baseBranch, releaseTag, deleteBranch) {
    return api.getGitPath().then(function (gitExecutable) {
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
                const config = workspace.getConfiguration(); 
                const configValues = config.get('gitflow4code.init') as InitConfigSettings;
                const releasePrefix = configValues.releases;
                inRelease = currentBranch.startsWith(releasePrefix);
                
                if(!inRelease) {
                    reject('Not currently on a Release branch');
                    return;
                }
                let ls2 = spawn(gitExecutable, ['checkout', configValues.master], options);
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
                        if(code > 0) {
                            reject(error);
                            return;
                        }
                        
                        let ls4 = spawn(gitExecutable, ['tag', releaseTag], options);
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
            
                            let ls5 = spawn(gitExecutable, ['checkout', baseBranch], options);
                            ls5.stdout.on('data', function (data) {
                                log += data + '\n';
                            });
                            ls5.stderr.on('data', function (data) {
                                error += data;
                            });
                            ls5.on('exit', function (code) {
                                if(code > 0) {
                                    reject(error);
                                    return;
                                }
                
                                let ls6 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                                ls6.stdout.on('data', function (data) {
                                    log += data + '\n';
                                });
                                ls6.stderr.on('data', function (data) {
                                    error += data;
                                });
                                ls6.on('exit', function (code) {
                                    if(deleteBranch) {
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
                                    }
                                    else {
                                        if(code > 0) {
                                            reject(error);
                                            return;
                                        }
                                        var message = log;
                                        if(code === 0 && error.length > 0)
                                            message += '\n\n' + error;
                                            
                                        resolve(message);
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

export function startHotfix(rootDir, hotfixName, baseBranch) {
    return api.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            const config = workspace.getConfiguration(); 
            const configValues = config.get('gitflow4code.init') as InitConfigSettings;
            const hotfixPrefix = configValues.hotfixes;
            
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
                if(!baseBranch)
                    baseBranch = configValues.master;

                let options = { cwd: rootDir };
                let spawn = require('child_process').spawn;
                let ls = spawn(gitExecutable, ['checkout', '-b', hotfixPrefix + hotfixName, baseBranch], options);
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

export function finishHotfix(rootDir, baseBranch, hotfixTag, deleteBranch) {
    return api.getGitPath().then(function (gitExecutable) {
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
                const config = workspace.getConfiguration(); 
                const configValues = config.get('gitflow4code.init') as InitConfigSettings;
                const hotfixPrefix = configValues.hotfixes;
                inHotfix = currentBranch.startsWith(hotfixPrefix);
                
                if(!inHotfix) {
                    reject('Not currently on a Hotfix branch');
                    return;
                }
                let ls2 = spawn(gitExecutable, ['checkout', baseBranch], options);
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
                        if(code > 0) {
                            reject(error);
                            return;
                        }

                        let ls4 = spawn(gitExecutable, ['tag', hotfixTag], options);
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
            
                            let ls5 = spawn(gitExecutable, ['checkout', configValues.develop], options);
                            ls5.stdout.on('data', function (data) {
                                log += data + '\n';
                            });
                            ls5.stderr.on('data', function (data) {
                                error += data;
                            });
                            ls5.on('exit', function (code) {
                                if(code > 0) {
                                    reject(error);
                                    return;
                                }
                
                                let ls6 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                                ls6.stdout.on('data', function (data) {
                                    log += data + '\n';
                                });
                                ls6.stderr.on('data', function (data) {
                                    error += data;
                                });
                                ls6.on('exit', function (code) {
                                    if(deleteBranch) {
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
                                    }
                                    else {
                                        if(code > 0) {
                                            reject(error);
                                            return;
                                        }
                                        var message = log;
                                        if(code === 0 && error.length > 0)
                                            message += '\n\n' + error;
                                            
                                        resolve(message);
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

