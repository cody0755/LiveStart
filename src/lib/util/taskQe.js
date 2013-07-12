/* 
  @Author:thewei
  @website:http://www.99is.com
  @title: 异步事件任务队列类
*/
var EventEmitter = require('events').EventEmitter,
    EVENT = new EventEmitter();

function TaskQe(){
    this._arrayFn = [];   //事件集合
    this._callback = {};  //最终回调
    this._backdata = [];  // 返回数据集合
    this._isParallel = false;  // 是否并行，默认否
    
    return exports.TaskQe;
};

// 加入队列
TaskQe.prototype.add = function(fn){
    var fn = require(__dirname +'/../tasks/'+fn+".js");
    this._arrayFn.push(fn);
    return this;
};

// 队列数目
TaskQe.prototype.size = function(){
    return this._arrayFn.length;
};

// 获取返回数据集合
TaskQe.prototype.getCallBack = function(){
    return this._backdata;
};

// 依次运行队列
TaskQe.prototype.next = function(data){

    var fn = this.getNext(),
        _this = this,
        on;
    
    //console.log(data);
    
    // 返回总回调
    if(!this.size() && !fn) {
        if(typeof this._callback === "function") {
            (data)?this._callback(data):this._callback();
        }
    }
    
    on = fn.on;
    fn = fn.run;
    
    // 并行 or 串行
    (this._isParallel)?((fn)&&fn()):((fn)&&((data)?fn(function(data){on("taskEnd",function(){ _this.next(); });},data):fn(function(data){on("taskEnd",function(){ _this.next(); });},{})));
    
    // 集合返回数据
    (data)?this._backdata.push(data):this._backdata.push(false);
    
    
    
    return this;
};

// 队列执行
TaskQe.prototype.getNext = function(){
    if(this.size()){
        return this._arrayFn.shift();
    }
    return false;
}

// 初始化，完成后执行,第一个参数是否并行，第二个参数返回
TaskQe.prototype.run = function(){
    if(arguments.length === 1 ){
        this._callback = (typeof arguments[0] === "function")?arguments[0]:{};
        this._isParallel = (typeof arguments[0] === "boolean")?arguments[0]:false;
    }      
    if(arguments.length === 2 ){
        this._callback = (typeof arguments[1] === "function")?arguments[1]:{};
        this._isParallel = (typeof arguments[0] === "boolean")?arguments[0]:false;
    } 
    var firstFn = this.getNext(),
        _this = this;
     
    firstFn.run(function(data){
        firstFn.on("taskEnd",function(){
            _this.next(data);
        });
    },{});
    
    return this;
};

module.exports = TaskQe;
 
	
