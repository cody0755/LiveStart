var debug = require('debug')('clam:jsonHandle');
var config = require('./config.js');
var _ = require('underscore');
var http = require('http');
var joinbuffers = require('joinbuffers');
var path = require('path');

function jsonHandle() {
    return function (req, res, next) {
        var prjInfo = config.get('project');
        var url = req.url;
        if(url.indexOf('?') != -1){
            url = url.slice(0, url.indexOf('?'));
        }
        var isJson = false;
        var jsonHandles = prjInfo.json;
        if(!jsonHandles || jsonHandles.length === 0){
            next();
            return;
        }
        for(var i = 0; i < jsonHandles.length; i++){
            var map = jsonHandles[i];
            var re = new RegExp(map.url);
            if (url.match(re)) {
                isJson = true;
                if(map.enabled === 'local'){
                    //到本地找
                    var localFile = path.join(config.root(), '.clam/json', map.local);
                    var localHandle = require(localFile);
                    if(localHandle(req, res)){
                        return;
                    }
                }

                http.get({host:map.remote, port:80, path:req.url},function (resp) {
                    var buffs = [];
                    if (resp.statusCode !== 200) {
                        res.end('File ' + url + ' not found.');
                        return;
                    }
                    resp.on('data', function (chunk) {
                        buffs.push(chunk);
                    });
                    resp.on('end', function () {
                        var buff = joinbuffers(buffs);

                        //fix 80% situation bom problem.quick and dirty
                        if (buff[0] === 239 && buff[1] === 187 && buff[2] === 191) {
                            buff = buff.slice(3, buff.length);
                        }
                        res.setHeader("Content-Type", "text/html");
                        res.end(buff);
                    });
                }).on('error', function (e) {
                        debug(e);
                });
                break;
            }
        }
        if(!isJson){
            next();
        }
    }
}
exports.json = jsonHandle;