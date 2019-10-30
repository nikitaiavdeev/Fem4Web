// The WebGL Canvas
var canvas = null;
var textCanvas = null;

// The WebGL Context
var gl = null;
var ctx = null;
var csel = null;

//Create Camera
var camera = null;
//Create rendering
var render = null;
//Model
var model = null;
//cidAxis
var cidAxis = null;
//Model json data
var bdfData = null;
//Mouse hover
var hover = null;
var selection = null;
//Measurements
var measure = null;
//Wait loader
var loader = null;
//animationID
var animationID = null;

// Cache all imagese
window.onload = function () {
	//Init Canvases
	canvas = document.getElementById('glCanvas3D'); //WebGL2 canvas
	textCanvas = document.getElementById('textCanvas');
	selectCanvas = document.getElementById('selectCanvas');

	//init WebGL
	try {
		gl = canvas.getContext('webgl2');
		ctx = textCanvas.getContext('2d');
		csel = selectCanvas.getContext('2d');
	} catch (e) {
		alert('Could not initialise WebGL, sorry :-(\n' + e);
		return;
	}
	if (!gl) {
		alert('Could not initialise WebGL, sorry :-(');
		return;
	}

	//Setup Global variables
	camera = new $glCamera();
	render = new $glRender();
	cidAxis = new $cidAxis();
	hover = new $glHover();
	selection = new $glSelection();
	measure = new $glMeasurements();

	//Init moouse and keyboard listeners
	initListeners();

	//First draw
	reportWindowSize();
	render.drawScene();

	loader = document.getElementById('loader').style;
	loader.backgroundColor = 'transparent';
	loader.opacity = 1;
	loaderFade();
};

function loaderFade() {
	if ((loader.opacity -= 0.25) < 0)
		loader.display = "none";
	else
		setTimeout(loaderFade, 0);
}

function loaderShow() {
	loader.opacity = 1;
	loader.display = 'flex';
}