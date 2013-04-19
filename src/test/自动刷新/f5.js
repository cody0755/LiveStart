if (!window._F5 && !window.frameElement) {
    window._F5 = 'starting';
    var debug = false;

    var trace = debug && window.console ?
        function() {console.log.apply(console, arguments)} :
        function() {};

    function isIE() {
        return navigator && navigator.appName && navigator.appName === 'Microsoft Internet Explorer';
    }

    function getScript(url, success) {
        var head = document.getElementsByTagName("head")[0], done = false;
        var script = document.createElement("script");
        script.src = url;
        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function(){
            if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") ) {
                done = true;

                if (typeof success === 'function') {
                    success();
                }
            }
        };
        head.appendChild(script);
    }


    var ready = (function() {
        // Variables used throughout this script
        var win = window,
            doc = win.document,
            dce = doc.createElement,
            supportAEL = !!doc.addEventListener,
            queue = [],
            exec,
            loaded,
            fallback_onload,
            explorerTimer,
            readyStateTimer,
            isIE = (function() {
                var undef,
                    v = 3,
                    div = doc.createElement('div'),
                    all = div.getElementsByTagName('i');

                while (
                    div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                        all[0]
                    );

                return v > 4 ? v : undef;
            }());

        // Private inner function which is called once DOM is loaded.
        function process() {
            // Let the script know the DOM is loaded
            loaded = true;

            // Cleanup
            if (supportAEL) {
                doc.removeEventListener("DOMContentLoaded", process, false);
            }

            // Move the zero index item from the queue and set 'exec' equal to it
            while ((exec = queue.shift())) {
                // Now execute the current function
                exec();
            }
        }

        return function(fn) {
            // if DOM is already loaded then just execute the specified function
            if (loaded) {
                return fn();
            }

            if (supportAEL) {
                // Any number of listeners can be set for when this event fires,
                // but just know that this event only ever fires once
                doc.addEventListener("DOMContentLoaded", process, false);
            }

            // Internet Explorer versions less than 9 don't support DOMContentLoaded.
            // The doScroll('left') method  by Diego Perini (http://javascript.nwbox.com/IEContentLoaded/) appears to be the most reliable solution.
            // Microsoft documentation explains the reasoning behind this http://msdn.microsoft.com/en-us/library/ms531426.aspx#Component_Initialization
            else if (isIE < 9) {
                explorerTimer = win.setInterval(function() {
                    if (doc.body) {
                        // Check for doScroll success
                        try {
                            dce('div').doScroll('left');
                            win.clearInterval(explorerTimer);
                        } catch(e) {
                            return;
                        }

                        // Process function stack
                        process();
                        return;
                    }
                }, 10);

                // Inner function to check readyState
                function checkReadyState() {
                    if (doc.readyState == 'complete') {
                        // Clean-up
                        doc.detachEvent('onreadystatechange', checkReadyState);
                        win.clearInterval(explorerTimer);
                        win.clearInterval(readyStateTimer);

                        // Process function stack
                        process();
                    }
                }

                // If our page is placed inside an <iframe> by another user then the above doScroll method wont work.
                // As a secondary fallback for Internet Explorer we'll check the readyState property.
                // Be aware that this will fire *just* before the window.onload event so isn't ideal.
                // Also notice that we use IE specific event model (attachEvent) to avoid being overwritten by 3rd party code.
                doc.attachEvent('onreadystatechange', checkReadyState);

                // According to @jdalton: some browsers don't fire an onreadystatechange event, but do update the document.readyState
                // So to workaround the above snippet we'll also poll via setInterval.
                readyStateTimer = win.setInterval(function() {
                    checkReadyState();
                }, 10);
            }

            fallback_onload = function() {
                // Note: calling process() now wont cause any problem for modern browsers.
                // Because the function would have already been called when the DOM was loaded.
                // Meaning the queue of functions have already been executed
                process();

                // Clean-up
                if (supportAEL) {
                    doc.removeEventListener('load', fallback_onload, false);
                } else {
                    doc.detachEvent('onload', fallback_onload);
                }
            };

            // Using DOM1 model event handlers makes the script more secure than DOM0 event handlers.
            // This way we don't have to worry about an already existing window.onload being overwritten as DOM1 model allows multiple handlers per event.
            if (supportAEL) {
                doc.addEventListener('load', fallback_onload, false);
            } else {
                doc.attachEvent('onload', fallback_onload);
            }

            // As the DOM hasn't loaded yet we'll store this function and execute it later
            queue.push(fn);
        };

    }());


    var UrlUtils = {
        urlParseRE: /^(((([^:\/#\?]+:)?(?:\/\/((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?]+)(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,

        parseUrl: function( url ) {
            if ( typeof( url ) === "object" ) {
                return url;
            }

            var u = url || "",
                matches = UrlUtils.urlParseRE.exec( url ),
                results;
            if ( matches ) {
                results = {
                    href:         matches[0] || "",  // http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread#msg-content
                    hrefNoHash:   matches[1] || "",  // http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread
                    hrefNoSearch: matches[2] || "",  // http://jblas:password@mycompany.com:8080/mail/inbox
                    domain:       matches[3] || "",  // http://jblas:password@mycompany.com:8080
                    protocol:     matches[4] || "",  // http:
                    authority:    matches[5] || "",  // jblas:password@mycompany.com:8080, [6] jblas:password
                    username:     matches[7] || "",  // jblas
                    password:     matches[8] || "",  // password
                    host:         matches[9] || "",  // mycompany.com:8080
                    hostname:     matches[10] || "", // mycompany.com
                    port:         matches[11] || "", // 8080
                    pathname:     matches[12] || "", // /mail/inbox
                    directory:    matches[13] || "", // /mail/
                    filename:     matches[14] || "", // inbox
                    search:       matches[15] || "", // ?msg=1234&type=unread
                    hash:         matches[16] || ""  // #msg-content
                };
            }
            return results || {};
        },

        makePathAbsolute: function( relPath, absPath ) {
            if ( relPath && relPath.charAt( 0 ) === "/" ) {
                return relPath;
            }

            relPath = relPath || "";
            absPath = absPath ? absPath.replace( /^\/|(\/[^\/]*|[^\/]+)$/g, "" ) : "";

            var absStack = absPath ? absPath.split( "/" ) : [],
                relStack = relPath.split( "/" );
            for ( var i = 0; i < relStack.length; i++ ) {
                var d = relStack[ i ];
                switch ( d ) {
                    case ".":
                        break;
                    case "..":
                        if ( absStack.length ) {
                            absStack.pop();
                        }
                        break;
                    default:
                        absStack.push( d );
                        break;
                }
            }
            return "/" + absStack.join( "/" );
        },

        isSameDomain: function( absUrl1, absUrl2 ) {
            return UrlUtils.parseUrl( absUrl1 ).domain === UrlUtils.parseUrl( absUrl2 ).domain;
        },

        isRelativeUrl: function( url ) {
            return UrlUtils.parseUrl( url ).protocol === "";
        },

        isAbsoluteUrl: function( url ) {
            return UrlUtils.parseUrl( url ).protocol !== "";
        },

        makeUrlAbsolute: function( relUrl, absUrl ) {
            if ( !UrlUtils.isRelativeUrl( relUrl ) ) {
                return relUrl;
            }

            var relObj = UrlUtils.parseUrl( relUrl ),
                absObj = UrlUtils.parseUrl( absUrl ),
                protocol = relObj.protocol || absObj.protocol,
                authority = relObj.authority || absObj.authority,
                hasPath = relObj.pathname !== "",
                pathname = UrlUtils.makePathAbsolute( relObj.pathname || absObj.filename, absObj.pathname ),
                search = relObj.search || ( !hasPath && absObj.search ) || "",
                hash = relObj.hash;

            return protocol + "//" + authority + pathname + search + hash;
        },

        getFileExt: function(file_path) {
            var i = file_path.lastIndexOf('.');
            var ext;
            if (i >= 0) {
                ext = file_path.substring(i, file_path.length);
                var j = ext.lastIndexOf('?');
                if (j >= 0)
                    ext = ext.substring(0, j);
                return ext.toLowerCase();
            }
            return null;
        }
    };

    var F5 = function (f5RootUrl) {
        var apiUrl = f5RootUrl + '/con/changes';
        var started = false;
        var retryCount = 0, MAX_RETRY = 3;
        var initDataArrived = false;
        var lastChangeTime = 0;
        var $ = jQuery.noConflict();

        jQuery.cookie = function(key, value, options) {

            // key and at least value given, set cookie...
            if (arguments.length > 1 && String(value) !== "[object Object]") {
                options = jQuery.extend({}, options);

                if (value === null || value === undefined) {
                    options.expires = -1;
                }

                if (typeof options.expires === 'number') {
                    var days = options.expires, t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }

                value = String(value);

                return (document.cookie = [
                    encodeURIComponent(key), '=',
                    options.raw ? value : encodeURIComponent(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join(''));
            }

            // key and possibly options given, get cookie...
            options = value || {};
            var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
            return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
        };

        function restoreScrollPosition()
        {
            var y = $.cookie('__F5ScrollY');
            $.cookie('__F5ScrollY', null);
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

        function refresh() {
            var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            $.cookie('__F5ScrollY', y);
            setTimeout(function() {location.reload(true);}, 200); //刷新太快的话，有些动态网页显示的还是未更新前的页面
        }

        function findLINK(url) {
            // url可以是完整的URL或者部分路径
            var href, parts, links, link,
                ret_links=[];
            url = UrlUtils.parseUrl(url);

            links = document.getElementsByTagName('link');
            if (links.length == 0)
                return [];
            for (var i = 0; i < links.length; i ++) {
                link = links[i];
                href = UrlUtils.parseUrl(UrlUtils.makeUrlAbsolute(link.href, location.href));
                if (href.hrefNoSearch == url.hrefNoSearch ||
                    href.pathname == url.pathname ||
                    href.filename == url.filename)
                {
                    ret_links.push(link);
                }
            }
            return ret_links;
        }

        function updateElement(element, prop) {
            var url = UrlUtils.makeUrlAbsolute(element[prop], location.href);
            url = UrlUtils.parseUrl(url).hrefNoSearch + '?' + Math.random();
            element[prop] = url;
        }

        function updateElements(elements, prop) {
            var el;
            for (var i = 0; i < elements.length; i ++) {
                el = elements[i];
                updateElement(el, prop);
            }
        }

        function updateCSS(url) {
            var path_name = UrlUtils.parseUrl(url).pathname;
            var links = findLINK(path_name);
            if (links.length == 0)
                return refresh();
            else
                updateElements(links, 'href');
        }

        function updateLESS(url) {
            var path_name = UrlUtils.parseUrl(url).pathname;
            var links = findLINK(path_name);
            if (links.length == 0) {
                return refresh();
            } else {
                updateElements(links, 'href');
                if (window.less && window.less.refresh)
                    window.less.refresh();
                else
                    refresh();
            }
        }

        function unCacheAllStyles() {
            // 解决IE下面有时候样式文件会缓存而不会重新获取的问题
            var links = document.getElementsByTagName('link');
            if (links) {
                updateElements(links, 'href');
            }
            if (window.less && window.less.refresh)
                window.less.refresh();
        }

        function checkChanges() {
            var args = {'t': lastChangeTime, 'ts': Math.random()};
            $.ajax({
                type: 'GET',
                url: apiUrl,
                data: args,
                dataType: 'script',
                error: function() {
                    if (retryCount < MAX_RETRY) {
                        trace('retry');
                        retryCount += 1;
                        setTimeout(checkChanges, 1);
                    } else {
                        alert('已断开与F5的连接,停止自动刷新');
                    }
                }
            });
        }

        function onChangesData(data) {
            retryCount = 0;
            lastChangeTime = data.t;
            trace( (new Date()).getTime(),' initDataArrived=', initDataArrived, ' t=', data.t, ' ', data.changes);

            setTimeout(checkChanges, 200);
            if (!initDataArrived) {
                initDataArrived = true;
            } else if (data.changes.length > 0) {
                handleChanges(data.changes);
            }

        }

        function handleChanges(changes) {
            var path, ext;
            for (var i=0; i<changes.length; i++){
                path = changes[i][0];
                ext = UrlUtils.getFileExt(path);
                trace(ext);

                if (ext == '.css') {
                    updateCSS(path);
                } else if (ext == '.less') {
                    updateLESS(path);
                } else {
                    refresh();
                }
            }
        }

        function start() {
            if (!started) {
                started = true;
                if (isIE()) unCacheAllStyles();
                restoreScrollPosition();
                checkChanges();
            }
        }

        return {
            start: start,
            status: status,
            onChangesData: onChangesData,
            updateLESS: updateLESS,
            updateCSS: updateCSS,
            findLINK: findLINK
        };
    };


    ready(function(){
        var f5JsPath = '/con/assets/js';
        var scripts = document.getElementsByTagName('script');
        var f5RootUrl;
        for (var i = 0; i < scripts.length; i ++) {
            var script = scripts[i];
            var src = script.src;
            if (src.indexOf(f5JsPath) >= 0) {
                var authority = UrlUtils.parseUrl(src).authority;
                if (authority) {
                    f5RootUrl = 'http://' + authority;
                } else {
                    // 在IETester以外，路径之前的服务器地址会自动由浏览器补充，但是IETester不会补充
                    f5RootUrl = 'http://' + location.host;
                }
                break;
            }
        }
        if (f5RootUrl) {
            getScript(f5RootUrl + '/con/assets/js/jquery.js', function(){
                window._F5 = F5(f5RootUrl);
                window._F5.start();
            });
        }
    });

} // end of if

