var fs          = require('fs'),
    path        = require('path'),
    querystring = require('querystring'),
    nodefile    = require("node-file"),
    appDir      = path.resolve(__dirname, '../..'),
    log         = require('./logger').log,
    beautify    = require('js-beautify'),
    iconv       = require('iconv-lite'),
    config      = require('../config.js'),
    juicer      = require("juicer");

function TplTools(){
}

TplTools.prototype.copyTplDir = function(dir1,dir2){

    eachFile(dir1, function(file){
    
        var ext = path.extname(file);
        
        var relativePath =  toRelativePath(file,dir1); 
        var destFilePath = toDestFilePath(file,dir2,relativePath);

        var prjInfo     = config.get('project');
        var param = prjInfo;
        
        if(/html|shtml|css|scss|coffee|js/.test(ext)){
            var tmplContent = fs.readFileSync(file);
            tmplContent = tmplContent.toString();
            //模板处理引擎
            var pageContent = juicer(tmplContent, param);
            
            if(/html|shtml/.test(ext)){
                pageContent = beautify.html(pageContent);
            }
            
            if(/js/.test(ext)){
                pageContent = beautify.js_beautify(pageContent);
            }
            
            if(/css/.test(ext)){
                pageContent = beautify.css(pageContent);
            }
            
            try{
                pageContent = iconv.encode(pageContent,this.config.charset);
                nodefile.writeFileSync(destFilePath,pageContent,false);
            }catch(e){
                log("warn","warn",e);
                //console.log(e);
            }
        }else{
            try{
                nodefile.copyFileSync(file,destFilePath,false);
            }catch(e){
                //console.log(e);
                log("warn","warn",e);
            }
        }
    });

};

// 转相对路径
function toRelativePath(file,dir1){
    
    var dirName = path.dirname(file);
    var relativePath = path.relative(dir1, dirName);
        
    return relativePath;
};

// 转对应的页面路径
function toDestFilePath(file,dir2,relativePath){

    var destName = path.basename(file);
    var destDir = path.join(dir2, relativePath);
    var destFilePath = destName.replace(/template(\..*)/, destName+'$1');
    destFilePath = path.join(destDir, destFilePath); //目标文件名
    
    return destFilePath;
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
};

module.exports = TplTools;
 
	
