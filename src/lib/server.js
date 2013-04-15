var connect = require('connect');
var http = require('http');
var app = connect();
var os = require('os');
var exec = require('child_process').exec;
//var jspage = require('./jspage.js');
var jsonHandle = require('./jsonHandle.js');
var config = require('../lib/config.js');
//var project = require('../lib/project.js');
var path = require('path');
//var debug = require('debug')('clam:server');
var ssi = require('./util/ssi.js');
var debug = console.log;
var _ = require('underscore');
        
exports = module.exports = function(popupBrowser) {

    var startTime = new Date();
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
        var path = '/ui' + parse(req).pathname;
        var inst = send(req, path).root(root);
        //.pipe(res);
        inst.stream = path.indexOf("html") == -1 ? inst.stream : function(path, options) {
            var self = this;
            var res = this.res;
            var req = this.req;
            var html = ssi.getHtml(res, path);
            res.removeHeader("Content-Length");
            res.write(html);
            res.end();
        };
        inst.pipe(res);
    })

    http.createServer(app).listen(8001); // 侦听端口
    debug('visit: http://127.0.0.1:8001/ui/create-project.html');
    
	// 输出启动时间
	var startupSecond = ((new Date()).getTime() - startTime.getTime()) / 1000;
    console.log('Preview server started, %s seconds.', startupSecond);
	
	// 如果为true直接弹出窗口
    if(popupBrowser){
        setTimeout(function() {
            var target = 'http://127.0.0.1:8012';
            var callback = null;
            switch (os.platform()) {
                case 'win32':
                    console.log('opening... http://127.0.0.1:8012');
                    exec('start ' + target, callback);
                    break;
                case 'darwin':
                    console.log('opening... http://127.0.0.1:8012');
                    exec('open ' + target, callback);
                    break;
                case 'linux':
                    console.log('opening... http://127.0.0.1:8012');
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

