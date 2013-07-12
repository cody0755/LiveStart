var post = exports.post = {};
var get = exports.get = {};

var fs          = require('fs'),
    path        = require('path'),
    querystring = require('querystring'),
    nodefile    = require("node-file"),
    joycss      = require("joycss"),
    config      = require('../config.js'),
    appDir      = path.resolve(__dirname, '../..'),
    juicer      = require("juicer"),
    prjInfo     = config.get('project'), // 获取配置文件
    root        = config.root(), // 获取根目录
    pageDir     = path.join(root, prjInfo.pagesDir,"\\"), // 获取pages目录
    modDir      = path.join(root, prjInfo.modsDir,"\\"), // 获取mods目录
    templateDir = path.join(appDir,prjInfo.resourceDir,"page","\\");



post.init = function () {

    var data;
	var csslist = getCssList();
	var indexs = this.request.post();
	var newCssList = [],
		k;
	
	for(k in indexs){
		newCssList.push(csslist[k].file);
	}
	
	try{
		// 生成sprite图
		console.log(newCssList);
		joycss.Mult.add(newCssList, false);
		joycss.Mult.run();

		data =  {
			succeed:true,
			msg:'生成sprite图成功',
			data:newCssList
		};
	} catch(e){
		data =  {
			succeed:false,
			msg:'生成sprite图失败',
			data:{}
		};
	}
    

    this.renderJSON(data);

};

function getCssList(){
	var csslist = [],
		mlist = [];
	var pageFiles = returnPagesList(pageDir);
	
	csslist = pageFiles.filter(function(item,index){
        if (/css|scss|less/.test(item.ext)) {
            return true;
        }
    });
	
	csslist = csslist.distinct();
	
	csslist = csslist.sort(function (a, b) {
        return a < b;
    });
	
	return csslist;
}

get.getCssList = function(){
	
	
	data =  {
        succeed:true,
        msg:'获取CSS列表成功',
        data:getCssList()
    };
	this.renderJSON(data);
};


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

