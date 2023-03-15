/* yes this is under GPL v3.0
 * 
 * is copy + pasting this info bad practice?
 *
 * code by Dante Davis
 *     started: 2022/03/08 (YYYY/MM/DD)
 * last edited: 2022/03/12
 */
function upload(data) {
    var ws = new WebSocket("wss://server.4j89.repl.co/");
    ws.onopen = function (e) {
        ws.send("upload:" + data);
    }
    ws.onmessage = function (e) {
        console.log(e.data);
    }
    return ws;
}

function getList(request, callback) {
	var ws = new WebSocket('wss://server.4j89.repl.co');
	var c = callback, r = request;
	ws.onmessage = function (event) {
		var response = event.data;
		if (response == "list not found" || response == "server error") {
			window.alert(response);
			return;
		}
		console.log(response);
		var data = 
				JSON.parse(response);
		c(data);
	};
	ws.onopen = function () {
		ws.send(`list:${r}`);
	};
	
	return ws;
}

document.body.innerHTML = `
<h1>Juphump Community</h1>
<a href="upload">Upload Level</a>
<h4>Featured Levels</h4>
<div id="featuredLevels">
	<p>Loading Featured Levels...</p>
</div>
<h4>Recent Levels</h4>
<div id="recentLevels">
	<p>Loading Recent Levels...</p>
</div>
`;


getList("featured,0-10", data => {						// get the featured levels
	var el = document.getElementById("featuredLevels"); // get element
	el.className = "border";
	var lvls = data.lvls;
	var i = 0;
	el.innerHTML = "";									// clear the innerHTML of the element
	for (i = 0; i < lvls.length; i++)					// format the data
		if (lvls[i].name == "(deleted)")
			el.innerHTML += `
				<a href="level/?id=${lvls[i].id}"><p>(LEVEL DELETED)</p></a>
			`;
		else
			el.innerHTML += `
				<a href="level/?id=${lvls[i].id}"><p>"${fromB64(lvls[i].name) || "Nameless"}" by ${fromB64(lvls[i].author) || "Unknown"}</p></a>
			`;
	if (i == 0) 	// if there aren't any featured levels, the variable "i" will equal 0.
		el.innerHTML = "<p>No Levels To Show</p>";
});

getList("recent,0-10", data => {						// get the recent levels
	var el = document.getElementById("recentLevels"); 	// get element
	el.className = "border";
	var lvls = data.lvls;
	var i = 0;
	el.innerHTML = "";									// clear the innerHTML of the element
	for (i = 0; i < lvls.length; i++)					// format the data
		el.innerHTML += `
			<a href="level/?id=${lvls[i].id}"><p>"${fromB64(lvls[i].name) || "Nameless"}" by ${fromB64(lvls[i].author) || "Unknown"}</p></a>
		`;
	if (i == 0) 	// if there aren't any recent levels, the variable "i" will equal 0.
		el.innerHTML = "<p>No Levels To Show</p>";
});