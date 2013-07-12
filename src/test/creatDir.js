#!/usr/bin/env node

var EventEmitter = require('events').EventEmitter,
    EVENT = new EventEmitter();
    
function run(callback,data){
    var a = "1";
    
    console.log(data);
    callback(a);
    EVENT.emit('taskEnd');
}

function on(evtName, fn){
    return EVENT.on(evtName, fn);
}

exports.on = on;
exports.run = run;
