/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/17 (YYYY/MM/DD)
 * last edited: 2022/03/23
 */
var lvl = 0;
var levels = [];
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
bestEl = document.createElement("p");
bestEl.innerText = "Best Time: N/A";
bestEl.id = "bestTime";
document.body.appendChild(bestEl);
document.getElementById("lvlInfo").innerHTML = `
		<h1 id="name">...loading...</h1>
		<h3>By <a id="author">...loading...</a></h3>
		<p id="description">...loading...</p>
 `;
function nextLevel() {
	lvl = lvl + 1;									// get the index of the next level
	level.map = mapDecompress(levels[lvl].map);		// get level data
	level.magic = levels[lvl].magic;
	level.name = fromB64(levels[lvl].name);
	level.author = fromB64(levels[lvl].author);
	level.description = fromB64(levels[lvl].description);
	level.startPos = levels[lvl].startPos;
	loadInfo({
		"name": level.name,
		"author": level.author,
		"description": level.description
	});
	try{flush(lc);}catch{}					// flush the level canvas
	size = getMapSize();					// get the level's size		// I am stupid i put level instead of map
	drawLevel();							// draw the level
	reset();								// reset the player
	unwin();								// unwin, removes the "level complete" text
	if (lvl == 0)							// reset the timer if the player completed all the levels
		timer = 0;
	if (lvl > levels.length) {				// if you beat the series then it records your record
		if (timer < cookie.bestTime || cookie.bestTime == "N/A") 
			cookie.bestTime = Math.floor(timer);
		bestEl.innerText = "Best Time: " + cookie.bestTime;
		cookie.completed();
	}
	practice.checkpoint = {
		"x": level.startPos[0],
		"y": level.startPos[1],
		"gravity": 1
	};
}
sv.getSeries(id, function (data) {
	levels = data.content;
	series.name = fromB64(data.name);
	series.author = fromB64(data.author);
	series.description = fromB64(data.description);
	loadPlayer();
	nextLevel();
});