(function(){

    var socket = io.connect(location.hostname);
    var pathname = location.pathname;   // a prefix
    var allAttachers,
        oldload = window.onload;

    var getFileAttachers = function(){

        // 获取样式与脚本
        var scripts = document.getElementsByTagName("script"),
            links = document.getElementsByTagName("link"),
            imgs = document.getElementsByTagName("img"),
            uris = [];


        // 处理脚本
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i], src = script.getAttribute("src");
            if (src && isLocal(src)){
                uris.push({
                    element:script,
                    file:  decodeURIComponent(src)
                })
            }

        }

        // 处理样式
        for (var j = 0; j < links.length; j++) {
            var link = links[j], rel = link.getAttribute("rel"), href = link.getAttribute("href", 2);
            if (href && rel && rel.match(new RegExp("stylesheet", "i")) && isLocal(href)) {
                uris.push({
                    element:link,
                    file:  decodeURIComponent(href)
                })
            }
        }

        // 处理图片
        for (var k = 0; k < imgs.length; k++) {
            var img = imgs[k], src = img.getAttribute("src");
            if (src && isLocal(src)){
                uris.push({
                    element:img,
                    file:  decodeURIComponent(src)
                })
            }
        }

        return uris.unique();

    };

    var reloadTag = function( attcher ){
        var element = attcher.element;
        //console.log( 'reloading ...' );
        if( !!element.href ){
            var href = element.href;
            element.href = href;
            return;         // done;
        } else {
            if(element.tagName==='SCRIPT'){
                var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                F5cookie.set('__liveStartScrollY', y);
                setTimeout(function() {location.reload(true);}, 200); //刷新太快的话，有些动态网页显示的还是未更新前的页面
            }else{
                var src = element.src;
                element.src = src;
            }
        }
    };

    window.onload = function(){

        // 更新滚动位置
        restoreScrollPosition();

        allAttachers = getFileAttachers();

        socket.on('reload', function ($data) {
			
            pathname = decodeURIComponent( pathname );
			//if( pathname === $data.slice(1) ){ 
            if( pathname === $data ){       // type of $data is ./foo/bar/file.html
                var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                F5cookie.set('__liveStartScrollY', y);
                setTimeout(function() {location.reload(true);}, 200); //刷新太快的话，有些动态网页显示的还是未更新前的页面
            } else {
                for(var i = 0; i < allAttachers.length; ++i){
                    //var url = location.protocol + "//" + location.host+"/" + $data.slice(1);
                    var urlArr = $data.split("/");
                    urlArr.shift();
                    //var url = $data.slice(4);
                    var url = urlArr.join("/");
                    if(url == allAttachers[i].file) {
                        //console.log( "log:file", allAttachers.file );
                        reloadTag( allAttachers[i] );
                    }
                }
            }
        });


        // 执行原来的onload()
        if(typeof oldload === "function"){
            oldload();
        }

    };


    // 修正滚动条位置
    function restoreScrollPosition()
    {
        var y = F5cookie.get('__liveStartScrollY');
        F5cookie.set('__liveStartScrollY', null);
        if (!y) return;

        if (window.pageYOffset != null)
            window.pageYOffset = y;
        if (document.documentElement.scrollTop != null)
            document.documentElement.scrollTop = y;
        if (window.pageYOffset != null)
            window.pageYOffset = y;
        if (document.body.scrollTop != null)
            document.body.scrollTop = y
    }

    // 检查是否本地的文件
    function isLocal(url) {
        var loc = document.location,
            reg = new RegExp("^\\.|^\/(?!\/)|^[\\w]((?!://).)*$|" + loc.protocol + "//" + loc.host);
        //console.log(url,reg)
        return url.match(reg);
    }

    // 数组去重
    Array.prototype.unique = function()
    {
        var n = {},r=[]; //n为hash表，r为临时数组
        for(var i = 0; i < this.length; i++) //遍历当前数组
        {
            var tempThis = this[i].file;
            if(!n[tempThis]) { //如果hash表中没有当前项
                n[tempThis] = true; //存入hash表
                r.push(this[i]); //把当前数组的当前项push到临时数组里面
            }
        }
        return r;
    };


})();

// Copyright (c) 2012 Florian H., https://github.com/js-coder https://github.com/js-coder/cookie.js

!function (document, undefined) {

    var cookie = function () {
        return cookie.get.apply(cookie, arguments);
    };

    var utils = cookie.utils =  {

        // Is the given value an array? Use ES5 Array.isArray if it's available.
        isArray: Array.isArray || function (value) {
            return Object.prototype.toString.call(value) === '[object Array]';
        },

        // Is the given value a plain object / an object whose constructor is `Object`?
        isPlainObject: function (value) {
            return !!value && Object.prototype.toString.call(value) === '[object Object]';
        },

        // Convert an array-like object to an array – for example `arguments`.
        toArray: function (value) {
            return Array.prototype.slice.call(value);
        },

        // Get the keys of an object. Use ES5 Object.keys if it's available.
        getKeys: Object.keys || function (obj) {
            var keys = [],
                key = '';
            for (key in obj) {
                if (obj.hasOwnProperty(key)) keys.push(key);
            }
            return keys;
        },

        // Unlike JavaScript's built-in escape functions, this method
        // only escapes characters that are not allowed in cookies.
        escape: function (value) {
            return String(value).replace(/[,;"\\=\s%]/g, function (character) {
                return encodeURIComponent(character);
            });
        },

        // Return fallback if the value is not defined, otherwise return value.
        retrieve: function (value, fallback) {
            return value == null ? fallback : value;
        }

    };

    cookie.defaults = {};

    cookie.expiresMultiplier = 60 * 60 * 24;

    cookie.set = function (key, value, options) {

        if (utils.isPlainObject(key)) { // Then `key` contains an object with keys and values for cookies, `value` contains the options object.


            for (var k in key) { // TODO: `k` really sucks as a variable name, but I didn't come up with a better one yet.
                if (key.hasOwnProperty(k)) this.set(k, key[k], value);
            }

        } else {

            options = utils.isPlainObject(options) ? options : { expires: options };

            var expires = options.expires !== undefined ? options.expires : (this.defaults.expires || ''), // Empty string for session cookies.
                expiresType = typeof(expires);

            if (expiresType === 'string' && expires !== '') expires = new Date(expires);
            else if (expiresType === 'number') expires = new Date(+new Date + 1000 * this.expiresMultiplier * expires); // This is needed because IE does not support the `max-age` cookie attribute.

            if (expires !== '' && 'toGMTString' in expires) expires = ';expires=' + expires.toGMTString();

            var path = options.path || this.defaults.path; // TODO: Too much code for a simple feature.
            path = path ? ';path=' + path : '';

            var domain = options.domain || this.defaults.domain;
            domain = domain ? ';domain=' + domain : '';

            var secure = options.secure || this.defaults.secure ? ';secure' : '';

            document.cookie = utils.escape(key) + '=' + utils.escape(value) + expires + path + domain + secure;

        }

        return this; // Return the `cookie` object to make chaining possible.

    };

    // TODO: This is commented out, because I didn't come up with a better method name yet. Any ideas?
    // cookie.setIfItDoesNotExist = function (key, value, options) {
    //	if (this.get(key) === undefined) this.set.call(this, arguments);
    // },

    cookie.remove = function (keys) {

        keys = utils.isArray(keys) ? keys : utils.toArray(arguments);

        for (var i = 0, l = keys.length; i < l; i++) {
            this.set(keys[i], '', -1);
        }

        return this; // Return the `cookie` object to make chaining possible.
    };

    cookie.empty = function () {

        return this.remove(utils.getKeys(this.all()));

    };

    cookie.get = function (keys, fallback) {

        fallback = fallback || undefined;
        var cookies = this.all();

        if (utils.isArray(keys)) {

            var result = {};

            for (var i = 0, l = keys.length; i < l; i++) {
                var value = keys[i];
                result[value] = utils.retrieve(cookies[value], fallback);
            }

            return result;

        } else return utils.retrieve(cookies[keys], fallback);

    };

    cookie.all = function () {

        if (document.cookie === '') return {};

        var cookies = document.cookie.split('; '),
            result = {};

        for (var i = 0, l = cookies.length; i < l; i++) {
            var item = cookies[i].split('=');
            result[decodeURIComponent(item[0])] = decodeURIComponent(item[1]);
        }

        return result;

    };

    cookie.enabled = function () {

        if (navigator.cookieEnabled) return true;

        var ret = cookie.set('_', '_').get('_') === '_';
        cookie.remove('_');
        return ret;

    };

    // If an AMD loader is present use AMD.
    // If a CommonJS loader is present use CommonJS.
    // Otherwise assign the `cookie` object to the global scope.

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return F5cookie;
        });
    } else if (typeof exports !== 'undefined') {
        exports.F5cookie = cookie;
    } else window.F5cookie = cookie;

}(document);
