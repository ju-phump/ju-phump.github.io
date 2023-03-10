/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/05 (YYYY/MM/DD)
 * last edited: 2022/03/08
 */
function toB64(string) { // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
	const codeUnits = new Uint16Array(string.length);
	for (let i = 0; i < codeUnits.length; i++) {
		codeUnits[i] = string.charCodeAt(i);
	}
	return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
}
function fromB64(encoded) {
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return String.fromCharCode(...new Uint16Array(bytes.buffer));
}
function genData() {
	var data = Object.assign({}, level);		// create a copy of the level data (to avoid modifying it)
	data.name = toB64(data.name);
	data.author = toB64(data.author);
	data.description = toB64(data.description);
	return btoa(JSON.stringify(data));
}
function loadData(src) {
	var data = 
			JSON.parse(atob(src));
	level.map = data.map;
	level.magic = data.magic;
	level.name = fromB64(data.name);
	level.author = fromB64(data.author);
	level.description = fromB64(data.description);
}
function setCookie(cname, cvalue) {
	document.cookie = cname + "=" + cvalue + ";path=/";
}
function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
function flush(c) {
	c.clearRect(0, 0, window.innerWidth, window.innerHeight);
}
function drawRect(c, x, y, w, h, center = true) {
	var ratio = plrCanvas.width / 512;
	x *= ratio;
	y *= ratio;
	w *= ratio;
	h *= ratio;
	if (center)
		c.fillRect(x - (w/2), y - (h/2), w, h);
	else
		c.fillRect(x, y, w, h);
}
function drawImg(c, img, x, y, w, h, center = true) {
	var ratio = plrCanvas.width / 512;
	x *= ratio;
	y *= ratio;
	w *= ratio;
	h *= ratio;
	if (center)
		c.drawImage(img, x - (w/2), y - (h/2), w, h);
	else
		c.drawImage(img, x, y, w, h);
}
function getMapSize() {
	var rows = level.map.length;
	var size = [0, rows];
	for (var y = 0; y < rows; y++) {
		var cols = level.map[y].length;
		for (var x = 0; x < cols; x++) {
			if (x > size[0])
				size[0]++;
		}
	}
	return size;
}
function drawLevel() {
	var ratio = plrCanvas.width / 512;
	var rows = size[1];
	lvlCanvas.width = (size[0] * 16 + 16) * ratio;
	lvlCanvas.height = (size[1] * 16 + 16) * ratio;
	for (var y = 0; y < rows; y++) {
		var r = level.map[y];
		var cols = r.length;
		for (var x = 0; x < cols; x++){
			if (r[x] == "0")
				continue;
			lc.fillStyle = colours[r[x] - 1];
			drawRect(lc, x * 16, y * 16, 17, 17, false);
		}
	}
}
var colours = [
	"#000000",
	"#00ff00",
	"#ffff00",
	"#00ffff",
	"#ff0000"
];
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}
var level = {
	"name": "",
	"author": "",
	"description": "",
	"startPos": [0,0],
	"map": [
		"11111111111111111111111111111111",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"10000000000000000000000000000001",
		"11111111111111111111111111111111"
	],
	"magic": {}
};
var url = window.location.href.split("?=")
if (url.length > 1) {
	try {
		loadData(url[1]);
	} catch (exception) {window.alert("invalid level data")}
}
var sprites = {
	"timmivoq_0": "/img/timmivoq0.png",
	"timmivoq_1": "/img/timmivoq1.png"
};
for (i in sprites) {
	var img = new Image();
	img.src = sprites[i];
	sprites[i] = img;
}
document.body.innerHTML += `
<div id="lvlInfo">
	<h1 id="name">${level.name || "Nameless"}</h1>
	<h3>By <a id="author">${level.author || "No Author"}</a></h3>
	<p id="description">${level.description || "No Description"}</p>
</div>
`;
var size = getMapSize();
var input = {};
document.onkeydown = (e) => {
	if (!input[e.key])
		input[e.key] = 1;
}
document.onkeyup = (e) => {
	input[e.key] = 0;
}