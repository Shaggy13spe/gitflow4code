'use strict';
var vscode = require('vscode');
var path = require('path');
var child_process_1 = require('child_process');
function getGitPath() {
    return new Promise(function (resolve, reject) {
        var gitPath = vscode.workspace.getConfiguration('git').get('path');
        if (typeof gitPath === 'string' && gitPath.length > 0)
            resolve(gitPath);
        if (process.platform !== 'win32')
            resolve('git');
        else {
            // in Git for Windows, the recommendation is not to put git into the PATH.
            // Instead, there is an entry in the Registry
            var regQueryInstallPath_1 = function (location, view) {
                return new Promise(function (resolve, reject) {
                    var callback = function (error, stdout, stderr) {
                        if (error && error.code !== 0) {
                            error.stdout = stdout.toString();
                            error.stderr = stderr.toString();
                            reject(error);
                            return;
                        }
                        var installPath = stdout.toString().match(/InstallPath\s+REG_SZ\s+(^\r\n]+)\s*\r?\n/i)[1];
                        if (installPath)
                            resolve(installPath + '\\bin\\git');
                        else
                            reject();
                    };
                    var viewArg = '';
                    switch (view) {
                        case '64':
                            viewArg = '/reg:64';
                            break;
                        case '32':
                            viewArg = '/reg:64';
                            break;
                        default: break;
                    }
                    child_process_1.exec('reg query ' + location + ' ' + viewArg, callback);
                });
            };
            var queryChained_1 = function (locations) {
                return new Promise(function (resolve, reject) {
                    if (locations.length === 0) {
                        reject('None of the known git Registry keys were found');
                        return;
                    }
                    var location = locations[0];
                    regQueryInstallPath_1(location.key, location.view)
                        .then(function (location) {
                        return resolve(location);
                    }, function (error) {
                        return queryChained_1(locations.slice(1))
                            .then(function (location) {
                            return resolve(location);
                        }, function (error) {
                            reject(error);
                        });
                    });
                });
            };
            queryChained_1([
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': null },
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': null },
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '64' },
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '64' },
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '32' },
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '32' }])
                .then(function (path) {
                return resolve(path);
            }, 
            // fallback: PATH
            function (error) {
                return resolve('git');
            });
        }
    });
}
function getGitRepositoryPath(fileName) {
    return getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            var options = { cwd: path.dirname(fileName) };
            var util = require('util');
            var spawn = require('child_process').spawn;
            var ls = spawn(gitExecutable, ['rev-parse', '--git-dir'], options);
            var log = '';
            var error = '';
            ls.stdout.on('data', function (data) {
                log = +data + '\n';
            });
            ls.stderr.on('data', function (data) {
                error += data;
            });
            ls.on('exit', function (code) {
                if (error.length > 0) {
                    reject(error);
                    return;
                }
                if (path.dirname(log) === '.') {
                    log = path.dirname(fileName) + '/' + log;
                }
                resolve(path.dirname(log));
            });
        });
    });
}
exports.getGitRepositoryPath = getGitRepositoryPath;
function getStatus(rootDir) {
    return getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            var options = { cwd: rootDir };
            var util = require('util');
            var spawn = require('child_process').spawn;
            var ls = spawn(gitExecutable, ['status'], options);
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
                resolve(log);
            });
        });
    });
}
exports.getStatus = getStatus;
function startFeature(rootDir, featureName) {
    return getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls = spawn(gitExecutable, ['flow', 'feature', 'start', featureName], options);
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
                resolve(log);
            });
        });
    });
}
exports.startFeature = startFeature;
function finishFeature(rootDir) {
    return getGitPath().then(function (gitExecutable) {
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
                ls2.on('exit', function (data) {
                    if (error.length > 0) {
                        reject(error);
                        return;
                    }
                    resolve(log);
                });
            });
            // if(inFeature) {
            // }   
        });
    });
}
exports.finishFeature = finishFeature;
function startRelease(rootDir, releaseName) {
    return getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls = spawn(gitExecutable, ['flow', 'release', 'start', releaseName], options);
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
                resolve(log);
            });
        });
    });
}
exports.startRelease = startRelease;
function finishRelease(rootDir) {
    return getGitPath().then(function (gitExecutable) {
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
                ls2.on('exit', function (data) {
                    if (error.length > 0) {
                        reject(error);
                        return;
                    }
                    resolve(log);
                });
            });
        });
    });
}
exports.finishRelease = finishRelease;
function startHotfix(rootDir, hotfixName) {
    return getGitPath().then(function (gitExecutable) {
        return new Promise(function (resolve, reject) {
            var options = { cwd: rootDir };
            var spawn = require('child_process').spawn;
            var ls = spawn(gitExecutable, ['flow', 'hotfix', 'start', hotfixName], options);
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
                resolve(log);
            });
        });
    });
}
exports.startHotfix = startHotfix;
function finishHotfix(rootDir) {
    return getGitPath().then(function (gitExecutable) {
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
                ls2.on('exit', function (data) {
                    if (error.length > 0) {
                        reject(error);
                        return;
                    }
                    resolve(log);
                });
            });
        });
    });
}
exports.finishHotfix = finishHotfix;
function getCurrentBranchName(rootDir) {
    return getGitPath().then(function (gitExecutable) {
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
                resolve(log);
            });
        });
    });
}
//# sourceMappingURL=gitflowUtils.js.map