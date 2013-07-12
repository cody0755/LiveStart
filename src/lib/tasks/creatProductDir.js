#!/usr/bin/env node

var EventEmitter   = require('events').EventEmitter,
    EVENT          = new EventEmitter(),
    fs             = require("fs"),
    path           = require("path"),
    nodefile       = require("node-file"),
    log            = require('../util/logger').log;
    config         = require('../config.js'),
    projectConfig  = require('../../config/project.json'), // 载入默认项目配置
    projectList    = config.projectListRead();
    
// 用户项目目录
var prjDir = '.';
var configDir = ".livestart";
    
function run(callback,data){

    var prjDir = config.root(),         // 根目录
        state = prjState(prjDir),   // 项目配置状态
        prj = {};
    
    if(state === 'blank'){

        log('tips', 'info', "检测到此目录没有.livestart目录，系统将自动创建前端通用项目目录！");

        var pagesFullDir = path.join(prjDir,  projectList.pagesDir);
        nodefile.mkdirsSync(pagesFullDir);
        log('create', 'info', "创建页面目录:"+pagesFullDir);
        
        var modsFullDir = path.join(prjDir,  projectList.modsDir);
        nodefile.mkdirsSync(modsFullDir);
        log('create', 'info', "创建模块目录:"+modsFullDir);
        
        var docsFullDir = path.join(prjDir, projectList.docsDir);
        nodefile.mkdirsSync(docsFullDir);
        log('create', 'info', "创建文档目录:"+docsFullDir);
        
        var toolsFullDir = path.join(prjDir, projectList.toolsDir);
        nodefile.mkdirsSync(toolsFullDir);
        log('create', 'info', "创建工具目录:"+toolsFullDir);

        var buildFullDir = path.join(prjDir, projectList.buildDir);
        nodefile.mkdirsSync(buildFullDir);
        log('create', 'info', "创建构建目录:"+buildFullDir);

        var testsFullDir = path.join(prjDir, projectList.testsDir);
        nodefile.mkdirsSync(testsFullDir);
        log('create', 'info', "创建测试目录:"+testsFullDir);
        
        prj = projectConfig;
        var dirs = prjDir.split(path.sep);
        prj.name = dirs[dirs.length - 1];
        prj.description = prj.name;
    }else{
        log('tips', 'warn', "系统检测到存在前端项目！");
    }
    
    prj.state= 'normal';
    prj.prjDir = prjDir;

    var oldPrj = config.get('project') || prj;
    for(var k in prj){
        oldPrj[k] = prj[k];
    }

    config.set("project",oldPrj);
    
    callback();
    EVENT.emit('taskEnd');
}

// 返回项目状态
function prjState(root) {
    var state = 'normal';
    if (!fs.existsSync(path.join(root, configDir))) {
        state = 'blank';
        // 去掉空目录检查
        /*state = 'past';
        var list = fs.readdirSync(root);
        if (list.length === 0) {
            state = 'blank';
        }*/
    }
    return state;
}

function on(evtName, fn){
    return EVENT.on(evtName, fn);
}

exports.on = on;
exports.run = run;
