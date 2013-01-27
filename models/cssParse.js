/**
 * CSS处理.
 */

function CssParse(data){
    this.layers = data.layers || {};
    this.cssModel = [];
    this.cssTempModel = [];
}

// 接口
module.exports = CssParse;

// 处理十六进制颜色
CssParse.prototype.parseColor = function(red,green,blue){
	var hR=Math.round(red).toString(16),
		hG=Math.round(green).toString(16),
		hB=Math.round(blue).toString(16); 
	return "#"+(red<16?("0"+hR):hR)+(green<16?("0"+hG):hG)+(blue<16?("0"+hB):hB);
};

// 遍历属性方法
CssParse.prototype.loopList = function(data,array){
	if(data){
		for (var i =  0; i < data.length ; i++) {
			if(typeof array == "undefined"){
				var oneArray = this.loopOne(data[i]);
			}else {
				var oneArray = this.loopOne(data[i],array);
			}
			
			if(oneArray) {
				for(var k in oneArray){
					if(typeof array == "undefined"){
						this.cssTempModel[k] = oneArray[k];
					}else {
						array[k] = oneArray[k];
					}
				}
			}
		};
	};
};

CssParse.prototype.loopElement = function(data){
	this.cssTempModel = [];
	this.loopList(data);
	return this.cssTempModel;

};

CssParse.prototype.loopOne = function(data,array){
	var oneArray = [],
		newArray = ( array = array || this.cssTempModel);
	// 处理数据列表
	if(typeof data.list != "undefined"){
		if(typeof data.list[0].element != "undefined"){
			if(typeof data.$.stringid != "undefined"){
				newArray = array[data.$.stringid] = [];
			}else if(typeof data.$.id != "undefined"){
				newArray = array[data.$.id] = [];
			};
			this.loopList(data.list[0].element,newArray);
		}
		return null;
	}
	// 处理数据组
	if(typeof data.descriptor != "undefined"){
		if(typeof data.descriptor[0].element != "undefined"){
			if(typeof data.$.stringid != "undefined"){
				newArray = array[data.$.stringid] = [];
			}else if(typeof data.$.id != "undefined"){
				newArray = array[data.$.id] = [];
			};
			this.loopList(data.descriptor[0].element,newArray);
			
		}
		return null;
	}
	// 如果只有一层
	if(typeof data.value != "undefined"){
		if(typeof data.$.stringid != "undefined"){
			oneArray[data.$.stringid] = data.value;
			return oneArray;
		}else if(typeof data.$.id != "undefined") {
			oneArray[data.$.id] = data.value
			return oneArray;
		}
	};
}


/*
	处理CSS
*/
CssParse.prototype.toCss = function(){



    var csstext = "",
    	cssArray = [];
    

    // 遍历图层
    for(var i=0; i< this.layers.length; i++){

        var layer = this.layers[i].layer[0], // 单个图层
        	descriptor = layer.descriptor,
        	descriptor_element = descriptor[0].element,
        	path = layer.path;

        // 遍历图层属性
        for(var k=0; k<descriptor_element.length; k++){
     	   	var element = descriptor_element[k],
     	   		layer_attr_name = element.$.stringid;

        	switch(layer_attr_name){
        		// 图层ID
        		case "layerID": this.cssModel["layerID"] = element.value;
        						break;
        		// 图层名称
        		case "name": this.cssModel["name"] = element.value;
        					 break;
        		// 定位
        		case "bounds": this.cssModel["position"] = [];
        					   this.cssModel["position"]["top"] = element.descriptor[0].element[0].value;
        					   this.cssModel["position"]["left"] = element.descriptor[0].element[1].value;
        					   this.cssModel["position"]["bottom"] = element.descriptor[0].element[2].value;
        					   this.cssModel["position"]["right"] = element.descriptor[0].element[3].value;
        					   this.cssModel["width"] = element.descriptor[0].element[3].value-element.descriptor[0].element[1].value;
        					   this.cssModel["height"] = element.descriptor[0].element[2].value-element.descriptor[0].element[0].value;
        					   break;
        	    // 是否可见
        		case "visible": this.cssModel["visible"] = element.value;
        						break;
        		// 不透明度
        		case "opacity": this.cssModel["opacity"] = element.value;
        						break;
        		// 是否图层组
        		case "group": this.cssModel["group"] = element.value;
        					  break;
        		// 填充百分比
        		case "fillOpacity": this.cssModel["fillOpacity"] = element.value;
        							break;
        		// 填充颜色
        		case "adjustment": this.cssModel["background-color"] = [];
        						   var background_color_element = element.list[0].element[0].descriptor[0].element[0];
        						   if(background_color_element.$.stringid=="color"){
        						   		this.cssModel["background-color"]["red"] = Math.round(background_color_element.descriptor[0].element[0].value);
        						   		this.cssModel["background-color"]["green"] = Math.round(background_color_element.descriptor[0].element[1].value);
        						   		this.cssModel["background-color"]["blue"] = Math.round(background_color_element.descriptor[0].element[2].value);
        						   		this.cssModel["background-color"]["hexValue"] = this.parseColor(background_color_element.descriptor[0].element[0].value,background_color_element.descriptor[0].element[1].value,background_color_element.descriptor[0].element[2].value);
        						   };
        							break;
        		// 图层样式是否可见
        		case "layerFXVisible": this.cssModel["layerFXVisible"] = element.value;
        							   break;
        		// 文本信息
        		/*
        		case "textKey": var textKeyData = element.descriptor[0].element;
        						this.cssModel["textKey"] = [];
        						for(var j=0; j<textKeyData.length; j++){
        							if(typeof textKeyData[j].value != "undefined"){
        								this.cssModel["textKey"][textKeyData[j].$.stringid] = textKeyData[j].value;
        							}else if(typeof textKeyData[j].descriptor != "undefined"){
        								this.cssModel["textKey"][textKeyData[j].$.stringid] = [];
        								var a1 = textKeyData[j].descriptor[0].element;
        								for(var y=0; y< a1.length; y++){
        									this.cssModel["textKey"][textKeyData[j].$.stringid][a1[y].$.stringid] = a1[y].value;
        								};
        							}else if(typeof textKeyData[j].list != "undefined"){
        								this.cssModel["textKey"][textKeyData[j].$.stringid] = [];
        								if(typeof textKeyData[j].list[0].element == "object") {
        									var a2 = textKeyData[j].list[0].element;
	        								for(var y=0; y< a2.length; y++){
	        									this.cssModel["textKey"][textKeyData[j].$.stringid][a2[y].$.id] = [];
	        									if(typeof a2[y].descriptor[0].element == "object") {
	        										var a3 = textKeyData[j].list[0].element[y].descriptor[0].element;
	        										for(var a=0; a< a3.length; a++){
	        											if(typeof a3[a].value != "undefined"){
	        												this.cssModel["textKey"][textKeyData[j].$.stringid][a2[y].$.id][a3[a].$.stringid] = a3[a].value;
	        											}else {
	        												this.cssModel["textKey"][textKeyData[j].$.stringid][a2[y].$.id][a3[a].$.stringid]=[];
	        												var a4 = textKeyData[j].list[0].element[y].descriptor[0].element[a].descriptor[0].element;
	        												for(var b=0; b< a4.length; b++){
	        													if(typeof a4[b].value != "undefined"){
	        														this.cssModel["textKey"][textKeyData[j].$.stringid][a2[y].$.id][a3[a].$.stringid][a4[b].$.stringid] = a4[b].value;
	        													}else {
	        														this.cssModel["textKey"][textKeyData[j].$.stringid][a2[y].$.id][a3[a].$.stringid][a4[b].$.stringid] = []
	        														for(var c=0; c<a4[b].descriptor[0].element.length; c++){
	        															this.cssModel["textKey"][textKeyData[j].$.stringid][a2[y].$.id][a3[a].$.stringid][a4[b].$.stringid][a4[b].descriptor[0].element[c].$.stringid] = a4[b].descriptor[0].element[c].value;
	        														}
	        													}
	        												}
	        											}
		        									};
	        									}
	        								}
        								}
        							};
        						};
        						break;
        		*/
        		case "textKey": var textKeyData = element.descriptor[0].element;
        						this.cssModel["text"] = [];
        						this.cssModel["text"] = this.loopElement(textKeyData);
        						break;
				// 图层样式
				case "layerEffects": var layerEffects =  element.descriptor[0].element;
									 this.cssModel["layerFX"] = [];
									 for(var j=0; j<layerEffects.length; j++){

									 	var effectName = layerEffects[j].$.stringid;

									 	if(effectName == "scale"){
									 		this.cssModel["layerFX"][effectName]=layerEffects[j].value;
									 	}else {
									 		var effectData = layerEffects[j].descriptor[0].element;
									 		this.cssModel["layerFX"][effectName]=[];
									 		for(var y=0; y< effectData.length; y++){
									 			var optionName = effectData[y].$.stringid;
									 			switch(optionName){
									 				case "color": 	this.cssModel["layerFX"][effectName][optionName] = []; // 颜色
									 								this.cssModel["layerFX"][effectName][optionName]["red"] = effectData[y].descriptor[0].element[0].value;
									 								this.cssModel["layerFX"][effectName][optionName]["green"] = effectData[y].descriptor[0].element[1].value;
									 								this.cssModel["layerFX"][effectName][optionName]["blue"] = effectData[y].descriptor[0].element[2].value;
									 								this.cssModel["layerFX"][effectName][optionName]["hexValue"] = this.parseColor(effectData[y].descriptor[0].element[0].value,effectData[y].descriptor[0].element[1].value,effectData[y].descriptor[0].element[2].value);
									 								break;
									 				case "transferSpec": 	this.cssModel["layerFX"][effectName][optionName] = effectData[y].descriptor[0].element[0].value; // 等高线
									 										break;
									 				case "gradient": 	this.cssModel["layerFX"][effectName][optionName] = []; // 渐变
									 									var gradient_data = effectData[y].descriptor[0].element;
									 									for(var a=0; a < gradient_data.length; a++){
									 										var gradient_data_name = gradient_data[a].$.stringid;
									 										switch(gradient_data_name){
									 											case "colors": 	this.cssModel["layerFX"][effectName][optionName][gradient_data_name] = [];
									 															// 颜色列表
																 								var colorlist = gradient_data[a].list[0].element; // 颜色列表
																 								for(var b=0; b<colorlist.length;b++){
																 									var colorlist_name = colorlist[b].$.id,
																 										colorlist_data = colorlist[b].descriptor[0].element;
															 										this.cssModel["layerFX"][effectName][optionName][gradient_data_name][colorlist_name] = [];
															 										for(var c=0;c<colorlist_data.length;c++){
															 											switch(colorlist_data[c].$.stringid){
															 												case "color": this.cssModel["layerFX"][effectName][optionName][gradient_data_name][colorlist_name][colorlist_data[c].$.stringid] = [];
															 															  this.cssModel["layerFX"][effectName][optionName][gradient_data_name][colorlist_name][colorlist_data[c].$.stringid]["red"] = colorlist_data[c].descriptor[0].element[0].value;
															 															  this.cssModel["layerFX"][effectName][optionName][gradient_data_name][colorlist_name][colorlist_data[c].$.stringid]["green"] = colorlist_data[c].descriptor[0].element[0].value;
															 															  this.cssModel["layerFX"][effectName][optionName][gradient_data_name][colorlist_name][colorlist_data[c].$.stringid]["blue"] = colorlist_data[c].descriptor[0].element[0].value;
															 															  this.cssModel["layerFX"][effectName][optionName][gradient_data_name][colorlist_name][colorlist_data[c].$.stringid]["hexValue"] = this.parseColor(colorlist_data[c].descriptor[0].element[0].value,colorlist_data[c].descriptor[0].element[0].value,colorlist_data[c].descriptor[0].element[0].value);
															 															  break;
															 												default:this.cssModel["layerFX"][effectName][optionName][gradient_data_name][colorlist_name][colorlist_data[c].$.stringid] = colorlist_data[c].value;
															 														break;
															 											}
															 										};
																 								};
																 								break;
																 				case "transparency": 	this.cssModel["layerFX"][effectName][optionName][gradient_data_name] = [];
											 															// 不透明度列表
																		 								var transparencylist = gradient_data[a].list[0].element; 
																		 								for(var b=0; b<transparencylist.length;b++){
																		 									var transparencylist_name = transparencylist[b].$.id,
																		 										transparencylist_data = transparencylist[b].descriptor[0].element;
																	 										this.cssModel["layerFX"][effectName][optionName][gradient_data_name][transparencylist_name] = [];
																	 										for(var c=0;c<transparencylist_data.length;c++){
																	 											this.cssModel["layerFX"][effectName][optionName][gradient_data_name][transparencylist_name][transparencylist_data[c].$.stringid] = transparencylist_data[c].value;
																	 										};
																		 								};
																		 								break;
																		 		case "offset": this.cssModel["layerFX"][effectName][optionName][gradient_data_name] = [];
																		 					   this.cssModel["layerFX"][effectName][optionName][gradient_data_name]["horizontal"] = effectData[y].descriptor[0].element[0].value; // 水平偏移
									 														   this.cssModel["layerFX"][effectName][optionName][gradient_data_name]["vertical"] = effectData[y].descriptor[0].element[1].value;; // 垂直偏移
																		 					   break;
									 											default: 	this.cssModel["layerFX"][effectName][optionName][gradient_data_name] = gradient_data[a].value;
									 											 			break;
									 										}
									 								
									 									};
									 									break;
									 				default: 	this.cssModel["layerFX"][effectName][optionName] = effectData[y].value;
									 							break;
									 			}

									 		}
									 		
									 	};

									 };
				                     break;
        	}
        	
        };

        //生成样式
        if(this.cssModel["visible"]=="true"){

        	// 如果开启了颜色填充，则采用颜色填充的颜色
        	if(this.cssModel["layerFXVisible"] && this.cssModel["layerFX_solidFill"]){
        		//var cssColor = this.cssModel["layerFX_solidFill"]["color"]["hexValue"];
        	}else {
        		//var cssColor = this.cssModel["background-color"]["hexValue"];
        	}

        	// 
        	if(this.cssModel["layerFXVisible"] && this.cssModel["layerFX_frameFX"]){
        		var cssBorder = this.cssModel["layerFX_frameFX"]["size"]+"px solid "+this.cssModel["layerFX_frameFX"]["color"]["hexValue"]+";";
        	}else{
        		var cssBorder = "";
        	}



        	var cssBox = [],
        		cssWidth = "width:"+this.cssModel["width"]+"px;",  // 宽
        		cssHeight = "height:"+this.cssModel["height"]+"px;", // 高
        		//cssBackgroundColor = "background-color:"+cssColor+";",  // 背景色
        		cssOpacity = "opacity:"+(this.cssModel["opacity"]/255).toFixed(2)+";", // 不透明度
        		cssClassName = "."+this.cssModel["name"]; // 类名

        	//cssBox.push(cssWidth); // 用数组存储样式

        	csstext = cssClassName+"{";
	        csstext += cssWidth;
	        csstext += cssHeight;
	        csstext += cssBorder;
	        if((this.cssModel["opacity"]/255).toFixed(2) != 1.00){
	        	csstext += cssOpacity;
	        }
	        //csstext += cssBackgroundColor;
	        csstext +="}";
	        console.log(csstext);
	        cssArray[i] = csstext;
        }

    }
;
    

    return cssArray;

};