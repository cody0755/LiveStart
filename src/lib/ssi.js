var fs          = require('fs'),
    path        = require('path'),
	juicer      = require("juicer"),
    existsSync  = fs.existsSync || path.existsSync,
	jsbeautify  = require("js-beautify"),
	htmlparser  = require("htmlparser"),
	config      = require('./config.js'),
    prjInfo     = config.get('project'), // 获取配置文件
    root        = config.root(), // 获取根目录
    pageDir     = path.join(root, prjInfo.pagesDir,"\\"), // 获取pages目录
    modDir     = path.join(root, prjInfo.modsDir,"\\"); // 获取mods目录

var scriptExtern = /<script[^>]*? src=['"](.+?)['"].*\/script>/g;
var styleExtern = /<link[^>]*? href=['"](.+?)['"].*\/>/g;
// 未闭合的link标签判断正则。
var wrongStyleExtern = /<link[^>]*? href=['"](.+?)['"][^\/]*>/g;

config.on('projectChange', function(){
    prjInfo     = config.get('project')
});

// SSI
function ssiCompile(){

}

/*
	<!--#include "dir:filename"--> 引用
	<!--#layout "dir:filename"-->  布局
*/

ssiCompile.prototype.domsearch = function(str){
	var rawHtml = str;
	var handler = new htmlparser.DefaultHandler(function (error, dom) {
		if (error){
		
		}else{
		
		}
		
	});
	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(rawHtml);
	return forDom(handler.dom);
}

function forDom(doms,domObj){

	var domObj = domObj || [];
	for(var i=0;i<doms.length;i++){
		if(/layout|include|block/.test(doms[i].name)){
			domObj[domObj.length++]={
				data: doms[i].data,
				type: doms[i].type,
				name: doms[i].name,
				attr: doms[i].attribs
			};
		}
		if(doms[i].children){
			forDom(doms[i].children,domObj);
		}
	}

	return domObj;

}

ssiCompile.prototype.ssi = function(str,fullpath,setScriptUrl){

	var _this = this,
		data={};
		
		
    fullpath = fullpath || pageDir;
    setScriptUrl = setScriptUrl || false;
	
	var tpl_tags = _this.domsearch(str);
	
	for (var i = 0; i < tpl_tags.length; i++) {
		var type = tpl_tags[i].name;
		var pathArr = tpl_tags[i].attr.file.split(':');
		var modpath = path.join(pageDir,pathArr[0],(pathArr[1] || ""));
		modpath = decodeURIComponent(modpath);
		
		var modpathArr = this.ModsExist(modpath);

		var getHtml='';
		if(modpathArr){
			modpathArr.forEach(function(modfile){
			
				var ext = path.extname(modfile);
				// 如果是HTML，则合并HTML
				if(ext === ".html"){
					var modfileContext = fs.readFileSync(modfile).toString(),
						setmodpath = modfile.replace(modDir,"").replace(modfile.split("\\").pop(),"").replace("\\","/"); // 模块相对地址
					getHtml += modfileContext;
					if(_this.domsearch(getHtml)){
						getHtml = _this.ssi(getHtml,fullpath,setScriptUrl);
					}
					if(!setScriptUrl){
						//getHtml = getHtml.replace(/\{__BASEURL__}/gi,'http://127.0.0.1:'+prjInfo.port+'/'+"mods/"+setmodpath); 
						getHtml = getHtml.replace(/\{__BASEURL__}/gi,'http://127.0.0.1:'+prjInfo.port+'/');
					}else{
						var filename = setmodpath.replace(modDir,"");
						var filenameArr = filename.split("/");

						for(var k in filenameArr){
							if(filenameArr[k]!=="images"){
								filenameArr.shift();
							}
						}
						filename = filenameArr.join("/");
						getHtml = getHtml.replace(/\{__BASEURL__}/gi,filename); 
					}
					// 纠正深层目录相对地址错误
					
				}
				
				// 如果是json,则赋值给data
				if(ext === ".json"){
					data = config.readJson(modfile);
				}
				
				// 如果从页面传进变量
				if(tpl_tags[i].attr.data){
					var tpldata = tpl_tags[i].attr.data;
					var oldData = data;
					var newData = JSON.parse('{'+tpldata+'}');
					for(var k in newData){
						oldData[k] = newData[k];
					}
					data = oldData;
				}
				

				// 如果允许添加CSS,Js样式
				if(!setScriptUrl){
					if(ext === ".css" || ext === ".scss" || ext === ".less"){
						var cssfilename = 'http://127.0.0.1:'+prjInfo.port+'/'+modfile.replace(pageDir,"").replace(modDir,"mods/").replace(".scss",".css").replace(".less",".css");
						cssfilename = cssfilename.replace("\\","/");
						getHtml += '<link href="'+cssfilename+'" media="all" rel="stylesheet" type="text/css" />';
					}
					if(ext === ".js" || ext === ".coffee"){
						var jsfilename = 'http://127.0.0.1:'+prjInfo.port+'/'+modfile.replace(pageDir,"").replace(modDir,"mods/").replace(".coffee",".js");
						jsfilename = jsfilename.replace("\\","/");
						getHtml += '<script src="'+jsfilename+'" type="text/javascript"></script>';
					}
				}
			});
			
			getHtml = juicer(getHtml,data);

		}
		
		// 引入
		if(type === "include"){
			str = str.replace('<'+tpl_tags[i].data+'>',getHtml); // 把模块内容合并
		}
		
		// 布局
		if(type === "layout"){
			str = str.replace('<'+tpl_tags[i].data+'>',""); // 把布局内容合并
			str = getHtml.replace("{__CONTENT__}",str);
		}
		
		// 区块
		if(type === "block"){
			var regBlock = new RegExp('(\<'+tpl_tags[i].data+'\>(?:.|\n|\r)*?\<\/block\>)',"i");
			var regBlockInner = new RegExp('(?:\<'+tpl_tags[i].data+'\>)((?:.|\n|\r)*?)(?:\<\/block\>)',"i");
			var Block = str.match(regBlock)[1];
			var BlockInner = str.match(regBlockInner)[1];
			
			getHtml = getHtml.replace("{__CONTENT__}",BlockInner);
			str = str.replace(Block,getHtml);
		}
		
	}

	str = jsbeautify.html(str);
    return str;
	
}


ssiCompile.prototype.ModsExist = function (modpath) {
    var _file = modpath,
        files = [];

    if(!existsSync(_file)){

        var ext = path.extname(_file),
			exts = [".html",".css",".sass",".scss",".less",".js",".coffee",".json"],
			_tempfilename = path.basename(_file, ext),
			_tempfile = _file.replace(pageDir,""),
			search_pageDirfile,
			search_pageDirfile_in,
			search_modDirfile,
			search_modDirfile_in,
			i;
		
		// 在pages,mods目录进行查找
		// 如果用文件夹，可以隐藏里面的文件名
		var _tempfileArr = _tempfile.split("\\");
		for(i in exts){
			if(typeof exts[i] === "string"){
				
				//console.log(_tempfile,_tempfilename);
				
				if(/css|scss|less|js|coffee|json/.test(exts[i])){
					_tempfileArr.pop();
					_tempfileArr.push(exts[i].slice(1,exts[i].length));
					_tempfile=_tempfileArr.join("/");
				}
				
				
				search_pageDirfile = path.join(pageDir,_tempfile+(ext?"":exts[i]));
				search_pageDirfile_in = path.join(pageDir,_tempfile,_tempfilename+(ext?"":exts[i]));
				search_modDirfile = path.join(modDir,_tempfile+(ext?"":exts[i]));
				search_modDirfile_in = path.join(modDir,_tempfile,_tempfilename+(ext?"":exts[i]));
				
				if(/css|scss|less/.test(exts[i])){
					var styleinpage = path.join(pageDir,_tempfile,"style"+(ext?"":exts[i]));
					var styleinmod = path.join(modDir,_tempfile,"style"+(ext?"":exts[i]));
					if(existsSync(styleinpage)){
						search_pageDirfile_in = styleinpage;
					}
					if(existsSync(styleinmod)){
						search_modDirfile_in = styleinmod;
					}
				}
				
				if(/js|coffee/.test(exts[i])){
					var styleinpage = path.join(pageDir,_tempfile,"mod"+(ext?"":exts[i]));
					var styleinmod = path.join(modDir,_tempfile,"mod"+(ext?"":exts[i]));
					if(existsSync(styleinpage)){
						search_pageDirfile_in = styleinpage;
					}
					if(existsSync(styleinmod)){
						search_modDirfile_in = styleinmod;
					}
				}
				
				if(existsSync(search_pageDirfile)) {
					files.push(search_pageDirfile);
				}
				if(existsSync(search_modDirfile)){
					files.push(search_modDirfile);
				}
				if(existsSync(search_pageDirfile_in)) {
					files.push(search_pageDirfile_in);
				}
				if(existsSync(search_modDirfile_in)){
					files.push(search_modDirfile_in);
				}
			}
		};

        return files;

    }else{
        return [ _file ];
    }
};

ssiCompile.prototype.getSytleScript = function (pageContent,debug) {
    var headTail = pageContent.indexOf('</head>');
    var bodyContent = pageContent.slice(headTail);
    var scripts = [];
    var styles = [];
    bodyContent = bodyContent.replace(scriptExtern, function ($1, $2, $3) {
        scripts.push($1);
        return '';
    });
    bodyContent = bodyContent.replace(styleExtern, function ($1, $2, $3) {
        styles.push($1);
        return '';
    });
    bodyContent.replace(wrongStyleExtern, function($1,$2){
        console.log('警告:检测到未闭合的样式标签"%s"。',$2);
        return '';
    });
	
	// 调试模式加载自动刷新功能
	if(debug||false){
		if(prjInfo.reload === "true") {
			scripts.push('<script src="/socket.io/socket.io.js"></script>');
			scripts.push('<script src="/livestart/tools/reload.js"></script>');
		}
		if(prjInfo.iefirebug === "true") {
			scripts.push('<!--[if lt IE 9]><script src="/livestart/tools/firebug-lite/build/firebug-lite.js"></script><![endif]-->');
		}
	}

    scripts = scripts.distinct();
    styles = styles.distinct();

    var headArea = pageContent.slice(0, headTail);
    var bodyTail = bodyContent.indexOf('</body>');
    var bodyArea = bodyContent.slice(0, bodyTail);
    var bodyTailArea = bodyContent.slice(bodyTail);
    var scriptArea = '';
    scripts.forEach(function (s) {
        scriptArea += '\n' + s;
    });

    var styleArea = '';
    styles.forEach(function (s) {
        styleArea += '\n' + s;
    });

    pageContent = headArea + styleArea + scriptArea + bodyArea + bodyTailArea;
    return pageContent;
};

exports = module.exports = ssiCompile;