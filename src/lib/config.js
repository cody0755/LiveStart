var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
//var _ = require("underscore");
//var debug = require('debug')('clam:config');
var beautify = require('./util/beautify.js').js_beautify;
var debug = console.log;
var EventEmitter = require('events').EventEmitter

//project 模块配置信息
var META = {
    dir : '.livestart'
};

var PRJROOT = null; //项目根路径
var CONFIG = {};   //配置信息
var EVENT = new EventEmitter();


/**
 * 保存一个配置信息
 * @param key
 * @param config
 */
function set(key, config){
    if(!PRJROOT){
        init();
    }
    var metaDir = path.join(PRJROOT, META.dir);
    debug('目录:%s', metaDir);
    var metaFileName = path.join(metaDir, key+'.json');
    CONFIG[key] = config;
    if(!fs.existsSync(metaDir)){
        mkdirp.sync(metaDir);
    }
    var configStr = JSON.stringify(config);
    configStr = beautify(configStr);

    if(!fs.existsSync(metaFileName)){
        debug("创建配置文件 %s",metaFileName);
        fs.writeFileSync(metaFileName, configStr);
        //createWatch(key+'.json', metaDir);
        return;
    }

    fs.writeFileSync(metaFileName, configStr);
    return;
}

function readFromFile(file) {
    var metaDir = path.join(PRJROOT, META.dir);
    var metaFile = path.join(metaDir, file);
    var key = file.replace('.json', '');
    if(!fs.existsSync(metaFile)){
        CONFIG[key] = null;
        return;
    }
    var metaStr = fs.readFileSync(metaFile);
    debug('从文件%s获取配置信息。', key);
    metaStr = metaStr.toString().replace(/[\n\r]/g, '');
    CONFIG[key] = JSON.parse(metaStr);
}

/**
 * 创建一个文件watch
 * @param file
 * @param metaDir
 */
function createWatch(file, metaDir) {
    debug("监听%s", file);
    var fullPath = path.join(metaDir, file);
    var key = file.replace('.json', '');
    fs.watch(fullPath, function (event) {
        readFromFile(file);
        EVENT.emit(key + 'Change', key);
    });
    EVENT.emit(key + 'Change', key);
}

/**
 * 寻找项目根目录并初始化变量。
 * @param dir 从此参数指定的目录起，开始向上寻找项目目录。一旦发现此目录或者最近祖先目录包含.clam目录，则认定其为项目根目录。
 * @return {*} 项目根目录
 */
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
	
	
    var metaDir = path.join(PRJROOT, META.dir);
    if(!fs.existsSync(metaDir)){
        return;
    }
	
    var files = fs.readdirSync(metaDir);

    files.forEach(function (file, i) {
        if (/.+\.json$/.test(file)) {
            readFromFile(file);
            createWatch(file, metaDir);
        }
    });
	
}


/**
 * 获取配置信息
 * @param key
 * @return {*}
 */
function get(key){
    if(!PRJROOT){
        init();
    }
	
	var metaDir = path.join(PRJROOT, META.dir);
    if(!fs.existsSync(metaDir)){
        return;
    }
	
	var files = fs.readdirSync(metaDir);
	
	files.forEach(function (file, i) {
        if (/.+\.json$/.test(file)) {
            readFromFile(file);
            createWatch(file, metaDir);
        }
    });
	
    return CONFIG[key];
}


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
exports.set = set;
exports.get = get;
exports.on = on;
exports.root = root;