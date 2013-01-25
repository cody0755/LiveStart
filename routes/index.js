
/*
 * Routers.
 */
 
var fs = require('fs'),
    xml2js = require('xml2js'),
    CssParse = require('../models/cssParse.js');

module.exports = function(app){
    // 首页
    app.get("/",function(req,res){
        res.render('index',{ title: 'LiveStart' });
    });
    
    // CSS显示
    app.get("/css",function(req,res){
        var parser = new xml2js.Parser();
        fs.readFile('C:/style.xml','utf-8',function(err,data){
            if(err){
                console.error(err)
            }else {
                parser.parseString(data,function(err,result){
                    var cssParse = new CssParse({
                        layers: result.data.layers
                    });
                    console.dir(cssParse.toCss());
                });
            }
        });
        res.render('css',{ title: 'LiveStart' });
    });
    
    return app.router;
};