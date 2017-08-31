'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const gitUtils = require("../helpers/gitUtils");
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
    if (branchName.indexOf('/') > 0) {
        var index = branchName.indexOf('/');
        if (index === branchName.length - 1)
            return true;
    }
    else if (branchName.indexOf('.lock') >= 0) {
        var index = branchName.indexOf('.lock');
        if (index === branchName.length - 5)
            return true;
    }
    else if (branchName.indexOf('.') >= 0)
        return true;
    else if (branchName.indexOf('..') >= 0)
        return true;
    else if (branchName.indexOf('~') >= 0)
        return true;
    else if (branchName.indexOf('^') >= 0)
        return true;
    else if (branchName.indexOf(':') >= 0)
        return true;
    else if (branchName.indexOf('\\') >= 0)
        return true;
    else
        return false;
}
function initializeRepository(rootDir) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        const config = vscode_1.workspace.getConfiguration();
        const configValues = config.get('gitflow4code.init');
        return new Promise(function (resolve, reject) {
            let log = '';
            let error = '';
            gitUtils.checkForBranch(rootDir, configValues.master).then(function (result) {
                if (!result) {
                    let options = { cwd: rootDir };
                    let spawn = require('child_process').spawn;
                    let ls = spawn(gitExecutable, ['branch', configValues.master], options);
                    ls.stdout.on('data', function (data) {
                        log += data + '\n';
                    });
                    ls.stderr.on('data', function (data) {
                        error += data + '\n';
                    });
                    ls.on('exit', function (code) {
                        if (code > 0)
                            return;
                        log += 'Created production branch ' + configValues.master + '\n\n';
                    });
                }
                gitUtils.checkForBranch(rootDir, configValues.develop).then(function (result) {
                    if (!result) {
                        let options = { cwd: rootDir };
                        let spawn = require('child_process').spawn;
                        let ls = spawn(gitExecutable, ['checkout', '-b', configValues.develop], options);
                        ls.stdout.on('data', function (data) {
                            log += data + '\n';
                        });
                        ls.stderr.on('data', function (data) {
                            error += data + '\n';
                        });
                        ls.on('exit', function (code) {
                            if (code > 0) {
                                reject(error);
                                return;
                            }
                            var message = log;
                            if (code === 0 && error.length > 0)
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
exports.initializeRepository = initializeRepository;
function startFeature(rootDir, featureName, baseBranch) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            const config = vscode_1.workspace.getConfiguration();
            const configValues = config.get('gitflow4code.init');
            const featurePrefix = configValues.features;
            featureName = featureName.replace(/ /g, '_');
            if (hasIllegalChars(featureName))
                reject('Branch name has illegal characters\n' +
                    'A branch name can not:\n' +
                    '\t- Have a path component that begins with "."\n' +
                    '\t- Have a double dot ".."\n' +
                    '\t- Have an ASCII control character, "~", "^", ":" or SP, anywhere\n' +
                    '\t- End with a "/"\n' +
                    '\t- End with ".lock"\n' +
                    '\t- Contain a "\" (backslash))');
            else {
                if (!baseBranch)
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
                    if (code > 0) {
                        reject(error);
                        return;
                    }
                    var message = log;
                    if (code === 0 && error.length > 0)
                        message += '\n\n' + error;
                    resolve(message);
                });
            }
        });
    });
}
exports.startFeature = startFeature;
function finishFeature(rootDir) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
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
            ls1.on('exit', function (code) {
                if (code > 0) {
                    reject(error);
                    return;
                }
                currentBranch = branchData.replace(/ /g, '').trim().split('\n')[0];
                const config = vscode_1.workspace.getConfiguration();
                const configValues = config.get('gitflow4code.init');
                const featurePrefix = configValues.features;
                inFeature = currentBranch.startsWith(featurePrefix);
                if (!inFeature) {
                    reject('Not currently on a Feature branch');
                    return;
                }
                let ls2 = spawn(gitExecutable, ['checkout', configValues.develop], options);
                ls2.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls2.stderr.on('data', function (data) {
                    error += data;
                });
                ls2.on('exit', function (code) {
                    if (code > 0) {
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
                            if (code > 0) {
                                reject(error);
                                return;
                            }
                            var message = log;
                            if (code === 0 && error.length > 0)
                                message += '\n\n' + error;
                            resolve(message);
                        });
                    });
                });
            });
        });
    });
}
exports.finishFeature = finishFeature;
function startRelease(rootDir, releaseName) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            const config = vscode_1.workspace.getConfiguration();
            const configValues = config.get('gitflow4code.init');
            const releasePrefix = configValues.releases;
            releaseName = releaseName.replace(/ /g, '_');
            if (hasIllegalChars(releaseName))
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
                let ls = spawn(gitExecutable, ['checkout', '-b', releasePrefix + releaseName, configValues.develop], options);
                let log = '';
                let error = '';
                ls.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls.stderr.on('data', function (data) {
                    error += data;
                });
                ls.on('exit', function (code) {
                    if (code > 0) {
                        reject(error);
                        return;
                    }
                    var message = log;
                    if (code === 0 && error.length > 0)
                        message += '\n\n' + error;
                    resolve(message);
                });
            }
        });
    });
}
exports.startRelease = startRelease;
function finishRelease(rootDir, releaseTag) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
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
            ls1.on('exit', function (code) {
                if (code > 0) {
                    reject(error);
                    return;
                }
                currentBranch = branchData.replace(/ /g, '').trim().split('\n')[0];
                const config = vscode_1.workspace.getConfiguration();
                const configValues = config.get('gitflow4code.init');
                const releasePrefix = configValues.releases;
                inRelease = currentBranch.startsWith(releasePrefix);
                if (!inRelease) {
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
                    if (code > 0) {
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
                        let ls4 = spawn(gitExecutable, ['checkout', configValues.develop], options);
                        ls4.stdout.on('data', function (data) {
                            log += data + '\n';
                        });
                        ls4.stderr.on('data', function (data) {
                            error += data;
                        });
                        ls4.on('exit', function (code) {
                            if (code > 0) {
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
                                    if (code > 0) {
                                        reject(error);
                                        return;
                                    }
                                    var message = log;
                                    if (code === 0 && error.length > 0)
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
exports.finishRelease = finishRelease;
function startHotfix(rootDir, hotfixName) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            const config = vscode_1.workspace.getConfiguration();
            const configValues = config.get('gitflow4code.init');
            const hotfixPrefix = configValues.hotfixes;
            hotfixName = hotfixName.replace(/ /g, '_');
            if (hasIllegalChars(hotfixName))
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
                let ls = spawn(gitExecutable, ['checkout', '-b', hotfixPrefix + hotfixName, configValues.master], options);
                let log = '';
                let error = '';
                ls.stdout.on('data', function (data) {
                    log += data + '\n';
                });
                ls.stderr.on('data', function (data) {
                    error += data;
                });
                ls.on('exit', function (code) {
                    if (code > 0) {
                        reject(error);
                        return;
                    }
                    var message = log;
                    if (code === 0 && error.length > 0)
                        message += '\n\n' + error;
                    resolve(message);
                });
            }
        });
    });
}
exports.startHotfix = startHotfix;
function finishHotfix(rootDir, hotfixTag) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
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
            ls1.on('exit', function (code) {
                if (code > 0) {
                    reject(error);
                    return;
                }
                currentBranch = branchData.replace(/ /g, '').trim().split('\n')[0];
                const config = vscode_1.workspace.getConfiguration();
                const configValues = config.get('gitflow4code.init');
                const hotfixPrefix = configValues.hotfixes;
                inHotfix = currentBranch.startsWith(hotfixPrefix);
                if (!inHotfix) {
                    reject('Not currently on a Hotfix branch');
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
                    if (code > 0) {
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
                        let ls4 = spawn(gitExecutable, ['checkout', configValues.develop], options);
                        ls4.stdout.on('data', function (data) {
                            log += data + '\n';
                        });
                        ls4.stderr.on('data', function (data) {
                            error += data;
                        });
                        ls4.on('exit', function (code) {
                            if (code > 0) {
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
                                    if (code > 0) {
                                        reject(error);
                                        return;
                                    }
                                    var message = log;
                                    if (code === 0 && error.length > 0)
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
exports.finishHotfix = finishHotfix;
//# sourceMappingURL=gitflowUtils.js.map