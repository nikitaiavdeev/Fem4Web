// Keyboard Init State
var KeyboardState = {
	Shift: false,
	Ctrl: false
};

// Mouse Init State
var MouseState = {
	x: 0,
	y: 0,
	dX: 0,
	dY: 0,
	prevX: 0,
	prevY: 0,
	hold: false,
};

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

function initListeners() {
	//Keyboard
	document.addEventListener('keydown', function (e) {
		if (e.keyCode == 16) {
			KeyboardState.Shift = true;
		} else if (e.keyCode == 17) {
			KeyboardState.Ctrl = true;
		}
	});

	document.addEventListener('keyup', function (e) {
		if (e.keyCode == 16) {
			KeyboardState.Shift = false;
		} else if (e.keyCode == 17) {
			KeyboardState.Ctrl = false;
		}
	});

	//Resize
	window.addEventListener('resize', reportWindowSize);

	//Mouse
	document.onmouseup = handleDocMouseUp;
	document.onmousemove = handleDocMouseMove;

	selectCanvas.onmousedown = handleMouseDown;
	selectCanvas.onmousemove = handleMouseMove;

	// hook up cross browser mouse scrolls
	window.addEventListener('wheel', MouseWheelHandler, {
		passive: false
	});
}

// Handles Resizing
function reportWindowSize() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	textCanvas.width = textCanvas.clientWidth;
	textCanvas.height = textCanvas.clientHeight;
	selectCanvas.width = textCanvas.clientWidth;
	selectCanvas.height = textCanvas.clientHeight;

	camera.updateProjection();
	camera.updateView();
	render.noMovementUpdate();
}

function handleMouseDown(event) {
	mouseDown = true;
	// Get's the Mouse State

	if (selection.textBox) {
		event.preventDefault();
		event.stopPropagation();
	}

	switch (event.button) {
		case 0: //left click
			MouseState.prevX = event.clientX;
			MouseState.prevY = event.clientY - ribbon.height;
			MouseState.LeftButtonDown = true;

			break;
		case 1: //middle click
			MouseState.prevX = event.clientX;
			MouseState.prevY = event.clientY;
			MouseState.MiddleButtonDown = true;
			break;
	}
}

function handleDocMouseUp(event) {
	mouseDown = false;

	// Get's the Mouse State
	switch (event.button) {
		case 0: //left click
			MouseState.LeftButtonDown = false;
			if (MouseState.hold) {
				selection.multiSelection();
				MouseState.hold = false;
			}
			break;
		case 1: //middle click
			glCameraMove.set(glCameraMove.NONE);
			MouseState.MiddleButtonDown = false;
			break;
		case 2: //right click
			MouseState.RightButtonDown = false;
			break;
	}
}

function handleDocMouseMove(event) {
	if (MouseState.hold) {
		MouseState.x = event.clientX;
		MouseState.y = event.clientY - ribbon.height;
	}
}

function handleMouseMove(event) {
	if (!mouseDown || !MouseState.MiddleButtonDown) {
		MouseState.x = event.clientX;
		MouseState.y = event.clientY - ribbon.height;
		if (MouseState.LeftButtonDown && !MouseState.hold &&
			Math.abs(MouseState.prevX - MouseState.x) > 3 &&
			Math.abs(MouseState.prevY - MouseState.y) > 3) {
			hover.clear();
			MouseState.hold = true;
		}
		if (!MouseState.hold) {
			hover.mouseHover();
		}
		return;
	}

	MouseState.dX = event.clientX - MouseState.prevX;
	MouseState.dY = event.clientY - MouseState.prevY;
	MouseState.prevX = event.clientX;
	MouseState.prevY = event.clientY;

	if (KeyboardState.Shift == true && KeyboardState.Ctrl == true) {
		// Handle spin
		glCameraMove.set(glCameraMove.SPIN);
		camera.rotZ -= MouseState.dX * $glMath.PI180;
	} else if (KeyboardState.Shift == true) {
		// Handle pan
		glCameraMove.set(glCameraMove.PAN);
		camera.panX += MouseState.dX / camera.curZoom;
		camera.panY += MouseState.dY / camera.curZoom;
	} else if (KeyboardState.Ctrl == true) {
		// Handle zoom
		glCameraMove.set(glCameraMove.ZOOM);
		camera.curZoom -= MouseState.dY * camera.curZoom / 200;
	} else {
		// Handle rotation
		glCameraMove.set(glCameraMove.ROTATE);

		camera.rotX -= MouseState.dY * $glMath.PI180;
		camera.rotY -= MouseState.dX * $glMath.PI180;
	}
}

function MouseWheelHandler(e) {
	let delta = e.wheelDelta / 120;
	if (!delta)
		delta = e.deltaY / 10; //Firefox

	if (KeyboardState.Ctrl) // prevent broweser zoom
		e.preventDefault();

	if (tree.module.classList.contains('hovered') == true) {
		tree.table.scrollTop += 10 * delta;
	} else {
		glCameraMove.isWheelZoom = true;
		glCameraMove.set(glCameraMove.ZOOM);
		camera.curZoom -= delta * (camera.curZoom / 10);
	}
}