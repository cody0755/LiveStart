var post = exports.post = {};
var get = exports.get = {};

var fs          = require('fs'),
    path        = require('path'),
    querystring = require('querystring'),
    nodefile    = require("node-file"),
	jsbeautify = require("js-beautify"),
    sass        = require('node-sass'),
    less        = require('less'),
    coffee      = require('coffee-script'),
    Ssi         = require('../ssi'),
    joycss      = require("joycss"),
    config      = require('../config.js'),
    appDir      = path.resolve(__dirname, '../..'),
    juicer      = require("juicer"),
	httpProxy   = require("http-proxy"),
	existsSync  = fs.existsSync || path.existsSync,
	log         = require('../util/logger').log,
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
	
	var req_data = this.request.post();
	startProxyServer(req_data);
	//ued.alipay.com
	
	data =  {
		succeed:true,
		msg:'文件在http://127.0.0.1:'+(req_data.port||8001)+'成功启动...',
		data:{}
	};
	this.renderJSON(data);
};

function startProxyServer(req_data){
	
	var weburl   = req_data.url,
		webport  = req_data.webport,
		port     = req_data.port,
		proxyList= {};
	
	var proxyListArr = req_data.proxyList.split(";");
	for(var k in proxyListArr){
		if(typeof proxyListArr[k]!=="function"){
			var proxyListArr2 = proxyListArr[k].split("||");
			proxyList[proxyListArr2[0]] = proxyListArr2[1];
		}
	}
	
	if(!weburl){
		log('tips', 'info', "网址不能为空...");
		return;
	}
	
    var router = proxyList || {};

    var searchRouter = function(req,res,router){

        for(var url in router){
            if(url == req.url){
                var realPath = path.join(pageDir,router[url]);
				if(existsSync(realPath)){
					var raw = fs.createReadStream(realPath);
					res.writeHead(200, "Ok");
					raw.pipe(res);
					return false;
				};
            }
        }

        return true;
    };

    var proxy = new httpProxy.RoutingProxy();
    var proxyServer = httpProxy.createServer(function(req,res){

        if(searchRouter(req,res,router)){
            var buffer = httpProxy.buffer(req);
            proxy.proxyRequest(req, res, {
                host: weburl,
                port: webport || 80,
                buffer: buffer
            });
        }

    });
	
    proxyServer.listen(port||8001);

    log('tips', 'info', "代理服务器成功启动...");
	
};
