var post = exports.post = {};
var get = exports.get = {};

var fs          = require('fs'),
    path        = require('path'),
    querystring = require('querystring'),
    nodefile    = require("node-file"),
    config      = require('../config.js'),
    log         = require('../util/logger').log,
    appDir      = path.resolve(__dirname, '../..'),
    juicer      = require("juicer"),
    prjInfo     = config.get('project'), // 获取配置文件
    root        = config.root(), // 获取根目录
    pageDir     = path.join(root, prjInfo.pagesDir,"\\"), // 获取pages目录
    modDir      = path.join(root, prjInfo.modsDir,"\\"), // 获取mods目录
    templateDir = path.join(appDir,prjInfo.resourceDir,"\\"),
    TplTools    = require('../util/tpltools.js');

config.on('projectChange', function(){
    prjInfo     = config.get('project')
});

post.index = function () {

    // 更新配置文件
    var prj;
    prj = this.request.post();

    // 默认为app
    prj.enname = (prj.enname ==="")?"app":prj.enname;

    var oldPrj = config.get('project') || prj;
    for(var k in prj){
        oldPrj[k] = prj[k];
    }
    
    log("tips","info","正在初始化项目配置文件...");
    config.set("project",oldPrj);

    EVENT.emit('projectChange');

    tplTools    = new TplTools();

    // 复制项目模板文件
    log("info","info","正在复制项目模板文件...");
    tplTools.copyTplDir(path.join(templateDir,"web/pages"),path.join(pageDir));
    tplTools.copyTplDir(path.join(templateDir,"web/mods"),path.join(modDir));
    log("tips","info","复制完毕");


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
