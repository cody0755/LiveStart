
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
        // 读取样式文件
        fs.readFile('C:/style.xml','utf-8',function(err,data){
            if(err){
                console.error(err)
            }else {
                // 转成JSON格式
                parser.parseString(data,function(err,result){
                    // 实例样式处理类
                    var cssParse = new CssParse({
                        layers: result.data.layers
                    });
                    // 生成样式
                    cssParse.toCss();
                });
            }
        });
        res.render('css',{ title: 'LiveStart' });
    });
    
    return app.router;
};