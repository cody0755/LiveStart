var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var _ = require("underscore");
var config = require('./config.js');
var debug = console.log;

//默认项目配置信息
var initConf = {
	cnname:'',                       // 中文名字，用于文件头描述
    enname:'',                       // 英文
    description: '',                 // 描述，用于文件头描述
    lib: [],                         // 引用的类库
    build:[],                        // 先保留，打包时可作任务
    charset: ["utf8"],               // 项目编码
    pagesDir:'src/pages',            // 页面目录
    modsDir: 'src/mods',             // 模块目录
    widgetsDir: 'src/widgets',       // 组件目录
    buildDir: 'build',               // 构建目录 
	docsDir: 'docs',                 // 文档目录
	toolsDir: 'tools',               // 工具目录
    testsDir: 'tests',               // 测试目录
	resourceDir: 'resource',         // 模板目录
    cdnPath: '',                     // 上线地址
    port: 8000,                      // 调试端口
    hosts:''                         // host映射
};

//用户项目目录
var prjDir = '.';
var configDir = ".livestart";

/**
 * 返回或者设置项目信息
 * 如果传入参数为空，则返回项目信息。
 * 如果传入参数部位空，则设置项目信息。
 * 设置的项目信息最后保存到.livestart/project.json中
 * @param dir 某个项目的子孙目录，此参数被用来寻找项目的根目录
 * @param prj 需要设置的项目元数据
 */
exports = module.exports = function(prj){
	prjDir = config.root();         // 根目录
	var state = prjState(prjDir);   // 项目配置状态
	
	var actions = [];
    if(state === 'blank'){
        var pagesFullDir = path.join(prjDir,  initConf.pagesDir);
        mkdirp.sync(pagesFullDir);
        actions.push({action:'创建页面目录', content:pagesFullDir});

        var modsFullDir = path.join(prjDir,  initConf.modsDir);
        mkdirp.sync(modsFullDir);
        actions.push({action:'创建模块目录', content:modsFullDir});

        var widgetsFullDir = path.join(prjDir, initConf.widgetsDir)
        mkdirp.sync(widgetsFullDir);
        actions.push({action:'创建组件目录', content:widgetsFullDir});
		
		var docsFullDir = path.join(prjDir, initConf.docsDir);
        mkdirp.sync(docsFullDir);
        actions.push({action:'创建文档目录', content:docsFullDir});
		
		var toolsFullDir = path.join(prjDir, initConf.toolsDir);
        mkdirp.sync(toolsFullDir);
        actions.push({action:'创建工具目录', content:toolsFullDir});

        var buildFullDir = path.join(prjDir, initConf.buildDir);
        mkdirp.sync(buildFullDir);
        actions.push({action:'创建构建目录', content:buildFullDir});

        var testsFullDir = path.join(prjDir, initConf.testsDir);
        mkdirp.sync(testsFullDir);
        actions.push({action:'创建测试目录', content:testsFullDir});

        prj = initConf;
        var dirs = prjDir.split(path.sep);
        prj.name = dirs[dirs.length - 1];
        prj.description = prj.cssns = prj.jsns = prj.name;
    }

    prj.state= 'normal';
    prj.prjDir = prjDir;

    var oldPrj = config.get('project') || prj;
    for(var k in prj){
        oldPrj[k] = prj[k];
    }

    config.set('project', oldPrj);
    actions.push({action:'更新项目元文件', content:'.livestart/project.json'});
    return {succeed:true,
        msg:'更新项目信息',
        data: actions
    };

}


/**
 * 返回项目状态
 * @param root 项目根目录
 * @return {String} normal => 包含项目配置目录
 *					past => 不包含项目配置且项目目录不为空
 *					blank => 不包含项目配置且项目目录为空
 */
function prjState(root) {
    var state = 'normal';
    if (!fs.existsSync(path.join(root, configDir))) {
        state = 'past';
        var list = fs.readdirSync(root);
        list = _.filter(list,function(file){
            
            return !(/^\..+/.test(file));
        });
        if (list.length === 0) {
            state = 'blank';
        }
    }
    return state;
}


