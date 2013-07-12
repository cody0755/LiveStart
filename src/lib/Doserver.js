var URL         = require('url'),
    log         = require('./util/logger').log,
	querystring = require("querystring"),
    Context     = require("./DoContext");

function DoServer(request, response){
    this.req = request;
    this.res = response;
    this.init();
}

DoServer.prototype = {
    init:function(){
        var req = this.req,
            res = this.res;

        this.router(req.url);
    },
    router:function(requestUrl){
        // /livestartAction/controller/action/parameter1/parameter2
        // 匹配livestartAction路由方起作用，其它的走静态服务器路线
        var req = this.req,
            res = this.res,
            pathname = URL.parse(requestUrl).pathname;

        var thispath = pathname.split("/");
        thispath.shift(); // Remove the first "/"

        var routeInfo= {
            controller: thispath[1] || "index",
            action: thispath[2] || "index",
            args: thispath.slice(3) || []
        };
        var controller;

        try{
            var method = req.method.toLowerCase() || 'get';
            controller = require('./controllers/' + routeInfo.controller);
            var action = controller[method] ? controller[method][routeInfo.action] : null;
            if (action) {
                var context = new Context(req,res,this);
                this.get();
                this.post();
                req.on("end", function () {
                    action.apply(context, routeInfo.args);
                });
            } else {
                this.handler500('Error: Controller "' + routeInfo.controller + '" without action "' + routeInfo.action + '" for "' + req.method + '" request.');
            }
        }catch(e){
            log("error","error",e);
            this.handler500('Error: Controller "' + routeInfo.controller + '" dosen\'t exsit.');
        }


    },
    get:function(){
        var req = this.req,
            res = this.res,
            _urlMap;

        req.get = function(key){
            if(!_urlMap){
                _urlMap = URL.parse(req.url,true);
            }
            if(key){
                return _urlMap.query[key];
            }else{
                return _urlMap;
            }
        }

    },
    post:function(){
        var req = this.req,
            res = this.res;

        var _postData = '',
            _postMap = '';
        req.on('data', function (data) {
            _postData += data;
        });
        req.on('end', function () {
            req.postData = _postData;
            req.post = function(key){
                if(!_postMap){
                    _postMap = querystring.parse(_postData);
                }

                if(key){
                    return _postMap[key];
                } else {
                    return _postMap;
                }
            };

        });
    },
    handler500:function (err) {
        var req = this.req,
            res = this.res;
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(err);
    }
};

exports = module.exports = DoServer;