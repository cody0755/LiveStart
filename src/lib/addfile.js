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
 * 添加项目文件
 *
 */
exports.add = function (modename, pagename, template) {
	
	var modename = modename || "page";
	
	var prjInfo = config.get('project');
	var root = config.root();
	var pagesDir = path.join(root,prjInfo.pagesDir);
	
	switch(modename){
		case "web": console.log("web");
				    break;
		case "wap": console.log("wap");
				    break;
		case "page": console.log("page");
				    break;
		case "mod": console.log("mod");
				    break;
		case "widget": console.log("widget");
				    break;
	}
	
    //console.log('Build Page!');
	
}

function init(modename){
	
}















