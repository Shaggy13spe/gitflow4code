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
function startFeature(rootDir, featureName) {
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
                var options = { cwd: rootDir };
                var spawn = require('child_process').spawn;
                var ls = spawn(gitExecutable, ['flow', 'feature', 'start', featureName], options);
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
            var ls1 = spawn(gitExecutable, ['flow', 'feature', 'list'], options);
            var branchData = '';
            var features = [];
            var inFeature = false;
            var currentBranch = '';
            ls1.stdout.on('data', function (data) {
                branchData += data;
            });
            ls1.on('exit', function (data) {
                features = branchData.replace(/ /g, '').trim().split('\n');
                features.forEach(function (element) {
                    if (element.indexOf('*') === 0) {
                        inFeature = true;
                        currentBranch = element.substring(1);
                        return;
                    }
                });
                if (!inFeature) {
                    reject('Not currently on a Feature branch');
                    return;
                }
                var ls2 = spawn(gitExecutable, ['flow', 'feature', 'finish', currentBranch], options);
                var log = '';
                var error = '';
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
                    var message = log;
                    if (code === 0 && error.length > 0)
                        message += '\n\n' + error;
                    resolve(message);
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
                var ls = spawn(gitExecutable, ['flow', 'release', 'start', releaseName], options);
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
function finishRelease(rootDir) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls1 = spawn(gitExecutable, ['flow', 'release', 'list'], options);
            var branchData = '';
            var releases = [];
            var inRelease = false;
            var currentBranch = '';
            ls1.stdout.on('data', function (data) {
                branchData += data;
            });
            ls1.on('exit', function (data) {
                releases = branchData.replace(/ /g, '').trim().split('\n');
                releases.forEach(function (element) {
                    if (element.indexOf('*') === 0) {
                        inRelease = true;
                        currentBranch = element.substring(1);
                        return;
                    }
                });
                if (!inRelease) {
                    reject('Not currently on a Release branch');
                    return;
                }
                var ls2 = spawn(gitExecutable, ['flow', 'release', 'finish', currentBranch], options);
                var log = '';
                var error = '';
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
                    var message = log;
                    if (code === 0 && error.length > 0)
                        message += '\n\n' + error;
                    resolve(message);
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
                var ls = spawn(gitExecutable, ['flow', 'hotfix', 'start', hotfixName], options);
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
function finishHotfix(rootDir) {
    return gitUtils.getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls1 = spawn(gitExecutable, ['flow', 'hotfix', 'list'], options);
            var branchData = '';
            var hotfixes = [];
            var inHotfix = false;
            var currentBranch = '';
            ls1.stdout.on('data', function (data) {
                branchData += data;
            });
            ls1.on('exit', function (data) {
                hotfixes = branchData.replace(/ /g, '').trim().split('\n');
                hotfixes.forEach(function (element) {
                    if (element.indexOf('*') === 0) {
                        inHotfix = true;
                        currentBranch = element.substring(1);
                        return;
                    }
                });
                if (!inHotfix) {
                    reject('Not currently on a Hotfix branch');
                    return;
                }
                var ls2 = spawn(gitExecutable, ['flow', 'hotfix', 'finish', currentBranch], options);
                var log = '';
                var error = '';
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
                    var message = log;
                    if (code === 0 && error.length > 0)
                        message += '\n\n' + error;
                    resolve(message);
                });
            });
        });
    });
}
exports.finishHotfix = finishHotfix;
//# sourceMappingURL=gitflowUtils.js.map