var fs = require('fs'),
    path = require('path'),
    nodefile    = require("node-file"),
    appDir = path.resolve(__dirname, '..'),
    taskList = path.join(appDir, 'config/task.json'),
    log = require('./util/logger').log,
    EventEmitter = require('events').EventEmitter,
    projectList = path.join(appDir, 'config/project.json'),
    beautify    = require('js-beautify').js_beautify,
    PRJROOT = null, //项目根路径
    CONFIG = {};   //配置信息

EVENT = new EventEmitter();

//project 模块配置信息
var META = {
    dir : '.livestart'
};

// 读取配置文件
function readConfig(path){
    return JSON.parse(fs.readFileSync(path));
}

// 读取任务列表
function taskListRead(){
    return readConfig(taskList);
}

// 读取项目配置
function projectListRead(){
    return readConfig(projectList);
}

// 创建配置文件
function set(key, config){
    if(!PRJROOT){
        init();
    }
    var metaDir = path.join(PRJROOT, META.dir);
    var metaFileName = path.join(metaDir, key+'.json');
    CONFIG[key] = config;
    if(!fs.existsSync(metaDir)){
        nodefile.mkdirsSync(metaDir);
    }
    var configStr = JSON.stringify(config);
    configStr = beautify(configStr);

    if(!fs.existsSync(metaFileName)){
        log('create', 'info', "创建配置文件:%s"+metaFileName);
        fs.writeFileSync(metaFileName, configStr);
        return;
    }

    fs.writeFileSync(metaFileName, configStr);
    return;
}

// 获取配置信息

function get(key){
    if(!PRJROOT){
        init();
    }
	
	var metaDir = path.join(PRJROOT, META.dir);
    if(!fs.existsSync(metaDir)){
        return;
    }
	
    CONFIG[key] = readConfig(path.join(metaDir, key+'.json'));
	
    return CONFIG[key];
}

// 寻找项目根目录并初始化变量
function init() {
	
    //只初始化一次
    if (PRJROOT) {
        return;
    }

    //命令行传入的目录参数在不同调用方式下下标不同，处理相对路径为绝对路径
    var argvs = process.argv;
    var dir = process.cwd();

    //从获取命令行--root参数
    for (var i = 0; i < argvs.length; i++) {
        if (argvs[i] === '--root' || argvs[i] === '-r') {
            if (i + 1 < argvs.length) {
                dir = argvs[i + 1];
            }
        }
    }
    dir = path.resolve(dir);
    var metaDir = path.join(dir, META.dir);

    //兼容windows和Linux路径
    while (!fs.existsSync(metaDir) && metaDir !== '/' + META.dir && !metaDir.match(/\w{1,1}:\\.livestart/)) {
        metaDir = path.join(metaDir, '../..', META.dir);
    }
    PRJROOT = path.join(metaDir, '..');
    if (PRJROOT === '/' || PRJROOT.match(/\w{1,1}:\\$/)) {
        PRJROOT = dir;
    }
	
	// 监视配置文件是否变化，变化则重新加载
	fs.watchFile(path.join(metaDir,"project.json"), function() {
		EVENT.emit('projectChange');
	});
	
}

// 返回根目录
function root(){
    if(!PRJROOT){
        init();
    }
    return PRJROOT;
}

function on(evtName, fn){
    return EVENT.on(evtName, fn);
}

exports.init = init;
exports.root = root;
exports.set = set;
exports.get = get;
exports.on = on;
exports.readJson = readConfig;
exports.taskListRead = taskListRead;
exports.projectListRead = projectListRead;