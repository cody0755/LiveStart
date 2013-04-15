var fs = require('fs');
var path = require("path");
var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

var walkSync = function(dir){
    var results = [];
    var list = fs.readdirSync(dir);

    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                results = results.concat(walkSync(file));
            } else {
                results.push(file);
            }
    });
    return results;
}


function rmrf(dir, callback) {
    fs.stat(dir, function(err, stats) {
        if (err) {
            return callback(err);
        }

        if (!stats.isDirectory()) {
            return fs.unlink(dir, callback);
        }

        var count = 0;
        fs.readdir(dir, function(err, files) {
            if (err) {
                return callback(err);
            }

            if (files.length < 1) {
                return fs.rmdir(dir, callback);
            }

            files.forEach(function(file) {
                var sub = path.join(dir, file);

                rmrf(sub, function(err) {
                    if (err) {
                        return callback(err);
                    }

                    if (++count == files.length) {
                        fs.rmdir(dir, callback);
                    }
                });
            });
        });
    });
}

function rmrfSync(dir) {
    var stats = fs.statSync(dir);
    if (!stats.isDirectory()) {
        return fs.unlinkSync(dir);
    }
    var count = 0;
    var files = fs.readdirSync(dir);
    if (files.length < 1) {
        return fs.rmdirSync(dir);
    }
    
    files.forEach(function(file) {
        var sub = path.join(dir, file);
        
        rmrfSync(sub);
        if (++count == files.length) {
            fs.rmdirSync(dir);
        }
    });
}


exports.walk = walk;
exports.walkSync = walkSync;
exports.rmrf = rmrf;
exports.rmrfSync = rmrfSync;