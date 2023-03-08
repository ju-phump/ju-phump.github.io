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
	"#00ffff"
];
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}
var level = {
	"name": null,
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
		level = 
			JSON.parse(fromB64(url[1]));
		if (!level.hasOwnProperty("startPos")) {
			level.startPos = [0, 0];
		}
		if (!level.hasOwnProperty("magic")) {
			level.magic = {};
		}
	} catch (exception) {window.alert("invalid level data")}
}
document.body.innerHTML += `<h1 id="name">${level.name || "Nameless"}</h1>`;
var size = getMapSize();