var fs          = require('fs'),
    http        = require('http'),
    path        = require('path'),
    connect     = require("connect"),
    log         = require('./util/logger').log,
    Doserver    = require('./Doserver'),
    StaticServer= require('./StaticServer'),
    io          = require('socket.io'),
    config      = require('../lib/config.js'),
    prjInfo     = config.get('project'), // 获取配置文件;
    debugServer;

function init(){

    var debugApp = connect();

    // 调试服务器
    debugApp.use(function(req, res, next){

        req.setEncoding("utf8");

        // 去掉favicon.ico的请求干扰
        if (req.url == "/favicon.ico") {
            res.writeHead(404, "Not Found");
            res.end();
            return;
        }

        if (/livestartAction/.test(req.url)) {
            // 启动动态服务器解析
            new Doserver(req, res);
        } else {
            // 启动DEMO服务器
            new StaticServer(req, res);
        }

    });
    debugServer = http.createServer(debugApp);

    // 自动刷新
    var isReload = true;
    if(isReload){

    var _sockets = [],
        sockets,
        change,
        _io,
        _ref,
        _ref1;

    var watcher = require("watch-tree-maintained").watchTree(path.join(prjInfo.pagesDir,".."), {
        "ignore": /(.*\/\.\w+|.*~$)/
    });


        _sockets = [];
        _io = (_ref = io.listen(debugServer, {
            "log level": 0
        }), sockets = _ref.sockets, _ref);
        sockets.on("connection", function(socket) {
            return _sockets.push(socket);
        });
        _ref1 = ["fileCreated", "fileModified", "fileDeleted"];
        for (var _i = 0, _len = _ref1.length; _i < _len; _i++) {
            change = _ref1[_i];
            watcher.on(change, function(file) {
                var socket, _j, _len1, _results;
                _results = [];
                file = file.replace(prjInfo.pagesDir,"");
                var ext = path.extname(file);

                for (_j = 0, _len1 = _sockets.length; _j < _len1; _j++) {
                    socket = _sockets[_j];
                    if(ext ===".less" || ext ===".scss" ){
                        file = file.replace(ext,".css");
                    }
                    if(ext ===".coffee"){
                        file = file.replace(ext,".js");
                    }
                    _results.push(socket.emit("reload", file));
                }
                return _results;
            });
        }
    }


    debugServer.listen(prjInfo.port);
    log('tips', 'info', "DEMO服务器成功启动...");
	log('tips', 'info', "您可以用以下地址在电脑或者局域网访问：");
	
	// 获取本地的IP地址
	var os=require('os');  
	var ifaces=os.networkInterfaces();  
	for (var dev in ifaces) {  
	  var alias=0;  
	  ifaces[dev].forEach(function(details){  
		if (details.family=='IPv4') {  
		  //console.log(dev+(alias?':'+alias:''),details.address);  
		  log('url', 'info', "http://"+details.address+":"+prjInfo.port);
		  ++alias;  
		}  
	  });  
	}  

}





module.exports = init;

