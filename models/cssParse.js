
/**
 * CSS处理.
 */

function CssParse(data){
    this.layers = data.layers || {};
    this.cssModel = [];
}

// 接口
module.exports = CssParse;

CssParse.prototype.parseColor = function parseColor(red,green,blue){
	var hR=Math.round(red).toString(16),
		hG=Math.round(green).toString(16),
		hB=Math.round(blue).toString(16); 
	return "#"+(red<16?("0"+hR):hR)+(green<16?("0"+hG):hG)+(blue<16?("0"+hB):hB);
};

/*
	处理CSS
*/
CssParse.prototype.toCss = function toCss(){

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
        		case "textKey": var textKeyData = element.descriptor[0].element;
        						this.cssModel["textKey"] = [];
        						for(var j=0; j<textKeyData.length; j++){
        							if(typeof textKeyData[j].value != "undefined"){
        								this.cssModel["textKey"][textKeyData[j].$.stringid] = textKeyData[j].value;
        							}
        							if(typeof textKeyData[j].descriptor != "undefined"){
        								this.cssModel["textKey"][textKeyData[j].$.stringid] = [];
        								for(var y=0; y< textKeyData[j].descriptor[0].element; y++){
        									this.cssModel["textKey"][textKeyData[j].$.stringid][textKeyData[j].descriptor[0].element[y].$.stringid] = textKeyData[j].descriptor[0].element[y].value;
        								}
        							}
        							if(typeof textKeyData[j].list != "undefined"){
        								for(var y=0; y< textKeyData[j].list[0].element; y++){
        									for(var a=0; a< textKeyData[j].list[0].element[y].descriptor[0].element; a++){

        									};

        								}
        							};
        						};
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


									 	/*
									 	switch(layerEffects[j].$.stringid){
									 		// 颜色填充
									 		case "solidFill": 	var layereffects_element = layerEffects[j].descriptor[0].element;
									 						 	this.cssModel["layerFX_solidFill"]=[];
									 						 	this.cssModel["layerFX_solidFill"]["enabled"] = layereffects_element[0].value; // 是否开启
									 						 	this.cssModel["layerFX_solidFill"]["mode"] = layereffects_element[1].value; // 混合模式
									 						 	this.cssModel["layerFX_solidFill"]["opacity"] = layereffects_element[2].value; // 不透明度
									 						 	this.cssModel["layerFX_solidFill"]["color"] = []; // 颜色
									 						 	this.cssModel["layerFX_solidFill"]["color"]["red"] = layereffects_element[3].descriptor[0].element[0].value;
									 						 	this.cssModel["layerFX_solidFill"]["color"]["green"] = layereffects_element[3].descriptor[0].element[1].value;
									 						 	this.cssModel["layerFX_solidFill"]["color"]["blue"] = layereffects_element[3].descriptor[0].element[2].value;
									 							this.cssModel["layerFX_solidFill"]["color"]["hexValue"] = (function(){
									 						 		var hR=Math.round(layereffects_element[3].descriptor[0].element[0].value).toString(16),
																		hG=Math.round(layereffects_element[3].descriptor[0].element[1].value).toString(16),
																		hB=Math.round(layereffects_element[3].descriptor[0].element[2].value).toString(16); 
																	return "#"+(layereffects_element[3].descriptor[0].element[0].value<16?("0"+hR):hR)+(layereffects_element[3].descriptor[0].element[1].value<16?("0"+hG):hG)+(layereffects_element[3].descriptor[0].element[2].value<16?("0"+hB):hB); 
									 						 	})();
									 						 	break;
									 		// 描边
									 		case "frameFX": var layereffects_element = layerEffects[j].descriptor[0].element;
									 						this.cssModel["layerFX_frameFX"]=[];
									 						this.cssModel["layerFX_frameFX"]["enabled"] = layereffects_element[0].value; // 是否开启
									 						this.cssModel["layerFX_frameFX"]["frameStyle"] = layereffects_element[1].value; // 描边位置:outsetFrame
									 						this.cssModel["layerFX_frameFX"]["paintType"] = layereffects_element[2].value; // 填充类型
									 						this.cssModel["layerFX_frameFX"]["mode"] = layereffects_element[3].value; // 混合模式
									 						this.cssModel["layerFX_frameFX"]["opacity"] = layereffects_element[4].value; // 不透明度
									 						this.cssModel["layerFX_frameFX"]["size"] = layereffects_element[5].value; // 描边大小
									 						this.cssModel["layerFX_frameFX"]["color"] = []; // 颜色
									 						this.cssModel["layerFX_frameFX"]["color"]["red"] = layereffects_element[6].descriptor[0].element[0].value;
									 						this.cssModel["layerFX_frameFX"]["color"]["green"] = layereffects_element[6].descriptor[0].element[0].value;
									 						this.cssModel["layerFX_frameFX"]["color"]["blue"] = layereffects_element[6].descriptor[0].element[0].value;
									 						this.cssModel["layerFX_frameFX"]["color"]["hexValue"] = (function(){
									 						 	var hR=Math.round(layereffects_element[6].descriptor[0].element[0].value).toString(16),
																	hG=Math.round(layereffects_element[6].descriptor[0].element[1].value).toString(16),
																	hB=Math.round(layereffects_element[6].descriptor[0].element[2].value).toString(16); 
																return "#"+(layereffects_element[6].descriptor[0].element[0].value<16?("0"+hR):hR)+(layereffects_element[6].descriptor[0].element[1].value<16?("0"+hG):hG)+(layereffects_element[6].descriptor[0].element[2].value<16?("0"+hB):hB); 
									 						 })();
									 						break;
									 		// 内阴影
									 		case "innerShadow": var layereffects_element = layerEffects[j].descriptor[0].element;
									 							this.cssModel["layerFX_innerShadow"]=[];
									 							this.cssModel["layerFX_innerShadow"]["enabled"] = layereffects_element[0].value; // 是否开启
									 							this.cssModel["layerFX_innerShadow"]["mode"] = layereffects_element[1].value; // 混合模式
									 							this.cssModel["layerFX_innerShadow"]["color"] = []; // 颜色
									 							this.cssModel["layerFX_innerShadow"]["color"]["red"] = layereffects_element[2].descriptor[0].element[0].value;
										 						this.cssModel["layerFX_innerShadow"]["color"]["green"] = layereffects_element[2].descriptor[0].element[0].value;
										 						this.cssModel["layerFX_innerShadow"]["color"]["blue"] = layereffects_element[2].descriptor[0].element[0].value;
										 						this.cssModel["layerFX_innerShadow"]["color"]["hexValue"] = (function(){
										 						 	var hR=Math.round(layereffects_element[2].descriptor[0].element[0].value).toString(16),
																		hG=Math.round(layereffects_element[2].descriptor[0].element[1].value).toString(16),
																		hB=Math.round(layereffects_element[2].descriptor[0].element[2].value).toString(16); 
																	return "#"+(layereffects_element[2].descriptor[0].element[0].value<16?("0"+hR):hR)+(layereffects_element[2].descriptor[0].element[1].value<16?("0"+hG):hG)+(layereffects_element[2].descriptor[0].element[2].value<16?("0"+hB):hB); 
										 						 })();
										 						this.cssModel["layerFX_innerShadow"]["opacity"] = layereffects_element[3].value; // 不透明度
										 						this.cssModel["layerFX_innerShadow"]["useGlobalAngle"] = layereffects_element[4].value; // 是否使用全局灯光
										 						this.cssModel["layerFX_innerShadow"]["localLightingAngle"] = layereffects_element[5].value; // 灯光角度
										 						this.cssModel["layerFX_innerShadow"]["distance"] = layereffects_element[6].value; // 距离
										 						this.cssModel["layerFX_innerShadow"]["chokeMatte"] = layereffects_element[7].value; // 阻塞
										 						this.cssModel["layerFX_innerShadow"]["blur"] = layereffects_element[8].value; // 模糊(大小)
										 						this.cssModel["layerFX_innerShadow"]["noise"] = layereffects_element[9].value; // 杂色
										 						this.cssModel["layerFX_innerShadow"]["antiAlias"] = layereffects_element[10].value; // 是否消除锯齿
										 						this.cssModel["layerFX_innerShadow"]["transferSpec"] = layereffects_element[11].descriptor[0].elenemt[0].value; // 等高线
									 						    break;
									 		// 外发光
									 		case "outerGlow": 	var layereffects_element = layerEffects[j].descriptor[0].element;
									 						  	this.cssModel["layerFX_outerGlow"]=[];
									 							this.cssModel["layerFX_outerGlow"]["enabled"] = layereffects_element[0].value; // 是否开启
									 							this.cssModel["layerFX_outerGlow"]["mode"] = layereffects_element[1].value; // 混合模式
									 							this.cssModel["layerFX_outerGlow"]["color"] = []; // 颜色
									 							this.cssModel["layerFX_outerGlow"]["color"]["red"] = layereffects_element[2].descriptor[0].element[0].value;
										 						this.cssModel["layerFX_outerGlow"]["color"]["green"] = layereffects_element[2].descriptor[0].element[0].value;
										 						this.cssModel["layerFX_outerGlow"]["color"]["blue"] = layereffects_element[2].descriptor[0].element[0].value;
										 						this.cssModel["layerFX_outerGlow"]["color"]["hexValue"] = (function(){
										 						 	var hR=Math.round(layereffects_element[2].descriptor[0].element[0].value).toString(16),
																		hG=Math.round(layereffects_element[2].descriptor[0].element[1].value).toString(16),
																		hB=Math.round(layereffects_element[2].descriptor[0].element[2].value).toString(16); 
																	return "#"+(layereffects_element[2].descriptor[0].element[0].value<16?("0"+hR):hR)+(layereffects_element[2].descriptor[0].element[1].value<16?("0"+hG):hG)+(layereffects_element[2].descriptor[0].element[2].value<16?("0"+hB):hB); 
										 						 })();
										 						this.cssModel["layerFX_outerGlow"]["opacity"] = layereffects_element[3].value; // 不透明度
										 						this.cssModel["layerFX_outerGlow"]["glowTechnique"] = layereffects_element[4].value; // 图素-方法（发光方式）
										 						this.cssModel["layerFX_outerGlow"]["chokeMatte"] = layereffects_element[5].value; // 图素-扩展
										 						this.cssModel["layerFX_outerGlow"]["blur"] = layereffects_element[6].value; // 图素-模糊大小
										 						this.cssModel["layerFX_outerGlow"]["noise"] = layereffects_element[7].value; // 杂色
										 						this.cssModel["layerFX_outerGlow"]["shadingNoise"] = layereffects_element[8].value; // 抖动
										 						this.cssModel["layerFX_outerGlow"]["antiAlias"] = layereffects_element[9].value; // 是否消除锯齿
										 						//this.cssModel["layerFX_outerGlow"]["transferSpec"] = layereffects_element[10].descriptor[0].elenemt[0].value; // 等高线
										 						this.cssModel["layerFX_outerGlow"]["inputRange"] = layereffects_element[11].value; // 品质范围
									 		// 内发光
									 		case "innerGlow": 	var layereffects_element = layerEffects[j].descriptor[0].element;
									 						  	this.cssModel["layerFX_innerGlow"]=[];
									 							this.cssModel["layerFX_innerGlow"]["enabled"] = layereffects_element[0].value; // 是否开启
									 							this.cssModel["layerFX_innerGlow"]["mode"] = layereffects_element[1].value; // 混合模式
									 							this.cssModel["layerFX_innerGlow"]["color"] = []; // 颜色
									 							this.cssModel["layerFX_innerGlow"]["color"]["red"] = layereffects_element[2].descriptor[0].element[0].value;
										 						this.cssModel["layerFX_innerGlow"]["color"]["green"] = layereffects_element[2].descriptor[0].element[0].value;
										 						this.cssModel["layerFX_innerGlow"]["color"]["blue"] = layereffects_element[2].descriptor[0].element[0].value;
										 						this.cssModel["layerFX_innerGlow"]["color"]["hexValue"] = (function(){
										 						 	var hR=Math.round(layereffects_element[2].descriptor[0].element[0].value).toString(16),
																		hG=Math.round(layereffects_element[2].descriptor[0].element[1].value).toString(16),
																		hB=Math.round(layereffects_element[2].descriptor[0].element[2].value).toString(16); 
																	return "#"+(layereffects_element[2].descriptor[0].element[0].value<16?("0"+hR):hR)+(layereffects_element[2].descriptor[0].element[1].value<16?("0"+hG):hG)+(layereffects_element[2].descriptor[0].element[2].value<16?("0"+hB):hB); 
										 						 })();
										 						this.cssModel["layerFX_innerGlow"]["opacity"] = layereffects_element[3].value; // 不透明度
										 						this.cssModel["layerFX_innerGlow"]["glowTechnique"] = layereffects_element[4].value; // 图素-方法（发光方式）
										 						this.cssModel["layerFX_innerGlow"]["chokeMatte"] = layereffects_element[5].value; // 图素-扩展
										 						this.cssModel["layerFX_innerGlow"]["blur"] = layereffects_element[6].value; // 图素-模糊大小
										 						this.cssModel["layerFX_innerGlow"]["shadingNoise"] = layereffects_element[7].value; // 抖动
										 						this.cssModel["layerFX_innerGlow"]["noise"] = layereffects_element[8].value; // 杂色
										 						this.cssModel["layerFX_innerGlow"]["antiAlias"] = layereffects_element[9].value; // 是否消除锯齿
										 						this.cssModel["layerFX_innerGlow"]["innerGlowSource"] = layereffects_element[10].value; // 内发光光源
										 						//this.cssModel["layerFX_innerGlow"]["transferSpec"] = layereffects_element[11].descriptor[0].elenemt[0].value; // 等高线
										 						//this.cssModel["layerFX_innerGlow"]["inputRange"] = layereffects_element[12].value; // 品质范围
									 						    break;				    break;
									 		// 渐变填充
									 		case "gradientFill": 	var layereffects_element = layerEffects[j].descriptor[0].element;
									 						  		this.cssModel["layerFX_gradientFill"]=[];
									 								this.cssModel["layerFX_gradientFill"]["enabled"] = layereffects_element[0].value; // 是否开启
									 								this.cssModel["layerFX_gradientFill"]["mode"] = layereffects_element[1].value; // 混合模式
									 								this.cssModel["layerFX_gradientFill"]["opacity"] = layereffects_element[2].value; // 不透明度
									 								this.cssModel["layerFX_gradientFill"]["gradient"] = []; // 渐变
									 								this.cssModel["layerFX_gradientFill"]["gradient"]["name"] = layereffects_element[3].descriptor[0].element[0].value; // 渐变名称
									 								this.cssModel["layerFX_gradientFill"]["gradient"]["gradientForm"] = layereffects_element[3].descriptor[0].element[1].value; // 渐变类型
									 								this.cssModel["layerFX_gradientFill"]["gradient"]["interfaceIconFrameDimmed"] = layereffects_element[3].descriptor[0].element[2].value; // 平滑度
									 								this.cssModel["layerFX_gradientFill"]["gradient"]["color"] = []; // 渐变类型
									 								// 颜色列表
									 								var colorlist = layereffects_element[3].descriptor[0].element[3].list[0].element; // 颜色列表
									 								for(var a; a<colorlist.length;a++){
									 									this.cssModel["layerFX_gradientFill"]["gradient"]["color"][i]["red"] = colorlist[a].descriptor[0].element[0].descriptor[0].element[0].value;
									 									this.cssModel["layerFX_gradientFill"]["gradient"]["color"][i]["green"] = colorlist[a].descriptor[0].element[0].descriptor[0].element[1].value;
									 									this.cssModel["layerFX_gradientFill"]["gradient"]["color"][i]["blue"] = colorlist[a].descriptor[0].element[0].descriptor[0].element[2].value;
									 									this.cssModel["layerFX_gradientFill"]["gradient"]["color"][i]["location"] = colorlist[a].descriptor[0].element[2].value; // 位置
									 									this.cssModel["layerFX_gradientFill"]["gradient"]["color"][i]["midpoint"] = colorlist[a].descriptor[0].element[3].value; // 中点位置
									 								};
									 								// 不透明度列表
									 								var transparencylist = layereffects_element[3].descriptor[0].element[4].list[0].element; // 透明度列表
									 								for(var a; a< transparencylist.length; a++ ){
									 									this.cssModel["layerFX_gradientFill"]["gradient"]["transparency"][i]["opacity"] = colorlist[a].descriptor[0].element[0].value;
									 									this.cssModel["layerFX_gradientFill"]["gradient"]["transparency"][i]["location"] = colorlist[a].descriptor[0].element[1].value;
									 									this.cssModel["layerFX_gradientFill"]["gradient"]["transparency"][i]["midpoint"] = colorlist[a].descriptor[0].element[2].value;
									 								};

									 								this.cssModel["layerFX_gradientFill"]["angle"] = layereffects_element[4].value; // 渐变角度
									 								this.cssModel["layerFX_gradientFill"]["type"] = layereffects_element[5].value; // 渐变类型
									 								this.cssModel["layerFX_gradientFill"]["reverse"] = layereffects_element[6].value; // 是否反向
									 								this.cssModel["layerFX_gradientFill"]["dither"] = layereffects_element[7].value; // 是否仿色
									 								this.cssModel["layerFX_gradientFill"]["align"] = layereffects_element[8].value; // 是否与图层对齐
									 								this.cssModel["layerFX_gradientFill"]["scale"] = layereffects_element[9].value; // 缩放
									 								this.cssModel["layerFX_gradientFill"]["offset"] = []; // 偏移
									 								this.cssModel["layerFX_gradientFill"]["offset"]["horizontal"] = layereffects_element[10].descriptor[0].element[0].value;; // 水平偏移
									 								this.cssModel["layerFX_gradientFill"]["offset"]["vertical"] = layereffects_element[10].descriptor[0].element[1].value;; // 垂直偏移


									 						  		break;
									 	};
									 	*/

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

    };
    
    return cssArray;
};