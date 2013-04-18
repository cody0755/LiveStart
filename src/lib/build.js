var compile = require('./compile.js');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var debug = console.log;
var isUtf8 = require('is-utf8');
var iconv = require('iconv-lite');
var config = require('./config.js');
var tidy = require('./util/tidy.js');
var walk = require('./util/walk.js')
var _ = require('underscore');


/**
 * 打包输出
 *
 * @param ver 版本号
 * @param modename 打包模式
 */
exports.build = function (ver,modename) {
	var ver = (typeof ver != "undefined")?"-v"+ver:"-temp",
        modename = "project" || modename,
        prjInfo = config.get('project'),
        root = config.root(),
        pagelist = returnPagesList(prjInfo,root).data, // 返回pages目录文件列表
        begin = new Date();

    buildMergePage(pagelist,prjInfo,ver); // 开始编译

    var end = new Date();
    console.log('Build 完成。耗时%s秒。',(end.getTime() - begin.getTime())/1000);
}

// 合并页面模块
function buildMergePage(pagelist,prjInfo,ver){
    
    var date = new Date(),
        dateStr = "DEMO-"+date.getFullYear()+""+((date.getMonth()+1)>9?(date.getMonth()+1):"0"+(date.getMonth()+1))+""+(date.getDate()>9?date.getDate():"0"+date.getDate())+ver,
        pagesBuildDir = path.join(config.root(), prjInfo.buildDir, dateStr);

    // 构建页面
    buildPageResources(prjInfo,pagelist,pagesBuildDir)
    // 构建样式
    buildStyleResources(prjInfo,pagelist,pagesBuildDir);
    // 构建脚本
    buildScriptResources(prjInfo,pagelist,pagesBuildDir);
    // 构建图片等资源
	buildOtherResources(prjInfo,pagelist,pagesBuildDir);
	
}

// 构建页面,只处理html与shtml
function buildPageResources(prjInfo,pagelist,pagesBuildDir){
    // 构建页面
    pagelist.forEach(function (page) {
        var pageContent = '',
            pagepath = path.join(prjInfo.pagesDir, page.file);

        // 只处理html与shtml
        if( !(/shtml|html/.test(page.fileExt)) ){
            return;
        }

        pageContent = compile.output(pagepath);

        // 生成每个页面
        var outPutFile = page.file;
        outPutFile = path.join(pagesBuildDir, outPutFile);
        // 兼容shtml
        outPutFile = outPutFile.replace(/shtml/i,"html");
        var pagePathDir = path.join(outPutFile, '..');
        if (!fs.existsSync(pagePathDir)) {
            mkdirp.sync(pagePathDir);
        }
        // 转换编码
        if(prjInfo.charset[0].match(/gbk/i)&&page.file.indexOf("data")<0){
            pageContent = iconv.encode(pageContent, 'gbk');
        }else{
            pageContent = iconv.encode(pageContent, 'utf-8');
        }
        fs.writeFileSync(outPutFile, pageContent);
        console.log('Build页面:%s', outPutFile);
    });
}

// 构建样式,只处理css
function buildStyleResources(prjInfo,pagelist,pagesBuildDir){

    var CSSCombo = require('css-combo');

    pagelist.forEach(function (page) {

        var pagepath = path.join(prjInfo.pagesDir, page.file);
        var copyToPath = path.join(pagesBuildDir, page.file);
        // 只处理css
        if((/css/.test(page.fileExt))){
            var toDirname = path.dirname(copyToPath);

            if(!fs.existsSync(toDirname)){
                mkdirp.sync(toDirname);
            }

            var cfg = {
                target: pagepath,
                debug: true,
                inputEncoding: '',
                outputEncoding: 'utf-8',
                output:copyToPath,
                compress: 0,
                debug:false
            };
            CSSCombo.build(cfg, function(err){
                console.log("css模块合并完成！")
            });

        }
    });

}

// 构建脚本,只处理js
function buildScriptResources(prjInfo,pagelist,pagesBuildDir){
	
}

// 构建图片等资源
function buildOtherResources(prjInfo,pagelist,pagesBuildDir){

    pagelist.forEach(function (page) {

        var pagepath = path.join(prjInfo.pagesDir, page.file);
        var copyToPath = path.join(pagesBuildDir, page.file);

        // 排除html,shtml,js,css
        if(!(/html|shtml|css/.test(page.fileExt))){

            var content = fs.readFileSync(pagepath);
            var toDirname = path.dirname(copyToPath);
            if(!fs.existsSync(toDirname)){
                mkdirp.sync(toDirname);
            }
            fs.writeFileSync(copyToPath, content);

        }
    });

}


/**
 * 递归遍历目录，调用回调函数
 * @param dir 目录
 * @param fn  回调函数
 */
function eachFile(dir, fn){
    var files = fs.readdirSync(dir);

    files.forEach(function(file){
        var pathname = path.join(dir, file);

        var stat = fs.lstatSync(pathname);

        if (stat.isDirectory()){
            eachFile(pathname, fn);
            return;
        }

        if((/\.svn/.test(pathname))){
            return;
        }
        fn(pathname);

    });
}


// 返回pages文件列表
function returnPagesList(prjInfo,root){

	prjInfo.buildDir = prjInfo.buildDir || "build";
	var pageDir = path.join(root, prjInfo.pagesDir);
	var pageFiles = walk.walkSync(pageDir);
    var blacklist = ['shtml','html','css']; // 过滤目录列表

    pageFiles = _.filter(pageFiles, function (file) {

        //过滤掉 .svn，.idea 文件
        if(!(/\.svn|\.idea/.test(file))){
            return true;
        }

    });
    pageFiles = pageFiles.sort(function (a, b) {
        return a < b;
    });
	
	// 返回文件名、文件地址与类型
	var info = _.map(pageFiles, function (file) {
        var pageName = file.slice(file.lastIndexOf('/')+1, file.lastIndexOf('.'));
        var pageFilePath = file.slice(pageDir.length+1, file.length);
        var ext = path.extname(file);
        ext = ext.substr(1,ext.length);

        return {
            name: pageName,
            file: pageFilePath,
            fileExt: ext
        };
    });

    // 返回文件信息
    return {
		succeed:true,
        msg:'文件信息',
        data:info
    };
	
}




















