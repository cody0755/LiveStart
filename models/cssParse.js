
/**
 * CSS¥¶¿Ì.
 */

function CssParse(){
    this.layers = {};
    this.cssModel = [];
}

module.exports = CssParse;

CssParse.prototype.toCss = function toCss(){
    var csstext = {};
    
    for(var i=0; i< this.layers.length; i++){
        csstext = this.layers;
    }
    
    return csstext;
};