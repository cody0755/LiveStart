var post = exports.post = {};
var get = exports.get = {};

var fs          = require('fs'),
    path        = require('path'),
    querystring = require('querystring'),
    nodefile    = require("node-file"),
	jsbeautify  = require("js-beautify"),
    sass        = require('node-sass'),
    less        = require('less'),
    coffee      = require('coffee-script'),
    Ssi         = require('../ssi'),
	ssi         = new Ssi(),
	iconv       = require('iconv-lite'),
    joycss      = require("joycss"),
    config      = require('../config.js'),
    appDir      = path.resolve(__dirname, '../..'),
    juicer      = require("juicer"),
    prjInfo     = config.get('project'), // 获取配置文件
    root        = config.root(), // 获取根目录
    pageDir     = path.join(root, prjInfo.pagesDir,"\\"), // 获取pages目录
    modDir      = path.join(root, prjInfo.modsDir,"\\"), // 获取mods目录
    buildDir    = path.join(root, prjInfo.buildDir,"\\"); // 获取mods目录;

// 当改变时当即更新最新的配置文件
config.on('projectChange', function(){
    prjInfo     = config.get('project');
});

post.init = function () {

    try {
		
		var datatime = dates();
		var OutputDir = "v"+prjInfo.version+"-"+datatime;
		
		// 构建目录
		buildDir = path.join(root, prjInfo.buildDir,OutputDir);
        // 构建页面
        buildPageResources();
        // 构建模块样式
        buildModStyleResources();
        // 构建模块脚本
        buildModScriptResources();
		// 复制模块图片
        buildModImageResources();
        // 复制图片、CSS、Js等资源
        buildOtherResources();
		// 版本号增加1
		addVersion(1);
		
		var data =  {
			succeed:true,
			msg:'项目构建成功，输出目录：build/'+OutputDir,
			data:{}
		};
		
        this.renderJSON(data);
		
	
    }catch (e){
		var data =  {
			succeed:false,
			msg:'构建项目出错，请检查！',
			data:{}
		};
		
        this.renderJSON(data);
    }
	
	


    
};

function dates(){
	
	var dateTime = new Date();
		var yy=dateTime.getFullYear();
		var MM=dateTime.getMonth()+1;  //因为1月这个方法返回为0，所以加1
		var dd=dateTime.getDate();
		var hh=dateTime.getHours();
        var mm=dateTime.getMinutes();
		var ss=dateTime.getSeconds();
		
		MM = MM<10?"0"+MM:MM;
		dd = dd<10?"0"+dd:dd;
		hh = hh<10?"0"+hh:hh;
		mm = mm<10?"0"+mm:mm;
		ss = ss<10?"0"+ss:ss;
		
	return yy+MM+dd+hh+mm+ss;
}

function addVersion(num){
	var prj = {};

	var oldPrj = config.get('project') || prj;
	prj.version = parseInt(oldPrj.version)+num+"";
	for(var k in prj){
		oldPrj[k] = prj[k];
	}

	config.set("project",oldPrj);

	EVENT.emit('projectChange');
		
}

// 分析模块依赖
function findmods(){
	var modslist = [],
		mlist = [];
	var pageFiles = returnPagesList(pageDir);
	
    pageFiles.forEach(function(page){
        
		var pageContent = '';
        // 只处理html与shtml
        if( !(/shtml|html/.test(page.ext)) ){
            return;
        }
        
		pageContent = fs.readFileSync(page.file).toString();
		mlist = getmodslist(pageContent);
		modslist = modslist.concat(mlist);

    });
	
	modslist = modslist.distinct();
	
	modslist = modslist.sort(function (a, b) {
        return a < b;
    });

    modslist = modslist.map(function(item,index){
        var pageName = item.slice(item.lastIndexOf('/')+1, item.lastIndexOf('.'));
        var ext = path.extname(item);

        return {
            name : pageName,
            file : item,
             ext : ext
        }
    });

	return modslist;
}

function getmodslist(str){

	var mlist = [];
	
	var tpl_tags = ssi.domsearch(str);
	
	for (var i = 0; i < tpl_tags.length; i++) {
	
		var type = tpl_tags[i].name;
		var pathArr = tpl_tags[i].attr.file.split(':');
		var modpath = path.join(pageDir,pathArr[0],(pathArr[1] || ""));
		modpath = decodeURIComponent(modpath);
		
		var modpathArr = ssi.ModsExist(modpath);
		var getHtml='';
		if(modpathArr){
			modpathArr.forEach(function(modfile){
				var ext = path.extname(modfile);
				// 如果是HTML，则合并HTML
				mlist.push(modfile);
				
				var modfileContext = fs.readFileSync(modfile).toString(); 
				getHtml += modfileContext;
				if(ssi.domsearch(getHtml)){
					//getHtml = ssi.ssi(getHtml,fullpath);
					mlist = mlist.concat(getmodslist(getHtml));
				}
			});
		}
	}
	
	return mlist;
}

// 分析Js模块依赖
function getScriptList(){
    var pageFiles = findmods();
    var pageContent = '',
        jsContent = '';
    // 过滤出Js文件
    pageFiles = pageFiles.filter(function(item,index){
        if (/js|coffee/.test(item.ext)) {
            return true;
        }
    });
    // Js文件去重
    pageFiles = pageFiles.distinct();

    pageFiles.forEach(function(file){
        if(file.ext === ".js"){
            var jsfile =  fs.readFileSync(file.file).toString();
			jsContent = jsContent.replace(jsfile,""); // 简单消除重复模块引用，对比内容必须一样
			jsContent += jsfile;

        }
        if(file.ext === ".coffee"){
            var coffee_content = fs.readFileSync(file.file).toString();
			jsContent = jsContent.replace(coffee.compile(coffee_content),""); // 简单消除重复模块引用，对比内容必须一样
            jsContent +=coffee.compile(coffee_content);
        }
    });

    return jsContent;
}

// 分析Css模块依赖
function getCssList(){
    var pageFiles = findmods();
    var pageContent = '',
        cssContent = '';
    // 过滤出样式文件
    pageFiles = pageFiles.filter(function(item,index){
        if (/css|scss|less/.test(item.ext)) {
            return true;
        }
    });
    // 样式文件去重
    pageFiles = pageFiles.distinct();
    pageFiles.forEach(function(file){


        if(file.ext === ".css"){
			var cssfile = fs.readFileSync(file.file).toString();
			cssContent = cssContent.replace(cssfile,""); // 简单消除重复模块引用，对比内容必须一样
            cssContent += cssfile;
        }

        if(file.ext === ".scss"){
            var scss_content = fs.readFileSync(file.file).toString(),
				scssfile = sass.renderSync({
					data: scss_content
				});
			
			cssContent = cssContent.replace(scssfile,""); // 简单消除重复模块引用，对比内容必须一样
            cssContent += scssfile
        }

        if(file.ext === ".less"){
            var less_content = fs.readFileSync(file.file).toString();
            less.render(less_content, function (e, css) {
				cssContent = cssContent.replace(css,""); // 简单消除重复模块引用，对比内容必须一样
                cssContent +=css;
            });
        }

    });

    return cssContent;
}

// 合并模块CSS
function buildModStyleResources(){

    var cssContent = getCssList();
    var outfile = path.join(buildDir,"css/mod.css");
	if(cssContent==="") {
		return;
	}
	cssContent = jsbeautify.css(cssContent);
	cssContent = iconv.decode(cssContent, prjInfo.charset);
    nodefile.writeFileSync(outfile,cssContent,true);
}

// 合并模块Js
function buildModScriptResources(){

    var jsContent = getScriptList();
    var outfile = path.join(buildDir,"js/mod.js");
	if(jsContent==="") {
		return;
	}
	jsContent = jsbeautify(jsContent);
	jsContent = iconv.decode(jsContent, prjInfo.charset);
    nodefile.writeFileSync(outfile,jsContent,true);
}

// 合并模块图片
function buildModImageResources(){
	var imagesFiles = returnPagesList(modDir);

    // 过滤出图片文件
    imagesFiles = imagesFiles.filter(function(item,index){
        if (/png|gif|jpg/.test(item.ext)) {
            return true;
        }
    });
    // 图片文件去重
    imagesFiles = imagesFiles.distinct();
    imagesFiles.forEach(function(file){
	
		var filename = file.file.replace(modDir,"");
		var filenameArr = filename.split("/");

		for(var i in filenameArr){
			if(filenameArr[i]!=="images"){
				filenameArr.shift();
			}
		}
		filename = filenameArr.join("/");
		var outPutFile = path.join(buildDir,"images", filename);
		nodefile.copyFile(file.file,outPutFile,true,function(){

		});
		
    });
}

// 复制图片、CSS、Js等资源
function buildOtherResources(){
    var pageFiles = returnPagesList(pageDir);
    var pageContent = '',
        cssContent = '';
    // 过滤出图片、CSS、JS资源
    pageFiles = pageFiles.filter(function(item,index){
        if (/css|scss|less|png|jpg|gif|js|coffee|json/.test(item.ext)) {
            return true;
        }
    });
    // 样式文件去重
    pageFiles = pageFiles.distinct();
    pageFiles.forEach(function(file){

        if(file.ext === ".css"||file.ext === ".js"||file.ext === ".png"||file.ext === ".jpg"||file.ext === ".gif"){

            var filename = file.file.replace(pageDir,"");
            var outPutFile = path.join(buildDir, filename);
            nodefile.copyFile(file.file,outPutFile,true,function(){

            });
        }
		
		if(file.ext === ".scss"){
            var scss_content = fs.readFileSync(file.file).toString(),
				scssfile = sass.renderSync({
					data: scss_content
				});

			var filename = file.file.replace(pageDir,"");
            var outPutFile = path.join(buildDir, filename.replace(".scss",".css"));
			//scssfile =  jsbeautify.css(scssfile);
			scssfile = iconv.decode(scssfile, prjInfo.charset);
			nodefile.writeFileSync(outPutFile,scssfile,true);
			
        }
		

    });
}

// 合并模块于HTML文件
function buildPageResources(){

    var pageFiles = returnPagesList(pageDir);
    pageFiles.forEach(function(page){
        var pageContent = '';
        // 只处理html与shtml
        if( !(/shtml|html/.test(page.ext)) ){
            return;
        }
        var ssi = new Ssi();
        pageContent = fs.readFileSync(page.file).toString();
        pageContent = ssi.ssi(pageContent,page.file,true);
		
		// 如果没有css,js，则不输出
		var pageFiles = findmods();
		// 过滤出css,Js文件
		cssFiles = pageFiles.filter(function(item,index){
			if (/css|scss|less/.test(item.ext)) {
				return true;
			}
		});
		jsFiles = pageFiles.filter(function(item,index){
			if (/js|coffee/.test(item.ext)) {
				return true;
			}
		})
		
        var setModCssUrl = cssFiles.length>0?'<link href="css/mod.css" media="all" rel="stylesheet" type="text/css" />':'';
        var setModScriptUrl = jsFiles.length>0?'<script src="js/mod.js" type="text/javascript"></script>':'';
        pageContent = pageContent + setModCssUrl + setModScriptUrl ;
        pageContent = ssi.getSytleScript(pageContent);
		pageContent = jsbeautify.html(pageContent);
        var filename = page.file.replace(pageDir,"");

        var outPutFile = path.join(buildDir, filename);
        // 兼容shtml
        outPutFile = outPutFile.replace(/shtml/i,"html");
		pageContent = iconv.decode(pageContent, prjInfo.charset);
        nodefile.writeFileSync(outPutFile,pageContent,true);

    });

}


// 过滤返回文件夹文件数组
function returnPagesList(dir){
    var pageFiles = walkDirSync(dir),
        newPageFiles = [];

    pageFiles.forEach(function(file){
        //过滤掉 .svn，.idea 文件
        if(!(/\.svn|\.idea/.test(file))){
            newPageFiles.push(file);
        }
    });

    newPageFiles = newPageFiles.sort(function (a, b) {
        return a < b;
    });

    newPageFiles = newPageFiles.map(function(item,index){
        var pageName = item.slice(item.lastIndexOf('/')+1, item.lastIndexOf('.'));
        var ext = path.extname(item);

        return {
            name : pageName,
            file : item,
             ext : ext
        }
    });

    return newPageFiles;
}


function walkDirSync(dir){
    var results = [];
    var list = fs.readdirSync(dir);

    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDirSync(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

//数组去重
Array.prototype.distinct = function(){
    var arr = [],
        obj = {},
        i   = 0,
        len = this.length,
        result;
    for(;i < len;i++){
        result = this[i];
        if(obj[result] !== result){
            arr.push(result);
            obj[result] = result;
        }
    }
    return arr;
};