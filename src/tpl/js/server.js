$(function(){

	var host = "//"+window.location.host+"/",
	    nowpage = parent.document.getElementById("tracker_page").src;
	
	/*
     * 工具栏自身功能
     */
	/* 
	$(".mode_on").on("click",function(e){
		e.preventDefault();
		parent.document.body.className = "control-power-mode";
	});
	
	$(".mode_off").on("click",function(e){
		e.preventDefault();
		parent.document.body.className = "";
	});
	*/
	
	$(".dropdown-toggle").on("click",function(e){
		e.preventDefault();
		parent.document.body.className = "control-power-mode";
	});
	
	// 关闭工具栏
	$("#closeFrame").on("click",function(){
		var parent_document = parent.document.getElementById("tracker_page").contentWindow.document,
			head_content = parent_document.head.innerHTML,
			body_content = parent_document.body.innerHTML;
		
		parent.document.head.innerHTML = head_content;
		parent.document.body.innerHTML = body_content;
		
	});
	
	$(".close").on("click",function(){
		setBodyClassModeOff();
	});

    $(document).on("click",".modal-backdrop",function(){
        setBodyClassModeOff();
    });

    $(document).on("click",function(){
        if(!$("#Modal").hasClass("in")){
            setBodyClassModeOff();
        }
    });
	
	function setBodyClassModeOn(){
		parent.document.body.className = "control-power-mode";
	}
	
	function setBodyClassModeOff(){
		parent.document.body.className = "";
	}

	function getConfig(fn){
		$.ajax({
            type:"get",
            url:host+"livestartAction/init/get"
        }).done(function(data){
			if(data.version === "0"){
				fn(data,true);
			}else{
				fn(data,false);
			}
		});
	}
	
	function getTpl(url,data,fn){

		var fn = (typeof data === "function" && typeof fn === "undefined")?data:fn,
			data = (typeof data === "object")?data:{};
			
		$.ajax({
			type:"get",
			url:url
		}).done(function(tpl){
			var html = juicer(tpl, data);
			fn(html);
		});
		
	}
	
	function renderModalPage(url,title,data){
		data = data || {};
		getTpl(url,data,function(html){
            setBodyClassModeOn();
			$("#Modal").modal("show");
			$("h3","#Modal .modal-header").html("<span>"+title+"</span>");
			$(".modal-body","#Modal").html(html);
		});
	}
	
	function ajaxSumbit(id,url,fn){
		$(document).on('submit',id, function(e) {
			e.preventDefault();
			$(this).ajaxSubmit({
				url:host+url,
				success:function(data){
					fn(data);
					$("#Modal").modal('hide');
					setBodyClassModeOff();
				}
				});
		});
	}
	


    /*
     * 初始化项目
     */

    // 更新初始化项目
	ajaxSumbit("#initForm","livestartAction/init/index",function(data){
		alert("更新成功！");
	});


    /*
     * 配置项目
     */
    // 获取配置文件内容
    $("#productconfigTag").on("click",function(e){
		
		getConfig(function(data,isInit){
			if(isInit){
				alert("发现你还没有初始化项目，请先初始化项目。");
				renderModalPage("init_tpl.html","初始化项目");
                
			}else{
				renderModalPage("config_tpl.html","项目配置文件",data);
			}
			return;
		});
		
        return false;
    });


    // 更新配置文件内容
	ajaxSumbit("#configedit","livestartAction/config/edit",function(data){
		alert("更新成功！");
	});


    /*
     * 添加页面
     */
    // 添加页面对话框
    $("#addPage").on("click",function(e){
	
		getConfig(function(data,isInit){
			if(isInit){
				alert("发现你还没有初始化项目，请先初始化项目。");
				renderModalPage("init_tpl.html","初始化项目");
                
			}else{
				renderModalPage("page_tpl.html","添加页面");
			}
			return;
		});
		
        return false;
    });

    // 更新配置文件内容
	ajaxSumbit('#addPageForm',"livestartAction/page/add",function(data){
		if(data.succeed){
			alert("添加成功！");
		}else{
			alert("添加失败！");
		}
		
	});
	
	
	
	/*
     * 图片精灵
     */
    // 添加图片精灵对话框
    $("#picspirit").on("click",function(){
		$.ajax({
            type:"get",
            url:host+"livestartAction/buildspirit/getCssList"
        }).done(function(data){
			console.log(data);
			renderModalPage("picspirit_tpl.html","LiveStart",data);
		});
        
    });
	// 图片精灵提交
	ajaxSumbit('#picspiritForm',"livestartAction/buildspirit/init",function(data){
		if(data.succeed){
			alert(data.msg);
		}else{
			alert("添加失败！");
		}
		
	});
	
	/*
     * 本地资源文件代理
     */
    // 添加本地资源文件代理对话框
    $("#proxyId").on("click",function(){
		//alert("开发中");
		renderModalPage("proxy_tpl.html","LiveStart");
    });
	// 本地资源文件代理提交
	ajaxSumbit('#proxyForm',"livestartAction/proxy/init",function(data){
		if(data.succeed){
			alert(data.msg);
		}else{
			alert("添加失败！");
		}
		
	});

	
	/*
     * 添加模块
     */
    // 添加页面对话框
    $("#addMod").on("click",function(e){
	
		getConfig(function(data,isInit){
			if(isInit){
				alert("发现你还没有初始化项目，请先初始化项目。");
				renderModalPage("init_tpl.html","初始化项目");
                
			}else{
				renderModalPage("mod_tpl.html","添加模块");
			}
			return;
		});
        
        return false;
    });

    /*
     * 关于对话框
     */
    // 添加关于对话框
    $("#about").on("click",function(){
        renderModalPage("about_tpl.html","LiveStart");
    });


    /*
     * 构建项目
     */
    // 添加关于对话框
    $("#build").on("click",function(){
        renderModalPage("build_tpl.html","LiveStart");
		/* getConfig(function(data,isInit){
			renderModalPage("build_tpl.html","LiveStart");
			return;
		}); */
    });

    // 更新配置文件内容
    ajaxSumbit('#buildPageForm',"livestartAction/build/init",function(data){
        if(data.succeed){
            alert(data.msg);
        }else{
            alert(data.msg);
        }

    });
	
	// 模块列表
	$(document).on("click","#modlist",function(){
		$(this).addClass("active").siblings("li").removeClass("active");
		$("#tracker_page",$(parent.document)).attr("src","mods/");
	});
	
	// 页面列表
	$(document).on("click","#pagelist",function(){
		$(this).addClass("active").siblings("li").removeClass("active");
		$("#tracker_page",$(parent.document)).attr("src","/");
	});
	
	// 页面列表
	$(document).on("click","#nowpage",function(){
		$(this).addClass("active").siblings("li").removeClass("active");
		$("#tracker_page",$(parent.document)).attr("src",nowpage);
	});
	

});