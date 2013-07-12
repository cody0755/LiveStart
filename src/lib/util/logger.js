/**
 * Module dependencies.
 */

var toArray = function (enu) {
  var arr = [];

  for (var i = 0, l = enu.length; i < l; i++)
    arr.push(enu[i]);

  return arr;
};

/**
 * Log levels.
 */

var levels = ['error' , 'warn' , 'info' , 'debug'];

/**
 * Colors for log levels.
 */

var colors = [31, 33, 36, 90];

/**
 * Pads the nice output to the longest log level.
 */

function pad (str) {
  var max = 0;

  for (var i = 0, l = levels.length; i < l; i++)
    max = Math.max(max, levels[i].length);

  if (str.length < max)
    return str + new Array(max - str.length + 1).join(' ');

  return str;
}

/**
 * Logger (console).
 *
 * @api public
 */

var Logger = module.exports = function (opts) {
  opts = opts || {};
  this.colors = false !== opts.colors;
  this.level = 3;
  this.enabled = true;
};

/**
 * Log method.
 *
 * @api public
 */

Logger.prototype.log = function (name, type) {

  var index = levels.indexOf(type);
  if (index < 0) index = 2;
  if (index > this.level || !this.enabled)
    return this;

  console.log.apply(console, 
    ['\033[' + colors[index] + 'm[' + pad(name) + ']:\033[39m'].concat(toArray(arguments).slice(2)));

  return this;
};

var _Logger = new Logger();
Logger.log = function(){
  _Logger.log.apply(_Logger, arguments);
};
/**
 * Generate methods.
 */

levels.forEach(function (name) {
  Logger.prototype[name] = function () {
    this.log.apply(this, [name].concat(toArray(arguments)));
  };
});