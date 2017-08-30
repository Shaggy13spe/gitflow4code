'use strict';
var gitUtils = require('../helpers/gitUtils');
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
function checkForBranch(rootDir, branchName) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls = spawn(gitExecutable, ['show-ref', '--verify', '--quiet', 'refs/heads/' + branchName], options);
            var log = '';
            var error = '';
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
        });
    });
}
exports.checkForBranch = checkForBranch;
function initializeWithDefaults(rootDir) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls = spawn(gitExecutable, ['checkout', '-b', 'develop'], options);
            var log = '';
            var error = '';
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
        });
    });
}
exports.initializeWithDefaults = initializeWithDefaults;
function startFeature(rootDir, featureName, baseBranch) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
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
                    baseBranch = 'develop';
                var options = { cwd: rootDir };
                var spawn = require('child_process').spawn;
                var ls = spawn(gitExecutable, ['checkout', '-b', 'feature/' + featureName, baseBranch], options);
                var log_1 = '';
                var error_1 = '';
                ls.stdout.on('data', function (data) {
                    log_1 += data + '\n';
                });
                ls.stderr.on('data', function (data) {
                    error_1 += data;
                });
                ls.on('exit', function (code) {
                    if (code > 0) {
                        reject(error_1);
                        return;
                    }
                    var message = log_1;
                    if (code === 0 && error_1.length > 0)
                        message += '\n\n' + error_1;
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
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls1 = spawn(gitExecutable, ['rev-parse', '--abbrev-ref', 'HEAD'], options);
            var branchData = '';
            var inFeature = false;
            var currentBranch = '';
            var log = '';
            var error = '';
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
                inFeature = currentBranch.startsWith('feature/');
                if (!inFeature) {
                    reject('Not currently on a Feature branch');
                    return;
                }
                var ls2 = spawn(gitExecutable, ['checkout', 'develop'], options);
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
                    var ls3 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                    ls3.stdout.on('data', function (data) {
                        log += data + '\n';
                    });
                    ls3.stderr.on('data', function (data) {
                        error += data;
                    });
                    ls3.on('exit', function (code) {
                        var ls4 = spawn(gitExecutable, ['branch', '-d', currentBranch], options);
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
                var options = { cwd: rootDir };
                var spawn = require('child_process').spawn;
                var ls = spawn(gitExecutable, ['checkout', '-b', 'release/' + releaseName, 'develop'], options);
                var log_2 = '';
                var error_2 = '';
                ls.stdout.on('data', function (data) {
                    log_2 += data + '\n';
                });
                ls.stderr.on('data', function (data) {
                    error_2 += data;
                });
                ls.on('exit', function (code) {
                    if (code > 0) {
                        reject(error_2);
                        return;
                    }
                    var message = log_2;
                    if (code === 0 && error_2.length > 0)
                        message += '\n\n' + error_2;
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
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls1 = spawn(gitExecutable, ['rev-parse', '--abbrev-ref', 'HEAD'], options);
            var branchData = '';
            var inRelease = false;
            var currentBranch = '';
            var log = '';
            var error = '';
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
                inRelease = currentBranch.startsWith('release/');
                if (!inRelease) {
                    reject('Not currently on a Release branch');
                    return;
                }
                var ls2 = spawn(gitExecutable, ['checkout', 'master'], options);
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
                    var ls3 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                    ls3.stdout.on('data', function (data) {
                        log += data + '\n';
                    });
                    ls3.stderr.on('data', function (data) {
                        error += data;
                    });
                    ls3.on('exit', function (code) {
                        var ls4 = spawn(gitExecutable, ['checkout', 'develop'], options);
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
                            var ls5 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                            ls5.stdout.on('data', function (data) {
                                log += data + '\n';
                            });
                            ls5.stderr.on('data', function (data) {
                                error += data;
                            });
                            ls5.on('exit', function (code) {
                                var ls6 = spawn(gitExecutable, ['branch', '-d', currentBranch], options);
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
                var options = { cwd: rootDir };
                var spawn = require('child_process').spawn;
                var ls = spawn(gitExecutable, ['checkout', '-b', 'hotfix/' + hotfixName, 'master'], options);
                var log_3 = '';
                var error_3 = '';
                ls.stdout.on('data', function (data) {
                    log_3 += data + '\n';
                });
                ls.stderr.on('data', function (data) {
                    error_3 += data;
                });
                ls.on('exit', function (code) {
                    if (code > 0) {
                        reject(error_3);
                        return;
                    }
                    var message = log_3;
                    if (code === 0 && error_3.length > 0)
                        message += '\n\n' + error_3;
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
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls1 = spawn(gitExecutable, ['rev-parse', '--abbrev-ref', 'HEAD'], options);
            var branchData = '';
            var inHotfix = false;
            var currentBranch = '';
            var log = '';
            var error = '';
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
                inHotfix = currentBranch.startsWith('hotfix/');
                if (!inHotfix) {
                    reject('Not currently on a Hotfix branch');
                    return;
                }
                var ls2 = spawn(gitExecutable, ['checkout', 'master'], options);
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
                    var ls3 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                    ls3.stdout.on('data', function (data) {
                        log += data + '\n';
                    });
                    ls3.stderr.on('data', function (data) {
                        error += data;
                    });
                    ls3.on('exit', function (code) {
                        var ls4 = spawn(gitExecutable, ['checkout', 'develop'], options);
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
                            var ls5 = spawn(gitExecutable, ['merge', '--no-ff', currentBranch], options);
                            ls5.stdout.on('data', function (data) {
                                log += data + '\n';
                            });
                            ls5.stderr.on('data', function (data) {
                                error += data;
                            });
                            ls5.on('exit', function (code) {
                                var ls6 = spawn(gitExecutable, ['branch', '-d', currentBranch], options);
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