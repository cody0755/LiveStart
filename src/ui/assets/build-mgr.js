var buildManager = (function(){
    var building = false;
    var pass = true;
    function setHistoryList(){
        $.get("/buildhistory",function(data){
            if(data.success){
                var d = data.data.history;
                var items = [];
                $.each(d,function(k){
                    var item = this;
                    item.tag = k;
                    items.push({
                        tag:k,
                        cppath:item.cppath,
                        mode:item.mode,
                        data:JSON.stringify(item)
                    });
                });
                var html = juicer($("#T_historyList").html(),{
                    items:items
                });
                $("#J_historyList").html(html);
                if(items.length==0){
                    $("#J_historyList").html("<li>无记录</li>");
                }
            }
        },"json");
    }
    function initSelectPath(){
        var btn = $(".J_selectPath");
        var form = $(".J_buildForm");
        var input = form.find("[name='cppath']");
        var btnsubmit = $(".J_selectFolder");
        var filelist = $(".J_fileList");
        var listcontent = filelist.find("ul");
        var curDir="/";
        btnsubmit.click(function(e){
            e.preventDefault();
            input.val(curDir);
            filelist.fadeOut();
        });
        btn.click(function(e){
            e.preventDefault();
            filelist.fadeIn();
            setList();
        });
        function setList(){
            filelist.find("em").html(curDir);
            $.get("/gettree",{
                root:curDir
            },function(data){
                if(data.success){
                    var d = data.data.files;
                    var items = [];
                    $.each(d,function(k){
                        var item = this;
                        item.data = JSON.stringify(item);
                        items.push(item);
                    });
                    var html = juicer($("#T_fileList").html(),{
                        items:items
                    });
                    listcontent.html(html);
                    
                }
            },"json");
        }
        listcontent.delegate("li","click",function(e){
            e.preventDefault();
            var li = $(this);
            var data = JSON.parse(li.attr("data-file"));
            if(data.type=="file")return;
            curDir = data.path;
            setList();
        });
        
    }
    function setValue(key,reg){
        var form = $(".J_buildForm");
        var item = form.find("[name='"+key+"']");
        if(!item){
            pass = false;
        }
        if(reg){
            pass = reg.test(item.val());
        }
        return item.val();
    }
    return {
        init:function(){
            setHistoryList();
            $("#J_historyList").delegate(".run","click",function(e){
                e.preventDefault();
                if(building)return;
                building = true;
                var li = $(this).parents("li");
                var data = JSON.parse(li.attr("data-build"));
                $(this).text("正在打包...").prepend('<i class="icon-repeat icon-white"></i>');
                
                $.get("/build",data,function(d){
                    if(d.success){
                        alert("打包成功");
                        building = false;
                        location.reload();
                    }
                },"json");
            });
            $("#J_historyList").delegate(".delete","click",function(e){
                e.preventDefault();

                var li = $(this).parents("li");
                var data = JSON.parse(li.attr("data-build"));
                $(this).text("正在删除...").prepend('<i class="icon-repeat"></i>');
                
                $.get("/delbuildhistory",data,function(d){
                    if(d.success){
                        location.reload();
                    }
                },"json");
            });
            initSelectPath();
            $(".J_btnBuild").click(function(e){
                e.preventDefault();
                if(building)return;
                building = true;

                pass = true;
                var data = {
                    cppath:setValue("cppath"),
                    tag:setValue("tag",/\d+/),
                    mode:setValue("mode")
                }
                if(!pass)return;
                $(this).text("正在打包...").prepend('<i class="icon-repeat icon-white"></i>');
                $.get("/build",data,function(d){
                    if(d.success){
                        alert("打包成功");
                        building = false;
                        location.reload();
                    }
                },"json");
            });
        }    
    }
})();
buildManager.init();
