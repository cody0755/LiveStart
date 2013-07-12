var post = exports.post = {};
var get = exports.get = {};

var fs          = require('fs'),
    path        = require('path'),
    querystring = require('querystring'),
    nodefile    = require("node-file"),
    config      = require('../config.js'),
    appDir      = path.resolve(__dirname, '../..'),
    juicer      = require("juicer"),
    prjInfo     = config.get('project'), // 获取配置文件
    root        = config.root(), // 获取根目录
    pageDir     = path.join(root, prjInfo.pagesDir,"\\"), // 获取pages目录
    modDir      = path.join(root, prjInfo.modsDir,"\\"), // 获取mods目录
    templateDir = path.join(appDir,prjInfo.resourceDir,"page","\\");

config.on('projectChange', function(){
    prjInfo     = config.get('project')
});

post.add = function () {

    var pageForm = this.request.post(),
        pageFileName = pageForm.name,
        data = {};

    if (!(/\.(html)$/).test(pageFileName)) {
        pageFileName = pageFileName.replace(/\..*$/, "") + '.html';
    }

    var pagePath = path.join(pageDir, pageFileName);

    if (fs.existsSync(pagePath)) {
        data =  {
            succeed:false,
            msg:'存在相同的页面，创建页面失败。',
            data:pagePath
        };
        return this.renderJSON(data);
    }

    if(!fs.existsSync(templateDir)){
        data = {succeed:false,
            msg:'模板'+template+'不存在',
            data:''
        };

        return this.renderJSON(data);
    }

    var pageName = pageFileName.replace(/\..*$/, "");
    var pageInfo = {
        name: pageName,
        url: prjInfo.cdnPath,
        description: prjInfo.description
    };
    var param = {project: prjInfo, page: pageInfo};

    eachFile(templateDir, function(file){
        var tmplContent = fs.readFileSync(file);

        tmplContent = tmplContent.toString();

        //模板处理引擎
        var pageContent = juicer(tmplContent, param);

        //复制到destDir并且处理编码问题
        var dir = path.dirname(file);
        var relative = path.relative(templateDir, dir);
        var destDir = path.join(pageDir, relative);
        nodefile.mkdirsSync(destDir);
        destName = path.basename(pageName);
        var destFilePath = path.basename(file).replace(/template(\..*)/, destName+'$1');
        destFilePath = path.join(destDir, destFilePath);
        //r c = iconv.encode(pageContent,config.get('project').charset[0]);
        fs.writeFileSync(destFilePath, pageContent);
    });

    data =  {
        succeed:true,
        msg:'创建页面成功',
        data:{}
    };

    this.renderJSON(data);
    //this.response.setHeader("Content-Type", "text/plain");
    //this.response.writeHead(200);
    //this.response.end();

};

/**
 * 递归便利目录，调用回调函数
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

