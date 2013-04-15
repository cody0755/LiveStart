var fs = require('fs');
var path = require("path");

exports.getHtml = function(res, fullpath) {
    var str = fs.readFileSync(fullpath).toString();
    var regInclude = /<!--#include ".+"-->/gi, regPath = /<!--#include "(.+)"-->/i;
    var matchArr = str.match(regInclude);

    if (matchArr) {
        for (var i = 0; i < matchArr.length; i++) {
            var realpath = path.join(path.dirname(fullpath),matchArr[i].match(regPath)[1]);
            var getHtml = fs.readFileSync(realpath).toString();
            str = str.replace(matchArr[i],getHtml);
        }
    }
    return str;

}; 