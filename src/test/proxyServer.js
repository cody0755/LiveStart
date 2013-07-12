var fs          = require('fs'),
    http        = require('http'),
    connect     = require("connect"),
    net         = require('net'),
    path        = require('path'),
    URL         = require('url'),
    querystring = require('querystring'),
    log         = require('./util/logger').log,
    prjInfo     = config.get('project'), // 获取配置文件
    root        = config.root(), // 获取根目录
    pageDir     = path.join(root, prjInfo.pagesDir,"\\"), // 获取pages目录
    modDir     = path.join(root, prjInfo.modsDir,"\\"); // 获取mods目录


function init(){

    var router = {
        "/static/images/banner.jpg":"/images/banner.jpg"
    };

    var searchRouter = function(req,res,router){

        for(var url in router){
            if(url == req.url){
                var realPath = path.join(pageDir,router[url]);
                var raw = fs.createReadStream(realPath);
                //res.writeHead(200, "Ok");
                res.writeHead(200, "Ok");
                raw.pipe(res);
                return false;
            }
        }

        return true;
    };

    var proxy = new httpProxy.RoutingProxy();
    var proxyServer = httpProxy.createServer(function(req,res){

        if(searchRouter(req,res,router)){
            var buffer = httpProxy.buffer(req);
            proxy.proxyRequest(req, res, {
                host: 'ued.alipay.com',
                port: 80,
                buffer: buffer
            });
        }

    });

    proxyServer.listen(8001);

    log('tips', 'info', "代理服务器成功启动...");

}
