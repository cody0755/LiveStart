var generate = function() {},
generate2 = function() {},
all_function = function() {
    var g = "Trgt",
    h = "Ordn",
    f = "Lyr ",
    b = "error",
    n = "unsupported",
    m = "undefined",
    l = "Timeout during reading response from the server",
    k = "css3ps.com",
    c = "\n",
    e = "Illegal argument: ";
    function w(a) {
        if (a >= 55296 && a <= 57343) throw new Error(e + a);
        if (a < 0) throw new Error(e + a);
        if (a <= 127) return 1;
        if (a <= 2047) return 2;
        if (a <= 65535) return 3;
        if (a <= 2097151) return 4;
        if (a <= 67108863) return 5;
        if (a <= 2147483647) return 6;
        throw new Error(e + a);
    }
    function t(a) {
        return a >= 55296 && a <= 56319
    }
    function L(a) {
        return a >= 56320 && a <= 57343
    }
    function P(a, b) {
        if (!t(a)) throw new Error(e + a);
        if (!L(b)) throw new Error(e + b);
        a = (1023 & a) << 10;
        var c = a | 1023 & b;
        return c + 65536
    }
    function N(c) {
        for (var b = 0, a = 0; a < c.length; a++) {
            var d = c.charCodeAt(a);
            if (t(d)) {
                var e = d,
                f = c.charCodeAt(++a);
                b += w(P(e, f))
            } else b += w(d)
        }
        return b
    }
    function v(a) {
        return a == " " || a == "\t" || a == "\r" || a == c
    }
    function x(a) {
        while (a.length && v(a.charAt(0))) a = a.substr(1);
        while (a.length && v(a.charAt(a.length - 1))) a = a.substr(0, a.length - 1);
        return a
    }
    function y(e, f, d, g, i, h) {
        var a = "--" + d + c;
        a += 'Content-Disposition: form-data; name="' + g + '"\n';
        a += "Content-Transfer-Encoding: binary\n";
        a += c;
        a += h;
        a += c;
        a += "--" + d + "--\n";
        var b = "POST http://" + e + f + " HTTP/1.1\n";
        b += "Host: " + e + c;
        b += "Content-Type: multipart/form-data; boundary=" + d + c;
        b += "Content-Length: " + N(a) + "\n\n";
        return b + a
    }
    function F(c) {
        var a = "--boundary",
        b = 0;
        while (c.indexOf(a) >= 0) {
            a += b; ++b
        }
        return a
    }
    function D(b, a) {
        return y(k, "/Handler.ashx?id=" + b, F(a), "xml", "styles.xml", a)
    }
    function G(b) {
        var d = "",
        a = b.read(1);
        while (a != c) {
            if (a == "") throw new Error(l);
            d += a;
            a = b.read(1)
        }
        return d
    }
    function A(d) {
        var b = 0;
        while (true) {
            var a = G(d).toLowerCase();
            if (a == "") {
                if (!b) throw new Error("Failed to read http-headers");
                return b
            }
            if (a.indexOf("content-length") >= 0) {
                var c = a.split(":");
                if (c.length != 2) throw new Error("Incorrect header content-length '" + a + "'");
                b = parseInt(x(c[1]))
            }
        }
    }
    function C(f, e) {
        var a = 0,
        d = "";
        while (a < e) {
            var b = f.read(1);
            if (b == "") throw new Error(l);
            d += b;
            if (b == c)++a; ++a
        }
        return d
    }
    function J(b, e, d) {
        var a = new Socket;
        try {
            if (!a.open(b + ":" + e, "UTF-8")) throw new Error("Failed to open socket with '" + b + "'");
            a.timeout = 30;
            a.write(d);
            var c = A(a);
            return x(C(a, c))
        } catch(f) {
            a.close();
            throw f;
        }
    }
    function S(b, a) {
        return J(k, 80, D(b, a))
    }
    function O(d, c) {
        var b = "css3ps-" + d + ".url",
        a = new File(Folder.temp + "/" + b);
        a.open("w");
        a.writeln("[InternetShortcut]");
        a.writeln("URL=" + c);
        a.writeln();
        a.close();
        a.execute()
    }
    XML.prettyPrinting = false;
    function a(b, c) {
        var a = new XML("<" + b + "></" + b + ">");
        a.appendChild(c);
        return a
    }
    var d = 0;
    function j(b) {
        if (typeof b == m) {++d;
            return new XML("<null></null>")
        }
        if (!b.typename) {++d;
            return a("nulltypename", b)
        }
        if (b.typename == "ActionDescriptor") {++d;
            return z(b)
        }
        if (b.typename == "ActionReference") {++d;
            return p(b)
        }
        if (b.typename == "ActionList") {++d;
            return r(b)
        }
        return a(n, b.typename)
    }
    function I(c, b) {
        var e = "value";
        if (c.getType(b) == DescValueType.INTEGERTYPE) {++d;
            return a(e, c.getInteger(b))
        }
        if (c.getType(b) == DescValueType.STRINGTYPE) {++d;
            return a(e, c.getString(b))
        }
        if (c.getType(b) == DescValueType.DOUBLETYPE) {++d;
            return a(e, c.getDouble(b))
        }
        if (c.getType(b) == DescValueType.BOOLEANTYPE) {++d;
            return a(e, c.getBoolean(b))
        }
        if (c.getType(b) == DescValueType.ENUMERATEDTYPE) {++d;
            return a("type", typeIDToStringID(c.getEnumerationType(b))) + a(e, typeIDToStringID(c.getEnumerationValue(b)))
        }
        if (c.getType(b) == DescValueType.UNITDOUBLE) {++d;
            return a("type", typeIDToStringID(c.getUnitDoubleType(b))) + a(e, c.getUnitDoubleValue(b))
        }
        if (c.getType(b) == DescValueType.LISTTYPE) {++d;
            return r(c.getList(b))
        }
        if (c.getType(b) == DescValueType.OBJECTTYPE) {++d;
            return j(c.getObjectValue(b))
        }
        if (c.getType(b) == DescValueType.REFERENCETYPE) {++d;
            return p(c.getReference(b))
        }
        return a(n, c.getType(b))
    }
    function s(f, a, g) {
        var c = '"></element>',
        b = '<element type="',
        e = f.getType(a),
        d = new XML;
        if (g) d = new XML(b + e + '" id="' + a + c);
        else d = new XML(b + e + '" charid="' + typeIDToCharID(a) + '" stringid="' + typeIDToStringID(a) + c);
        d.appendChild(I(f, a));
        return d
    }
    function p() {
        return new XML("<reference></reference>")
    }
    function r(e) {
        for (var c = new XML("<list></list>"), d = 0; d < e.count; ++d) try {
            c.appendChild(s(e, d, true))
        } catch(f) {
            c.appendChild(a(b, f))
        }
        return c
    }
    function z(d) {
        for (var c = new XML("<descriptor></descriptor>"), e = 0; e < d.count; ++e) try {
            c.appendChild(s(d, d.getKey(e), false))
        } catch(f) {
            c.appendChild(a(b, f))
        }
        return c
    }
    function B() {
        var a = new ActionReference;
        a.putEnumerated(charIDToTypeID(f), charIDToTypeID(h), charIDToTypeID(g));
        var b = executeActionGet(a);
        return j(b)
    }
    function R() {
        try {
            var c = new ActionReference;
            c.putEnumerated(charIDToTypeID("Path"), charIDToTypeID("Path"), stringIDToTypeID("vectorMask"));
            var d = executeActionGet(c);
            return a("path", j(d))
        } catch(e) {
            return a("path", a(b, e))
        }
    }
    function Q() {
        var c = new XML;
        return c
    }
    function E() {
        var a = new ActionDescriptor,
        c = new ActionReference;
        c.putClass(charIDToTypeID("Dcmn"));
        a.putReference(charIDToTypeID("null"), c);
        var b = new ActionReference;
        b.putEnumerated(charIDToTypeID(f), charIDToTypeID(h), charIDToTypeID(g));
        a.putReference(charIDToTypeID("Usng"), b);
        executeAction(charIDToTypeID("Mk  "), a, DialogModes.NO)
    }
    function q() {
        var a = new ActionDescriptor;
        a.putEnumerated(charIDToTypeID("Svng"), charIDToTypeID("YsN "), charIDToTypeID("N   "));
        executeAction(charIDToTypeID("Cls "), a, DialogModes.NO)
    }
    function K() {
        try {
            var a = new ActionReference;
            a.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("gblA"));
            a.putEnumerated(charIDToTypeID(f), charIDToTypeID(h), charIDToTypeID(g));
            var b = executeActionGet(a);
            return b.getInteger(charIDToTypeID("gblA"))
        } catch(c) {}
        return undefined
    }
    function M(c) {
        if (typeof c == m) return;
        try {
            var a = new ActionDescriptor,
            b = new ActionReference;
            b.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Lefx"));
            b.putEnumerated(charIDToTypeID(f), charIDToTypeID(h), charIDToTypeID(g));
            a.putReference(charIDToTypeID("null"), b);
            var d = new ActionDescriptor;
            d.putUnitDouble(charIDToTypeID("gagl"), charIDToTypeID("#Ang"), c);
            a.putObject(charIDToTypeID("T   "), charIDToTypeID("Lefx"), d);
            executeAction(charIDToTypeID("setd"), a, DialogModes.NO)
        } catch(e) {}
    }
    function u(h, e, c, g) {
        for (var f = 0; f < h.length; f++) try {
            var d = h[f];
            if (d.typename == "LayerSet") u(d.layers, e, c, g);
            else {
                app.activeDocument.activeLayer = d;
                M(g);
                var i = B(),
                j = R();
                e.appendChild(a("layer", i + j));
            }
        } catch(k) {
            e.appendChild(a("layer", a(b, k)))
        }
    }
    function H(b, d) {
        var c = new XML("<layers></layers>");
        u(app.activeDocument.layers, c, b, d);
        return c
    }
    function o() {
        var e = Q(),
        c = new XML;
        var f = K();
        E();
        var d = new XML;
        try {
            d = H(c, f);
            q()
        } catch(g) {
            d.appendChild(a(b, g));
            q()
        }
        return a("data", e + d).toXMLString()
    }
    function i() {
        return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1)
    }
    function T() {
        return i() + i() + "-" + i() + "-" + i() + "-" + i() + "-" + i() + i() + i()
    }
    
    // Remove header lines from HTTP response
    function removeHeaders(binary){
          var bContinue = true ; // flag for finding end of header
          var line = "";
          var nFirst = 0;
          var count = 0;
          while (bContinue) {
          line = getLine(binary) ; // each header line
          bContinue = line.length >= 2 ; // blank header == end of header
          nFirst = line.length + 1 ;
          binary = binary.substr(nFirst) ;
          }
          return binary;
    }


    // Get a response line from the HTML
    function getLine(html){
          var line = "" ;
          for (var i = 0; html.charCodeAt(i) != 10; i++){ // finding line end
          line += html[i] ;
          }
          return line ;
    }
    
    // 发送至服务器
    function getSevies(filePath){
        var socket = new Socket;
        var domain = "127.0.0.1";
        var port = 80;
        var page = "/ps2css/index.php/index/ps";
        
        if (socket.open(domain + ":" + port, "binary")){
              socket.write("GET http://" + domain + page + "?filepath=" + filePath +
        " HTTP/1.0\n\n"); // get the file
              var binary = socket.read(9999999);
              binary = removeHeaders(binary);
              alert(binary);
              if(binary == "ok"){
                    OpenBrowser();
                }
              //alert(binary);
            socket.close();
        }
    }
    
    // 打开浏览器
    function OpenBrowser() {
        var filename = "ps2url.url",
        url = "127.0.0.1/ps2css/index.php/index/show",
        file = new File(Folder.temp + "/" + filename);
        file.open("w");
        file.writeln("[InternetShortcut]");
        file.writeln("URL=" + url);
        file.writeln();
        file.close();
        file.execute()
    }

    generate = function() {
        var a = "</string></property></object>";
        try {
            var b = o();
            return '<object><property id="styles"><string>' + b + a
        } catch(c) {
            return '<object><property id="error"><string>' + c + a
        }
    };
    generate2 = function() {
        try {
            var a = T();
            //O(a, "http://css3ps.com/?=" + a);
            var b = o();
            /* 写入文件里 */
            var stylefile = "C:/style.xml";
            var file = new File(stylefile);
            file.open("w");
            file.writeln(b);
            file.close();
            //file.execute();
            // 往服务器发文件地址
            //getSevies(stylefile);
            /* 写入文件里 end */
            //S(a, b)
        } catch(c) {
            alert("Error occurred:\n" + c)
        }
    };

};
all_function();
generate2();