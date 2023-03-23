/* yes this is under GPL v3.0
 * 
 * is copy + pasting this info bad practice?
 *
 * code by Dante Davis
 *     started: 2022/03/15 (YYYY/MM/DD)
 * last edited: 2022/03/15
 */
function upload(data) {
    var ws = new WebSocket("wss://server.4j89.repl.co/");
    ws.onopen = function (e) {
        ws.send("upload:" + data);
    }
    ws.onmessage = function (e) {
        var msg = e.data;
		if (msg == "server overloaded") {
			window.alert("upload failed: server is overloaded");
		} else if (msg == "invalid level data") {
			window.alert("upload failed: invalid level data");
		} else if (msg.endsWith("in the queue")) {
			document.body.innerHTML = `
				<center>
					<h1>Upload a Level to the Servers</h1>	
				  	<h3>Success!</h3>
	   				<p>you are ${msg}</p>
				</center>
				`;
			window.alert("upload success, you are " + msg);
		} else if (msg == "server error") {
			window.alert("upload failed: server error");
		} else {
			window.alert("unknown server response");
		}
    }
	ws.onclose = function (e) {
		if (e.code == 1006)
			window.alert("server unreachable");
	}
    return ws;
}

document.body.innerHTML = `
<center>
	<h1>Upload a Level to the Servers</h1>	
  	<h3>RULES:</h3>
   	<div class="border">
		<p>1. Do not upload pornographic content</p>
	 	<p>2. Do not upload levels containing derogatory language or offensive imagery of any kind</p>
	  	<p>3. Have fun</p>
	</div>
   	<textarea placeholder="Paste Level Data Here..." id="text"></textarea><br>
	<button id="textUpload">Upload From Text</button><br><br>
	<input type="file" id="fileUpload" name="filename"><br><br>
	<button id="fileUploadButton">Upload File</button>
</center>
`;
document.getElementById("textUpload").onclick = function () {
	upload(
		document.getElementById("text").value
	);
};
var lvlData = "";
document.getElementById("fileUpload").oninput = function (e) {
	var file = this.files[0];
	file.text()
		.then((data) => {
			lvlData = data;
		});
};
document.getElementById("fileUploadButton").onclick = function () {
	if (lvlData == "") {
		window.alert("file is empty");
		return;
	}
	try {
		atob(lvlData)
	} catch {
		window.alert("invalid base64");
	}
	upload(
		lvlData
	);
};