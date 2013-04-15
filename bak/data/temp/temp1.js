                    /*
                    switch(layerEffects[j].$.stringid){
                      // 颜色填充
                      case "solidFill":   var layereffects_element = layerEffects[j].descriptor[0].element;
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
                      case "outerGlow":   var layereffects_element = layerEffects[j].descriptor[0].element;
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
                      case "innerGlow":   var layereffects_element = layerEffects[j].descriptor[0].element;
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
                                  break;            break;
                      // 渐变填充
                      case "gradientFill":  var layereffects_element = layerEffects[j].descriptor[0].element;
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