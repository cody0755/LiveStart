var socket = io.connect();
socket.on('reload', function (data) {
	if(data.reload){
		document.location.reload();
	}
});