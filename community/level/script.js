/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/09 (YYYY/MM/DD)
 * last edited: 2022/03/28
 */
var sv = new Server("wss://server.4j89.repl.co");
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
sv.getLevel(id, function (levelData) {
	level = levelData;
	loadInfo({
		"name": level.name,
		"author": level.author,
		"description": level.description
	});
	loadPlayer();
	console.log("loaded");
	bestDeathsEl.innerText = "Personal Death Record: " + cookie.bestDeaths;
	bestTimeEl.innerText = "Best Time: " + cookie.bestTime;
});