(function(){

    var ls = function(){
		
		var oldHead = document.head.innerHTML,
			oldBody = document.body.innerHTML,
			title = document.title,
			pagehref = window.location.href,
			domain = window.location.hostname+":"+window.location.port,
			newHead = '<meta charset="UTF-8"><meta name="description" content="ucren-tracker-frame"><title>'+title+'</title><style type="text/css">html, body{ margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100%; position: relative; }.fullness{ position: absolute; left: 0; right: 0; top: 0; bottom: 0; }#wrapper{}#tracker_controller_ct{ z-index: 10; }#tracker_page_ct{ top: 43px; z-index: 20; background-color: #fff; }body.control-power-mode #tracker_page_ct{ z-index: 0; }body.hidden-page-mode #tracker_page_ct{ display: none; }iframe{ border: 0; width: 100%; height: 100%; }</style>',
			newBody = '<div id="wrapper" class="fullness"><div id="tracker_controller_ct" class="fullness" style="display: block;"><iframe src="http://'+domain+'/livestart/sever_top.html" id="lsServer" name="lsServer" frameborder="no"></iframe></div><div id="tracker_page_ct" class="fullness" style=""><iframe src="'+pagehref+'" id="tracker_page" name="tracker_page" frameborder="no"></iframe></div></div>';
		
		document.head.innerHTML = newHead;
		document.body.innerHTML = newBody;
		
		var lsScript = document.getElementsByClassName("ls")[0],
			lsParent = lsScript.parentNode;
		lsParent.removeChild(lsScript);
		
	};
	
	ls();
		
})();



