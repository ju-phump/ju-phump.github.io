/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/09 (YYYY/MM/DD)
 * last edited: 2022/03/10
 */
var sv = new Server("wss://server.4j89.repl.co");
var id = -1;
var url = document.location.href.split("?id=");
if (url.length > 1) {
	id = url[1];
}

timerEl = document.createElement("p");
timerEl.innerText = "Current Time: 0";
timerEl.id = "timer";
document.body.appendChild(timerEl);
bestTimeEl = document.createElement("p");
bestTimeEl.innerText = "Best Time: N/A";
bestTimeEl.id = "bestTime";
document.body.appendChild(bestTimeEl);
deathsEl = document.createElement("p");
deathsEl.innerText = "Deaths: 0";
deathsEl.id = "Deaths";
document.body.appendChild(deathsEl);
bestDeathsEl = document.createElement("p");
bestDeathsEl.innerText = "Personal Death Record: N/A";
bestDeathsEl.id = "bestDeaths";
document.body.appendChild(bestDeathsEl);

document.getElementById("lvlInfo").innerHTML = `
		<h1 id="name">...loading...</h1>
		<h3>By <a id="author">...loading...</a></h3>
		<p id="description">...loading...</p>
 `;
sv.getLevel(id, function (e) {
	loadInfo({
		"name": level.name,
		"author": level.author,
		"description": level.description
	});
	loadPlayer();
});