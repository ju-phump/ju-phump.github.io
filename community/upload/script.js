/* yes this is under GPL v3.0
 * 
 * is copy + pasting this info bad practice?
 *
 * code by Dante Davis
 *     started: 2022/03/15 (YYYY/MM/DD)
 * last edited: 2022/03/15
 */
var sv = new Server("wss://server.4j89.repl.co");

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
	sv.uploadLevel(
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
	sv.uploadLevel(
		document.getElementById("text").value
	);
};