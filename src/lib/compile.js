var fs = require('fs');
var path = require('path');
var isUtf8 = require('is-utf8');
//var iconv = require('iconv-lite');
var tidy = require('./util/tidy.js');
var config = require('./config.js');
var juicer = require("juicer");

// 读取配置文件
var CONFIG_PROJECT = config.get('project');

// 输出最终样式
var output = function(realPath,debug,port){

    var port = port || 8000,
        backport = parseInt(port)+1;

    var data = {
        baseurl: "http://127.0.0.1:"+port
    };

    pageContent = ssi(realPath); // 处理ssi语法
	
	// 仅在调试模式进行
	if(debug){
		// Firebug-lite嵌入,支持IE8及以下
		pageContent = pageContent.replace("${firebug-js}",'<!--[if IE]></script><script src="http://127.0.0.1:'+backport+'/tools/firebug-lite/build/firebug-lite-beta.js"></script><![endif]-->');
		// f5自动刷新
		pageContent = pageContent.replace("${reload-js}",'<script src="/socket.io/socket.io.js"></script><script src="http://127.0.0.1:'+backport+'/tools/reload.js"></script></head>');
	}else{
		// 清除Firebut-lite的引入
		pageContent = pageContent.replace("${firebug-js}",'');
		// 清除F5自动刷新
		pageContent = pageContent.replace("${reload-js}",'');
	}
	
    pageContent = templete(pageContent,data); // 处理模板变量
	
    pageContent = tidy(pageContent); // 格式化HTML
    
    return pageContent;
}

// 处理模板变量
var templete = function(str,data){
    str = juicer(str,data);
    return str;
}

// 处理ssi语法
var ssi = function(fullpath){

    //页面不存在，返回空内容
    if (!fs.existsSync(fullpath)) {
        return '';
    }
    
    var str = fs.readFileSync(fullpath).toString();
	// 匹配三种语法，兼容原来系统语法：<!--#include "url"--> || <!--#include file="url"--> || <!--#include virtual="url"-->
    var regHtmlInclude = /<!--#include (?:file=|virtual=)??".+"-->/gi, regHtmlPath = /<!--#include (?:file=|virtual=)??"(.+)"-->/i;
    var matchArr = str.match(regHtmlInclude);
   
    if (matchArr) {
        for (var i = 0; i < matchArr.length; i++) {
            var realpath = path.join(path.dirname(fullpath),matchArr[i].match(regHtmlPath)[1]);
            
            // 纠正深层目录相对地址错误
            var dirPathStr = path.dirname(fullpath),
                dirPathStrArr = dirPathStr.split('\\'),
                lenNum = dirPathStrArr.length -2,
                tempRelativeUrl = "";
                
            for(var k=0; k<lenNum; k++){
                tempRelativeUrl = tempRelativeUrl + "../";
            }
            
            // 先从自身目录查找
            // 查找不了，到mods目录查找 
            // 如果mods目录没有则输出错误信息
            if (!fs.existsSync(realpath)) {
                realpath = path.join(CONFIG_PROJECT.modsDir,matchArr[i].match(regHtmlPath)[1]);
                if (!fs.existsSync(realpath)) {
                    str = str.replace(matchArr[i],'<span style="background:red;font-size:12px;color:#fff;padding:2px 3px;">引用模块'+matchArr[i].match(regHtmlPath)[1]+'不存在，请检查</span>');
                }
            }
            
            if (fs.existsSync(realpath)) {
                var getHtml = fs.readFileSync(realpath).toString();
                str = str.replace(matchArr[i],getHtml); // 把模块内容合并
                str = str.replace(/\${relativeUrl}/gi,tempRelativeUrl); // 纠正深层目录相对地址错误
            }
        }
    }
    
    return str;
    
};

// 输出接口
exports.ssi = ssi;
exports.output = output;