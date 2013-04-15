/**
 * CSS处理.
 */

function CssParse(data) {
    this.layers = data.layers || {};
    this.cssModel = [];
    this.cssTempModel = [];
}

// 接口
module.exports = CssParse;

/*
 *	处理图层
 */
CssParse.prototype.getLayerInfo = function () {
    // 遍历图层
    var layers = this.layers[0].layer;
    for (var i = 0; i < layers.length; i++) {

        var layer = layers[i], // 单个图层
            descriptor = layer.descriptor,
            descriptor_element = descriptor[0].element;

        this.cssModel[i] = this.loopElement(descriptor_element); //图层信息

    }

    return this.cssModel;
};

/*
 *	处理CSS
 */
CssParse.prototype.toCss = function () {

    var csstext = "",
        cssArray = [],
        layerinfo = this.getLayerInfo();

    //生成样式
    if (this.cssModel["visible"] == "true") {

        // 如果开启了颜色填充，则采用颜色填充的颜色
        if (this.cssModel["layerFXVisible"] && this.cssModel["layerFX_solidFill"]) {
            //var cssColor = this.cssModel["layerFX_solidFill"]["color"]["hexValue"];
        } else {
            //var cssColor = this.cssModel["background-color"]["hexValue"];
        }

        //
        if (this.cssModel["layerFXVisible"] && this.cssModel["layerFX_frameFX"]) {
            var cssBorder = this.cssModel["layerFX_frameFX"]["size"] + "px solid " + this.cssModel["layerFX_frameFX"]["color"]["hexValue"] + ";";
        } else {
            var cssBorder = "";
        }


        var cssBox = [],
            cssWidth = "width:" + this.cssModel["width"] + "px;", // 宽
            cssHeight = "height:" + this.cssModel["height"] + "px;", // 高
        //cssBackgroundColor = "background-color:"+cssColor+";",  // 背景色
            cssOpacity = "opacity:" + (this.cssModel["opacity"] / 255).toFixed(2) + ";", // 不透明度
            cssClassName = "." + this.cssModel["name"]; // 类名

        //cssBox.push(cssWidth); // 用数组存储样式

        csstext = cssClassName + "{";
        csstext += cssWidth;
        csstext += cssHeight;
        csstext += cssBorder;
        if ((this.cssModel["opacity"] / 255).toFixed(2) != 1.00) {
            csstext += cssOpacity;
        }
        //csstext += cssBackgroundColor;
        csstext += "}";
        console.log(csstext);
        cssArray[i] = csstext;
    }

    return cssArray;

};


// 处理十六进制颜色
CssParse.prototype.parseColor = function (red, green, blue) {
    var hR = Math.round(red).toString(16),
        hG = Math.round(green).toString(16),
        hB = Math.round(blue).toString(16);
    return "#" + (red < 16 ? ("0" + hR) : hR) + (green < 16 ? ("0" + hG) : hG) + (blue < 16 ? ("0" + hB) : hB);
};

/*
 * 遍历属性方法
 */
CssParse.prototype.loopElement = function (data) {
    this.cssTempModel = [];
    this.loopList(data);
    return this.cssTempModel;

};

CssParse.prototype.loopList = function (data, array) {
    if (data) {
        for (var i = 0; i < data.length; i++) {
            if (typeof array == "undefined") {
                var oneArray = this.loopOne(data[i]);
            } else {
                var oneArray = this.loopOne(data[i], array);
            }

            if (oneArray) {
                for (var k in oneArray) {
                    if (typeof array == "undefined") {
                        this.cssTempModel[k] = oneArray[k];
                    } else {
                        array[k] = oneArray[k];
                    }
                }
            }
        }
    }
};

CssParse.prototype.loopOne = function (data, array) {
    var oneArray = [],
        newArray = ( array = array || this.cssTempModel);
    // 处理数据列表
    if (typeof data.list != "undefined") {
        if (typeof data.list[0].element != "undefined") {
            if (typeof data.$.stringid != "undefined") {
                newArray = array[data.$.stringid] = [];
            } else if (typeof data.$.id != "undefined") {
                newArray = array[data.$.id] = [];
            }
            this.loopList(data.list[0].element, newArray);
        }
        return null;
    }
    // 处理数据组
    if (typeof data.descriptor != "undefined") {
        if (typeof data.descriptor[0].element != "undefined") {
            if (typeof data.$.stringid != "undefined") {
                newArray = array[data.$.stringid] = [];
            } else if (typeof data.$.id != "undefined") {
                newArray = array[data.$.id] = [];
            }
            this.loopList(data.descriptor[0].element, newArray);

        }
        return null;
    }
    // 如果只有一层
    if (typeof data.value != "undefined") {
        if (typeof data.$.stringid != "undefined") {
            oneArray[data.$.stringid] = data.value;
            return oneArray;
        } else if (typeof data.$.id != "undefined") {
            oneArray[data.$.id] = data.value
            return oneArray;
        }
    }
}