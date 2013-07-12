var fs          = require('fs'),
    http        = require('http'),
    httpProxy = require('http-proxy'),
    connect     = require("connect"),
    net         = require('net'),
    path        = require('path'),
    URL         = require('url'),
    querystring = require('querystring'),
    juicer      = require("juicer"),
    log         = require('./util/logger').log,
    sass        = require('node-sass'),
    less        = require('less'),
    coffee      = require('coffee-script'),
    Ssi         = require('./ssi'),
	ssi         = new Ssi();
	jsbeautify  = require("js-beautify"),
    existsSync  = fs.existsSync || path.existsSync,
    config      = require('../lib/config.js'),
    appDir      = path.resolve(__dirname, '..'),
    mime        = require("../config/debug_mime").types,
    debugConfig = require("../config/debug_config"),
    listTpl     = fs.readFileSync(path.join(appDir, 'tpl/sever.html')).toString(),
    prjInfo     = config.get('project'), // 获取配置文件
    root        = config.root(), // 获取根目录
    pageDir     = path.join(root, prjInfo.pagesDir,"\\"), // 获取pages目录
    modDir     = path.join(root, prjInfo.modsDir,"\\"); // 获取mods目录

// 设置转向代理
var comboEnv = {
    urls : {},
    filter : {
        '-min\\.js$' : '\.js',
        '-min\\.css$' : '\.css',
        '\\?.+' : ''
    },
    supportedFile : '\\.js|\\.css|\\.scss|\\.png|\\.gif|\\.jpg|\\.swf|\\.xml|\\.less|\\.html'
};
comboEnv.urls['/'] = prjInfo.pagesDir;
comboEnv.urls['/mods'] = prjInfo.modsDir;
comboEnv.urls['/build'] = prjInfo.buildDir;
comboEnv.urls['/livestart'] = path.join(appDir,'tpl'); // 服务器TPL目录

function Server(request, response){
    this.request = request;
    this.response = response;
    this.finished = false;
    this.init();
}

Server.prototype = {
    constructor: Server,

    // 初始化
    init:function(){
        this.initFiles();
    },

    initFiles: function(){
        var req = this.request;
        var res = this.response;

        this.data = [];
        var self = this;
        req.on('data', function(chunk) {
            self.data.push(chunk);
        });
        req.on('end', function(){
            self._start();
        });

    },

    longgestMatchedDir: function(fullPath) {
        var map = comboEnv.urls;
        var longestMatchNum = -1 , longestMatchPos = null;
        for (k in map) {
            if (fullPath.replace(/\\/g, '/').indexOf(k) === 0 && longestMatchNum < k.length) {
                longestMatchNum = k.length;
                longestMatchPos = k;
            }
        }
        return longestMatchPos;
    },

    _filter: function(fullPath){
        var map = comboEnv.urls;

        var longestMatchPos = this.longgestMatchedDir(fullPath);
        var dirs = map[longestMatchPos].split(',');

        for (var i = 0, len = dirs.length; i < len; i++){
            var dir = dirs[i];
            var revPath = fullPath.slice(longestMatchPos.length, fullPath.length);
            var absPath = '';

            //如果是绝对路径，直接使用
            if(dir.indexOf('/') === 0 || /^\w{1}:\\.*$/.test(dir)){
                absPath = path.normalize(path.join(dir, revPath));
            }
            else{
                absPath = path.normalize(path.join(root, dir, revPath));
            }
        }
        return absPath;
    },

    _start: function(){
        var req = this.request,
            res = this.response,
            _this = this,
            url = URL.parse(req.url).path;

        url = url.replace(/\/+/g, '/').replace(/\\+/g, '/');

        var urls = this.parse(url);

        var files = [];
        urls.forEach(function(file){
            file = _this._filter(file);
            files = files.concat(file);
        });


        var cfg = {
            files: files,
            len: files.length
        };

        this.hook(cfg);


    },


    hook: function(cfg){
        if (this.finished) return;

        var req = this.request;
        var res = this.response;
        var _this = this;
		//var modReg = new RegExp(modDir.replace('\\','\\\\'),"g");

        cfg.files.forEach(function(file){
            var realPath = decodeURIComponent(file);

            fs.stat(realPath, function (err, stats) {
				var pageContent = '';
                if (err) {

                    var ext = path.extname(realPath);
                    var isExist = false;

                    // 处理SASS文件
                    if(/css/.test(ext) && existsSync(realPath.replace(ext,".scss"))){
                        isExist = true;
                        realPath = realPath.replace(ext,".scss");

                        var scss_content = fs.readFileSync(realPath).toString();
                        var css = sass.renderSync({
                            data: scss_content
                        });

                        ext = ext ? ext.slice(1) : 'unknown';
                        var contentType = mime[ext] || "text/plain";
                        res.setHeader("Content-Type", contentType);
                        res.writeHead(200, "Ok");
                        res.end(css);
                    }

                    // 处理Less文件
                    if(/css/.test(ext) && existsSync(realPath.replace(ext,".less"))){
                        isExist = true;
                        realPath = realPath.replace(ext,".less");

                        var less_content = fs.readFileSync(realPath).toString();

                        less.render(less_content, function (e, css) {
                            //console.log(css);
                            ext = ext ? ext.slice(1) : 'unknown';
                            var contentType = mime[ext] || "text/plain";
                            res.setHeader("Content-Type", contentType);
                            res.writeHead(200, "Ok");
                            res.end(css);
                        });
                    }

                    // 处理Coffee文件
                    if(/js/.test(ext) && existsSync(realPath.replace(ext,".coffee"))){
                        isExist = true;
                        realPath = realPath.replace(ext,".coffee");

                        var coffee_content = fs.readFileSync(realPath).toString();

                        javascript = coffee.compile(coffee_content);

                        ext = ext ? ext.slice(1) : 'unknown';
                        var contentType = mime[ext] || "text/plain";
                        res.setHeader("Content-Type", contentType);
                        res.writeHead(200, "Ok");
                        res.end(javascript);

                    }
					
					// 模块编辑模式
					if(/\\edit$/.test(realPath)){
						isExist = true;
                        var contentType = mime["html"] || "text/plain";
                        res.setHeader("Content-Type", contentType);
						
						realPath= realPath.replace(/\\edit$/,"");
						//var modfile = path.join(realPath,realPath.split("\\").pop()+".html");
						
						var modtplfile = fs.readFileSync(path.join(appDir, 'tpl/modfile.html')).toString();
						
						var modname = realPath.split("\\").pop().replace(".html",""), // 模块名
							modpath = realPath.replace(modDir,"").replace(realPath.split("\\").pop(),"").replace("\\","/"); // 模块相对地址

						if(/html/.test(path.extname(realPath))){
							// 模块信息
							var data = {
								part:8000, // 端口
								modname:modname, // 模块名
								modpath:modpath // 模块相对地址
							};
							
							pageContent = juicer(modtplfile,data); 
							pageContent = ssi.ssi(pageContent,realPath);
							//pageContent = pageContent.replace(/\{__BASEURL__}/gi,"http://127.0.0.1:8000/mods/"+modpath);
							pageContent = ssi.getSytleScript(pageContent);
							
						}

						res.writeHead(200, "Ok");
						res.end(pageContent);
					}

                    if(!isExist){
                        res.writeHead(404, "Not Found", {'Content-Type': 'text/plain'});
                        res.write("This request URL " + file + " was not found on this server.");
                        res.end();
                    }



                } else {
                    if (stats.isDirectory()) {
                        var indexPath = path.join(realPath, "/", debugConfig.Welcome.file);
                        if(existsSync(indexPath)){
                            realPath = path.join(realPath, "/", debugConfig.Welcome.file);
                            var newPaths = [];
                            newPaths.push(realPath);
                            _this.hook({
                                files: newPaths,
                                len: newPaths.length
                            });
                            //pathHandle(realPath);
                        }else {
                            _this.showDirectory(realPath, req, res);
                        }
                    }else{
                        var ext = path.extname(realPath);
                        ext = ext ? ext.slice(1) : 'unknown';
                        var contentType = mime[ext] || "text/plain";

                        res.setHeader("Content-Type", contentType);
                        //处理html文件
                        if(ext.match(/html|shtml/ig)){

                            try{
                                //pageContent = fs.readFileSync(realPath).toString();
                                //页面不存在，返回空内容
                                if (!existsSync(realPath)) {
                                    return '';
                                }

                                pageContent = fs.readFileSync(realPath).toString();
                                pageContent = ssi.ssi(pageContent,realPath);

								if(!/livestart/.test(realPath)){
									pageContent = ssi.getSytleScript(pageContent,true);
								}
								pageContent = jsbeautify.html(pageContent);

                            }
                            catch(e){
                                res.writeHead(500, "Internal Server Error", {'Content-Type': 'text/plain'});
                                res.end('500 Error, Internal Server Error.');
                                return;
                            }
                            res.writeHead(200, "Ok");
                            res.end(pageContent);
                        }else {
                            // 其它文件统一直接输出
                            var raw = fs.createReadStream(realPath);
                            req.on('close', raw.destroy.bind(raw));
                            res.writeHead(200, "Ok");
                            raw.pipe(res);
                        }
                    }
                }

            });

        });

    },

    // 仿Apache列表显示文件夹下面的文件
    showDirectory:function(parentDirectory){
        var req = this.request;
        var res = this.response;
        var _this = this;

        fs.readdir(parentDirectory,function(error,files){
            var body=_this.formatBody(parentDirectory,files);
            res.writeHead(200,{
                "Content-Type":"text/html;charset=utf-8",
                "Content-Length":Buffer.byteLength(body,'utf8'),
                "Server":"NodeJs("+process.version+")"
            });
            res.write(body,'utf8');
            res.end();
        });

    },

    // 格式化类Apache文件列表
    formatBody:function(parent,files){
        var res = "",
            length=files.length,
			pardir = "";
        var data = {
            initPath:false,
            parentdirName:"返回上一级",
            parentdir:"../",
            list:[]
        };

        // 如果是根目录
        if(parent==pageDir){
            data.initPath = true;
        }
		
		// 如果是模块目录
		if(parent==modDir.slice(0,-1)){
			pardir = "mods/"
		}

        // 遍历文件
        files.forEach(function(file){
            var stat=fs.statSync(path.join(parent,file)),
                pathname = '',
                extName,
                extClass,
                ext = '';

            if(stat.isDirectory(file)){
                pathname = path.basename(file)+"/";
                file= path.basename(file)+"/";
                ext = "dir";
                extName = "文件夹";
                extClass = "icon-folder-open";
            }else{
                pathname = path.basename(file);
                file= path.basename(file);
                ext = path.extname(file);

                switch(ext){
                    case ".html":
                        extName = "页面";
                        extClass = "icon-file";
                        break;
                    case ".shtml":
                        extName = "页面";
                        extClass = "icon-file";
                        break;
                    case ".js":
                        extName = "脚本";
                        extClass = "icon-book";
                        break;
                    case ".css":
                        extName = "样式表";
                        extClass = "icon-book";
                        break;
                    case ".less":
                        extName = "样式表";
                        extClass = "icon-book";
                        break;
                    case ".png":
                        extName = "图片";
                        extClass = "icon-leaf";
                        break;
                    case ".gif":
                        extName = "图片";
                        extClass = "icon-leaf";
                        break;
                    case ".jpg":
                        extName = "图片";
                        extClass = "icon-leaf";
                        break;
                    default:
                        extName = "页面";
                        extClass = "icon-file";
                        break;
                }


            }

            var tempPath = {
                pathname:file,
                path:pardir+pathname,
                ext:ext,
                extName:extName,
                extClass:extClass
            };
            data.list.push(tempPath);

        });

        res = juicer(listTpl,data);

        return res;
    },


    /**
     * 解combine的url
     * @param url {string} 合并url路径，a.tbcdn.cn/??a.css,b.css,c.css
     * @return {array} 返回数组，url分别对应的文件
     */
    parse: function(url){//{{{
        var ret = [];

        var combo = url.indexOf('??');
        var base, files;

        if (-1 !== combo) {
            base = url.slice(0, combo);
            files = url.slice(combo + 2);

            files = files.split('?')[0];
            files = files.split('#')[0];

            files = files.split(',');

            files.forEach(function (file) {
                var _url = base + '/' + file;
                ret.push(_url.replace(/\/+/g, '/'));
            });
        } else {
            url = url.split('?')[0];
            url = url.split('#')[0];
            ret.push(url);
        }

        // 去除重复
        var _o = {};
        ret.forEach(function(file){
            _o[file] = 1;
        });
        ret = Object.keys(_o);

        return ret;
    }//}}}

};


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

exports = module.exports = Server;