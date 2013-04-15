/**
 * 处理预览网页请求。
 * 如果是目录，则返回目录列表
 */

var fs = require('fs')
    , path = require('path')
    , join = path.join
    , _ = require('underscore')
    , mime = require('mime')
    , util = require('util')
    , http = require('http')
    //, debug = require('debug')('clam:jspage')
    , debug = console.log
    , config = require('./config.js')
    , J         = require("juicer")
    , conf      = {
        "templateDir"      : "../ui/",
        "template": "folder-viewer.html"
    };


var iconv = require('iconv-lite');

var pathUtil = require('path');

/**
 * 传入参数option格式
 * {
 *    root: '/',
 *    mapping: {'/aaaa': ['aaa/bbb.html', 'ccc/aaa.html']},
 *    maxAge : 1000,
 *    charset : 'gbk',
 *    modsDir: [], //相对项目目录的模块目录位置，可以有多个
 * }
 */
exports = module.exports = function jspage(){
    var prjInfo = {
        modsDir: 'src/mods',
        pagesDir: 'src/pages'
    };
    var root = config.root();
    //var compile = require('./compile.js');
    var pageInfo = config.get('page');
    var mapping = {};
    _.each(pageInfo, function(value){
        if(mapping[value.url]){
            mapping[value.url].push(value.name);
            return;
        }
        mapping[value.url] = [value.name];
    });
    debug('页面映射%s, \n %s', util.inspect(pageInfo), util.inspect(mapping));
    var modsDir = path.join(root, prjInfo.modsDir);

    config.on('pageChange', function(){
        pageInfo = config.get('page');
        mapping = {};
        _.each(pageInfo, function(value){
            if(mapping[value.url]){
                mapping[value.url].push(value.name);
                return;
            }
            mapping[value.url] = [value.name];
        });
        debug('page.json文件被修改:%s', util.inspect(mapping));
    });
    return function(req, res, next) {
        var url = req.url.split('#')[0].split('?')[0];
        var relPath = url;
        if(url.indexOf('/') === 0){
            relPath = url.slice(1, url.length);
        }

        //页面根目录
        var pageRootPath = join(root, prjInfo.pagesDir);

        //请求的url真正相对页面根目录的路径。因为可以有目录映射。
        var realPageRelativePath = exports.mappedFile(url, pageRootPath, mapping);
        debug('页面请求%s -> %s', relPath, util.inspect(realPageRelativePath));

        //既不是文件。也不是目录
        if(!realPageRelativePath || realPageRelativePath === ''){
            res.writeHead(404, { 'Content-Type': 'text/html;charset=utf-8'});
            res.end('404 Error, File not found.');
            return;
        }

        //返回数组，表示是目录，需要显示目录。
        if(util.isArray(realPageRelativePath)){
            var files = realPageRelativePath.sort();
            var tplPath = path.join(__dirname, conf.templateDir, conf.template);
            // this is using juicer engine only
            var pageContent = J(fs.readFileSync(tplPath).toString(), {folderInfo:files});
            // this is using an include render and juicer 
            // var pageContent = J(compile.render(tplPath, [modsDir], prjInfo.cdnPath), {folderInfo: files});
            res.setHeader('Content-Type', 'text/html;charset=utf-8');
            res.setHeader('Content-Length', pageContent.length);
            res.end(pageContent);
            return;
        }
        //页面在服务器真实绝对路径
        var realAbsPapePath = join(pageRootPath, realPageRelativePath);

        //只处理html文件的SSI等高级语法
        if(realPageRelativePath.match(/.*\.html$/)){
            var type = mime.lookup(realPageRelativePath);

            var pageContent = '';
            try{
               // pageContent = compile.render(realAbsPapePath, [modsDir], prjInfo.cdnPath);

                //if(prjInfo.charset[0].match(/gbk/i)){
                   // pageContent = iconv.encode(pageContent, 'gbk');
               // }
            }
            catch(e){
                res.writeHead(500, { 'Content-Type': 'text/html;charset=utf-8'});
                res.end('500 Error, Internal Server Error.');
                return;
            }
            res.setHeader('Content-Type', type + '; charset=' + prjInfo.charset[0]);
            res.setHeader('Content-Length', pageContent.length);
            res.end(pageContent);
        }

        //其他格式的文件按照原内容返回
        var stream = fs.createReadStream(realAbsPapePath, {});
        req.on('close', stream.destroy.bind(stream));
        stream.pipe(res);

        stream.on('error', function(err){
            if (res.headerSent) {
                req.destroy();
            } else {
                next(err);
            }
        });
    };
};

/**
 * 根据url和映射关系返回对应真正的内容
 * 返回值有3种情况
 * 如果为null，则表示此url既不能对应到虚拟路径，也不能对应到实际路径。
 * 如果为字符串，则表示此url最终对应到一个文件。
 * 如果为数组，则表示此url最终对应到一个目录。
 * @param url
 * @param maps
 * @return {*}
 */
exports.mappedFile = function mappedFile(url, root, maps){
    var subDirs = [];
    var longestMatch = -1;
    var longestMatchKey = null;

    //在表中定义过的映射，按照最长匹配原则，找到映射后，依次寻找第一个存在的文件。找到一个存在文件后就返回。
    //如果找到的是一个目录，就临时保存起来。
    _.each(maps, function(value, key){
        debug('临时:key:%s,url:%s', key, url)
        //url以key开头。则被认为是可以匹配。因为key既可以映射目录，也可以映射文件
        if(url.indexOf(key) === 0 && longestMatch < key.length){
            longestMatch = key.length;
            longestMatchKey = key;
        }
    });
    if(longestMatchKey){
        debug('最长匹配 %s', longestMatchKey);
        var mappedDirs = maps[longestMatchKey];
        var mappedDirExist = false;
        for(var i = 0; i < mappedDirs.length; i++){
            var mappedDir = url.replace(longestMatchKey, mappedDirs[i]);
            if(fs.existsSync(join(root,mappedDir))){
                mappedDirExist = true;
                var mappedRealDir = join(root,mappedDir);
                var state = fs.statSync(mappedRealDir);
                if(state.isDirectory()){
                    subDirs = fs.readdirSync(mappedRealDir);
                }
                else{
                    return mappedDir;
                }
            }
        }
        if(!mappedDirExist){
            return null;
        }
    }
    // 寻找真实root目录下的相关文件，如果是目录，需要把目录的内容和映射定义中的合并起来
    var realDir = join(root,url);
    debug('寻找物理目录:%s',realDir);
    if(fs.existsSync(realDir)){
        var state = fs.statSync(realDir);
        if(state.isDirectory()){
            var realsubDirs = fs.readdirSync(realDir);
            subDirs = subDirs.concat(realsubDirs);
        }
        else{
            return url;
        }
    }

    _.each(maps, function(dir, key){
        debug('%s => %s',  key, dir);
        if(key.trim() == ''){
            return;
        }
        var rel = pathUtil.relative(url, key);
        if(rel.indexOf('..') !== 0 && rel.length !== 0){
            debug('找到虚拟路径%s', rel);
            subDirs.push(rel.split('/')[0]);
        }
    });
    //输入的url没有找到任何一个匹配，
    if(subDirs.length === 0){
        return null;
    }
    return _.union(subDirs)
}
