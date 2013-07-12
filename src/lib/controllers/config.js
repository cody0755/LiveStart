var post = exports.post = {};
var get = exports.get = {};

var querystring = require('querystring'),
    config  = require('../config.js'),
	path        = require('path'),
    prjInfo     = config.get('project'), // 获取配置文件
    root        = config.root(), // 获取根目录
    pageDir     = path.join(root, prjInfo.pagesDir,"\\"), // 获取pages目录
    modDir     = path.join(root, prjInfo.modsDir,"\\"); // 获取mods目录

config.on('projectChange', function(){
    prjInfo     = config.get('project')
});

post.edit = function () {
    var prj;
    prj = this.request.post();

    var oldPrj = config.get('project') || prj;
    for(var k in prj){
        oldPrj[k] = prj[k];
    }

    config.set("project",oldPrj);

    EVENT.emit('projectChange');

    //this.response.end();
    //this.renderJSON(data);
    this.response.setHeader("Content-Type", "text/plain");
    this.response.writeHead(200);
    this.response.end();

};

// 返回原来的配置文件
get.get = function(){
    var req = this.request,
        res = this.response;
    this.renderJSON(prjInfo);
};
