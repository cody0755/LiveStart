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
 * @param mode project, 本地基于工程合并代码，把本项目中所有被引用的模块的js打包在一起
 */
exports.build = function (mode) {
	var mode = mode || "project";
	var prjInfo = config.get('project');
	var root = config.root();
	var pagelist = returnPagesList(prjInfo,root).data; // 返回pages目录html列表
	var begin = new Date();
    buildMergePage(pagelist,prjInfo);
    var end = new Date();
    console.log('Build 完成。耗时%s秒。',(end.getTime() - begin.getTime())/1000);
	
}

// 合并页面模块
function buildMergePage(pagelist,prjInfo){
    
    var date = new Date(),
        dateStr = "DEMO-"+date.getFullYear()+""+((date.getMonth()+1)>9?(date.getMonth()+1):"0"+(date.getMonth()+1))+""+(date.getDate()>9?date.getDate():"0"+date.getDate()),
        pagesBuildDir = path.join(config.root(), prjInfo.buildDir, dateStr);
        
    // 构建页面
    pagelist.forEach(function (page) {
		var pageContent = '',
			pagepath = path.join(prjInfo.pagesDir, page.file);
            
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
    // 构建样式
    buildStyleResources(prjInfo,pagesBuildDir);
    // 构建脚本
    buildScriptResources(prjInfo,pagesBuildDir);
    // 构建图片等资源
	buildOtherResources(prjInfo,pagesBuildDir);
	
}

// 构建样式
function buildStyleResources(prjInfo,pagesBuildDir){
    var pagesSrcDir = path.join(config.root(), prjInfo.pagesDir);
    var CSSCombo = require('css-combo');
	
	eachFile(pagesSrcDir, function (file) {
        var copyToPath = file.replace(pagesSrcDir, pagesBuildDir);
        var content = fs.readFileSync(file);
        var ext = path.extname(copyToPath);
        
        // 只处理css
        if((/css/.test(ext))){
            var toDirname = path.dirname(copyToPath);
            if(!fs.existsSync(toDirname)){
                mkdirp.sync(toDirname);
            }
            
			var cfg = {
				target: file,
				debug: true,
				inputEncoding: '',
				outputEncoding: 'utf-8',
				output:copyToPath,
				compress: 0
			};
			CSSCombo.build(cfg, function(err){ 
				console.log("css模块合并完成！")
			});
	
        }
    
    });
}

// 构建脚本
function buildScriptResources(prjInfo,pagesBuildDir){
	
}

// 构建图片等资源
function buildOtherResources(prjInfo,pagesBuildDir){

    var pagesSrcDir = path.join(config.root(), prjInfo.pagesDir);
    
    eachFile(pagesSrcDir, function (file) {
        var copyToPath = file.replace(pagesSrcDir, pagesBuildDir);
        var content = fs.readFileSync(file);
        var ext = path.extname(copyToPath);
        
        // 排除html,shtml,js,css
        if(!(/html|shtml|css/.test(ext))){
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
        fn(pathname);
    });
}


// 返回pages文件列表
function returnPagesList(prjInfo,root){

	prjInfo.buildDir = prjInfo.buildDir || "build";
	var pageDir = path.join(root, prjInfo.pagesDir);
	var pageFiles = walk.walkSync(pageDir);
	
	//过滤掉非html文件
    pageFiles = _.filter(pageFiles, function (file) {
		if((file.lastIndexOf('.html') !== -1) || (file.lastIndexOf('.shtml') !== -1)){
			return true;
		}
    });
    pageFiles = pageFiles.sort(function (a, b) {
        return a < b;
    });
	
	// 返回文件名与类型
	var info = _.map(pageFiles, function (file) {
        var pageName = file.slice(pageDir.length+1, file.lastIndexOf('.'));
        var pageFileName = file.slice(pageDir.length+1, file.length);

        return {
            name: pageName,
            file: pageFileName,
            fileExt: 'html'
        };
    });
    return {
		succeed:true,
        msg:'获取页面信息',
        data:info
    };
	
}




















