/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/09 (YYYY/MM/DD)
 * last edited: 2022/03/10
 */
const ws = new WebSocket('wss://server.4j89.repl.co');

ws.addEventListener('message', (event) => {
    var response = event.data;
	if (response == "level not found" || response == "server error") {
		window.alert(response);
		return;
	}
	var data = 
			JSON.parse(response);
	level.map = mapDecompress(data.map);
	level.magic = data.magic;
	level.name = fromB64(data.name);
	level.author = fromB64(data.author);
	level.description = fromB64(data.description);
	level.startPos = data.startPos;
	
	loadInfo({
		"name": level.name,
		"author": level.author,
		"description": level.description
	});
	loadPlayer();
});
ws.addEventListener('open', (event) => {
	if (id != -1)
		ws.send("level:" + id);
});
var id = -1;
var url = document.location.href.split("?id=");
if (url.length > 1) {
	id = url[1];
}
document.getElementById("lvlInfo").innerHTML = `
		<h1 id="name">...loading...</h1>
		<h3>By <a id="author">...loading...</a></h3>
		<p id="description">...loading...</p>
 `;