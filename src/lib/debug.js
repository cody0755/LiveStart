var PORT = 8000;
var http = require("http");
var connect = require('connect');;
var app = connect();
var url = require("url");
var fs = require("fs");
var os = require('os');
var exec = require('child_process').exec;
var path = require("path");
var mime = require("../lib/debug_mime").types;
var debugConfig = require("../lib/debug_config");
var config = require('./config.js');
var compile = require("../lib/compile");
var pageDir = "src/pages";
var juicer = require("juicer");
var walk = require('./util/walk.js')
var _ = require('underscore');
//var zlib = require("zlib"); 关闭Gzip
// 读取配置文件
var CONFIG_PROJECT = config.get('project');




// 仿Apache列表显示文件夹下面的文件  
function listDirectory(parentDirectory,req,res){  
    fs.readdir(parentDirectory,function(error,files){  
        var body=formatBody(parentDirectory,files);  
        res.writeHead(200,{  
            "Content-Type":"text/html;charset=utf-8",  
            "Content-Length":Buffer.byteLength(body,'utf8'),  
            "Server":"NodeJs("+process.version+")"  
        });  
        res.write(body,'utf8');  
        res.end();  
    });  
  
} 

var listTpl = '<!doctype><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"></meta><title>liveStart文件服务器</title><style>*{ padding:0; margin:0;} ul{ line-height:30px; font-size:14px; padding:20px 50px;};a:hover { background:blue;color:#fff;}</style></head><body width="100%"><ul><li><a href="${parentdir}">${parentdirName}</a></li>{@each list as item}<li><a href="${item.path}">${item.path}</a></li>{@/each}</ul></body>';
  
// 在Web页面上显示文件列表，格式为<ul><li></li><li></li></ul> 
// TODO：改成读取文件模板，以后可以直接修改HTML达到效果。 
function formatBody(parent,files){
    
    var res = "",
        length=files.length; 
    var data = {
		parentdirName:"./",
		parentdir:"./",
		list:[]
    };
    
    files.forEach(function(val,index){  
        var stat=fs.statSync(path.join(parent,val));  
        if(stat.isDirectory(val)){  
            val=path.basename(val)+"/";  
        }else{  
            val=path.basename(val);  
        };
        var tempPath = {
            path:val
        };
        data.list.push(tempPath);  
    }); 
	
	// 增加上一级目录
	var dirPathStrArr = parent.split('\\');
		dirPathStrArr.pop();
    var lenNum = dirPathStrArr.length -2,
		tempUrl = [],
		levelUrl = "../";
	
	if(lenNum && lenNum == 1){
		data.parentdirName = "返回上一级目录";
		data.parentdir = levelUrl;
	}else {
		dirPathStrArr.pop();
		for(var k=0; k<(lenNum-1); k++){
			levelUrl = levelUrl+levelUrl;
			tempUrl.unshift(dirPathStrArr.pop());
			data.parentdirName = "返回上一级目录";
			data.parentdir = levelUrl+tempUrl.join("/")+"/";
		}
	}

    res = juicer(listTpl,data);
    
    return res;
}  


exports = module.exports = function(popupBrowser) {

	var startTime = new Date();
	var server = http.createServer(function(request, response) {
		response.setHeader("Server", "liveStart Server");

		var pathname = url.parse(request.url).pathname;
		// console.log(pathname); // 输出请求的资源
		
		if (pathname.slice(-1) === "/") {
			//pathname = pathname + debugConfig.Welcome.file;
			var indexPath = path.join(CONFIG_PROJECT.pagesDir, path.normalize((pathname + debugConfig.Welcome.file).replace(/\.\./g, "")));
			if(fs.existsSync(indexPath)){
				pathname = pathname + debugConfig.Welcome.file;
			}
		}
		
		// 以pages的目录为静态文件服务器目录 
		var realPath = path.join(CONFIG_PROJECT.pagesDir, path.normalize(pathname.replace(/\.\./g, "")));

		var pathHandle = function (realPath) {
			fs.stat(realPath, function (err, stats) {
				if (err) {
					response.writeHead(404, "Not Found", {'Content-Type': 'text/plain'});
					response.write("This request URL " + pathname + " was not found on this server.");
					response.end();
				} else {
					if (stats.isDirectory()) {
						var indexPath = path.join(realPath, "/", debugConfig.Welcome.file);
						if(fs.existsSync(indexPath)){
							realPath = path.join(realPath, "/", debugConfig.Welcome.file);
							pathHandle(realPath);
						}else {
							listDirectory(realPath, request, response);
						}
						//realPath = path.join(realPath, "/", debugConfig.Welcome.file);
						//pathHandle(realPath);
					} else {
						var ext = path.extname(realPath);
						ext = ext ? ext.slice(1) : 'unknown';
						var contentType = mime[ext] || "text/plain";
						response.setHeader("Content-Type", contentType);

						var lastModified = stats.mtime.toUTCString();
						var ifModifiedSince = "If-Modified-Since".toLowerCase();
						response.setHeader("Last-Modified", lastModified);

						if (ext.match(debugConfig.Expires.fileMatch)) {
							var expires = new Date();
							expires.setTime(expires.getTime() + debugConfig.Expires.maxAge * 1000);
							response.setHeader("Expires", expires.toUTCString());
							response.setHeader("Cache-Control", "max-age=" + debugConfig.Expires.maxAge);
						}
		
						//if ( request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]) {
						//    response.writeHead(304, "Not Modified");
						//    response.end();
						//} else {
						
							//处理html文件
							if(ext.match(/html|shtml/ig)){

								var pageContent = '';
								try{
									pageContent = compile.output(realPath,true);
								}
								catch(e){
									response.writeHead(500, "Internal Server Error", {'Content-Type': 'text/plain'});
									response.end('500 Error, Internal Server Error.');
									return;
								}
								response.writeHead(200, "Ok");
								//response.write(file, "binary");
								//response.setHeader('Content-Length', pageContent.length);
								response.end(pageContent);
							}else {
								// 其它文件统一直接输出
								var raw = fs.createReadStream(realPath);
								response.writeHead(200, "Ok");
								raw.pipe(response);
							}
						//}
					}
				}
			});
		};

		pathHandle(realPath);
	});
	
	
	// 创建后台服务器，用于界面化设置、编辑模块与F5脚本、FirebugLite使用
	var appServer = function() {
	
		// 以ui的目录为后台服务器目录
		var appDir = path.resolve(__dirname, '..');
	
		// 路由
		app.use('/', function(req, resp, next){
			if(req.url === '/'){
				req.url='/create-project.html';
			}
			next();
		});
		app.use(connect.query());
		

		// 实现工具界面
		app.use(function(req, res, next) {
			var send = require('send');
			var parse = function(req) {
				var parsed = req._parsedUrl;
				if (parsed && parsed.href == req.url) {
					return parsed;
				} else {
					return req._parsedUrl = parse(req.url);
				}
			};
			var url = require('url');
			if ('GET' != req.method && 'HEAD' != req.method)
				return next();

			var root = appDir;
			var appPath = '/ui' + parse(req).pathname;
			var inst = send(req, appPath).root(root);
			//.pipe(res);
			inst.stream = appPath.indexOf("html") == -1 ? inst.stream : function(appPath, options) {
				var self = this;
				var res = this.res;
				var req = this.req;
				var html = compile.output(appPath);
				res.removeHeader("Content-Length");
				res.write(html);
				res.end();
			};
			inst.pipe(res);
		});
		
		http.createServer(app).listen(8001);
		
	};
	
	appServer();
	
	
	var io = require('socket.io').listen(server);
	io.sockets.on('connection', function (socket) {
		
		var prjInfo = config.get('project');
		var root = config.root();
		
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
		
		_.map(pageFiles, function (file) {
			fs.watch(file, function () {
				socket.emit('reload', { reload: true });
			});
		});
		
		
	  
	  //socket.on('my other event', function (data) {
	  //	console.log(data);
	  //});
	});
	
	var startupSecond = ((new Date()).getTime() - startTime.getTime()) / 1000;
	server.listen(PORT);
	console.log('Livestart Server started, %s seconds.', startupSecond);
	console.log("Livestart Server runing at port: " + PORT + ".");

	// 如果为true直接弹出窗口
    if(popupBrowser){
        setTimeout(function() {
            var target = 'http://127.0.0.1:8000';
            var callback = null;
            switch (os.platform()) {
                case 'win32':
                    console.log('opening... http://127.0.0.1:8000');
                    exec('start ' + target, callback);
                    break;
                case 'darwin':
                    console.log('opening... http://127.0.0.1:8000');
                    exec('open ' + target, callback);
                    break;
                case 'linux':
                    console.log('opening... http://127.0.0.1:8000');
                    var cmd = 'type -P gnome-open &>/dev/null  && gnome-open ' + p + ' || { type -P xdg-open &>/dev/null  && xdg-open ' + p + '; }';
                    exec(cmd, callback);
                default:
                    var error = new Error();
                    error.message = 'Can\'t Open it';
                    callback(error);
            }
        }, 1000);
    }

}

