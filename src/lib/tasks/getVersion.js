#!/usr/bin/env node

var fs = require('fs'),
    http = require("https"),
    EventEmitter = require('events').EventEmitter,
    EVENT = new EventEmitter();

function getVersion(cb){
  http.get({
    host: 'raw.github.com',
    method: 'GET',
    port: 443,
    path: '/shepherdwind/plum/master/package.json'
  }, function(ret){
    var rets = '';
    ret.on('data', function(data){
      rets += data.toString();
    });
    ret.on('end', function(){
      cb(JSON.parse(rets));
    });
  }).on('error', function(e){
    console.log(e);
  });
}

var red   = '\u001b[31m',
    reset = '\u001b[0m';

function run(callback,data){
    fs.readFile( __dirname + '/../../package.json', 'utf-8', function(err, json){
      if (err) console.log(err);
      var config = JSON.parse(json);
      console.log('Welcome to Livestart v' + config.version + 
        ', server is running.\nPress key ctrl and c to quit!');

      getVersion(function(json){

        var version = json.version;

        if (version > config.version){

          console.log();
          console.log( red + 
            'the newest version is ' + version + ', pleace update !!' + reset);

          if (!json.updates) return;

          console.log('更新信息：');
          console.log();
          Object.keys(json.updates).forEach(function(v){
            if (v > config.version) {
              var updateInfo = json.updates[v];
              console.log("Version " + v + ":");
              updateInfo.forEach(function(info, i){
                console.log('  ' + (i + 1) + '. '+ info);
              });
              console.log();
            }
          });

        }
        
      });
      
    });
}

function on(evtName, fn){
    return EVENT.on(evtName, fn);
}

exports.on = on;
exports.run = run;
