var glCameraMove = {
	state: 0,
	set: function (inp_val) {
		camera.needUpdate = true;

		if (inp_val == this.NONE)
			render.noMovementUpdate();

		if (inp_val !== this.state) {
			switch (this.state) {
				case this.SPIN:
					camera.rotZ = 0;
					camera.quat.copy(camera.curQ);
					camera.right.copy(camera.curQ.xAxis);
					camera.up.copy(camera.curQ.yAxis);
					camera.fwd.copy(camera.curQ.zAxis);
					break;
				case this.ROTATE:
					camera.rotX = 0;
					camera.rotY = 0;
					camera.updateDepth();
					camera.quat.copy(camera.curQ);
					camera.right.copy(camera.curQ.xAxis);
					camera.up.copy(camera.curQ.yAxis);
					camera.fwd.copy(camera.curQ.zAxis);
					break;
				case this.PAN:
					camera.panX = 0;
					camera.panY = 0;
					camera.updateDepth();
					break;
			}
		}

		if (inp_val == this.NONE)
			camera.needUpdate = false;

		this.state = inp_val;
	},
	isWheelZoom: false,
	NONE: 0,
	ROTATE: 1,
	ZOOM: 2,
	PAN: 3,
	SPIN: 4,
};

class $glCamera {
	constructor() {
		// View matrix
		this.view = new glMat4();

		// Projection Matrix
		this.projection = new glMat4();

		//Projection * View Matrix
		this.PV = new glMat4();

		//Inversed Transposed View Matrix for light
		this.normMat = new glMat3();

		this.nearPlane = -1000;
		this.farPlane = 1000;

		this.rotX = 0;
		this.rotY = 0;
		this.rotZ = 0;

		this.panX = 0;
		this.panY = 0;

		// The Quaternion
		this.quat = new glQuat();
		// The right vector
		this.right = new glVec3(1, 0, 0);
		// The up vector
		this.up = new glVec3(0, 1, 0);
		// The fwd vector
		this.fwd = new glVec3(0, 0, 1);

		// Current Camera Stage
		this.curQ = new glQuat();
		this.curCenter = new glVec3();
		this.curZoom = 1;

		//Update status
		this.needUpdate = false;
		this.needUpdateProjection = true;

		//Animation
		this.isAnimate = false;
		this.animateF = 0;

		//Start Position
		this.initQ = new glQuat();
		this.initCenter = new glVec3();
		this.initZoom = 0;

		//Final Position
		this.animQ = new glQuat();
		this.animCenter = new glVec3();
		this.animZoom = 0;

		//Coords View
		this.viewSizeCoord = 18;
		this.viewCoord = new glMat4();
	}
	updateProjection() {
		if (model) {
			let m = this.view.arr44,
				c = model.center.xyz,
				depthZ = -m[2] * c[0] - m[6] * c[1] - m[10] * c[2] - m[14];

			this.farPlane = depthZ + model.maxR * this.curZoom;
			this.nearPlane = depthZ - model.maxR * this.curZoom;
		}

		this.projection.createOrtho(-canvas.width / 2, canvas.width / 2, -canvas.height / 2, canvas.height / 2, this.nearPlane, this.farPlane);
	}
	updateDepth() {
		// get center depth
		let off = Math.round(gl.drawingBufferHeight / 2) * gl.drawingBufferWidth * 4 + Math.round(gl.drawingBufferWidth / 2) * 4,
			d = 0;

		if (hover.pixels) {
			let depthColor = hover.pixels.slice(off, off + 4);
			d = hover.getID(depthColor) / hover.total_shift;
		}
		if (d <= 0 || d > 1) {
			this.initCenter.copy(this.curCenter);
			return;
		}

		let depthZ = d * this.farPlane + this.nearPlane * (1 - d);
		this.curCenter.scaleAndAdd(this.curQ.zAxis, -depthZ / this.curZoom);
		this.view = glMat4.createView(this.curZoom, this.curCenter, this.curQ);
		this.updateProjection();
		this.updateView();

		this.initCenter.copy(this.curCenter);
	}
	updateView() {
		this.view = glMat4.createView(this.curZoom, this.curCenter, this.curQ);
		this.PV = glMat4.multiply(this.projection, this.view);
		this.normMat.fromQuaternionNorm(this.curQ);
		this.viewCoord.fromQuaternionVC(this.curQ, this.viewSizeCoord);
		render.setMatrixUniforms();
	}
	update() {
		// Animation for View Change
		if (this.isAnimate) {
			this.animate();

			this.updateView();
			if (!this.isAnimate) { // Animation finished
				this.needUpdate = false;
				render.noMovementUpdate();
			}
			return false;
		}

		if (this.needUpdateProjection == true) {
			this.needUpdateProjection = false;
			this.updateProjection();
		}

		if (this.needUpdate == true) {
			//Rotation
			if (glCameraMove.state == glCameraMove.ROTATE) {
				this.curQ.from2AngleAxis(this.right, this.rotX, this.up, this.rotY);
				this.updateProjection();
			}

			//Spin
			if (glCameraMove.state == glCameraMove.SPIN) {
				this.curQ.fromAngleAxis(this.fwd, this.rotZ);
				this.curQ.multiply(this.quat);
			}

			//Pan
			if (glCameraMove.state == glCameraMove.PAN) {
				this.curCenter = glVec3.scaleAndAdd(this.initCenter, 1, this.curQ.xAxis, -this.panX, this.curQ.yAxis, this.panY);
			}

			//Zoom
			if (glCameraMove.state == glCameraMove.ZOOM)
				this.updateProjection();

			this.updateView();

			// Handle wheel zoom
			if (glCameraMove.isWheelZoom) {
				glCameraMove.isWheelZoom = false;
				glCameraMove.set(glCameraMove.NONE);
			}
		}
	}
	animate() {
		this.animateF += 0.05;
		if (this.animateF >= 1.0) {
			this.curQ.copy(this.animQ);
			this.curZoom = this.animZoom;
			this.updateProjection();
			this.curCenter.copy(this.animCenter);
			this.initCenter.copy(this.animCenter);

			this.right.copy(this.curQ.xAxis);
			this.up.copy(this.curQ.yAxis);
			this.fwd.copy(this.curQ.zAxis);

			this.isAnimate = false;
			this.animateF = 0;

			return false;
		}

		this.curQ = glQuat.slerp(this.initQ, this.animQ, this.animateF);
		this.curZoom = (1 - this.animateF) * this.initZoom + this.animateF * this.animZoom;
		this.updateProjection();
		this.curCenter = glVec3.lerp(this.initCenter, this.animCenter, this.animateF);
	}
	saveAnimateCameraStage() {
		this.rotX = 0;
		this.rotY = 0;
		this.rotZ = 0;
		this.panX = 0;
		this.panY = 0;

		this.initQ.copy(this.curQ);
		this.initCenter.copy(this.curCenter);
		this.initZoom = this.curZoom;

		this.animQ.copy(this.curQ);
		this.animCenter.copy(this.curCenter);
		this.animZoom = this.curZoom;

		this.animateF = 0;
		this.isAnimate = true;
	}
	//Ribbon Buttons
	setViewTo(direction) {
		switch (direction) {
			case 'Front':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PiOver2, 0, -$glMath.PiOver2]);
				break;
			case 'Back':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PiOver2, 0, $glMath.PiOver2]);
				break;
			case 'Left':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PiOver2, 0, 0]);
				break;
			case 'Right':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([-$glMath.PiOver2, $glMath.PI, 0]);
				break;
			case 'Top':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([0, 0, 0]);
				break;
			case 'Bottom':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PI, 0, 0]);
				break;
			case 'ISO':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PiOver4, 0, -$glMath.PI / 6]);
		}
	}
	fitZoom() {
		if (!model) return;

		let screenCoords = model.getScreenCoords(),
			maxX, minX, maxY, minY, off;

		for (const [key, node] of Object.entries(fmNodesDict)) {
			if (node.groupShow && node.show) {
				off = node.glID * 4;
				if (screenCoords[off] > maxX || !maxX) maxX = screenCoords[off];
				if (screenCoords[off] < minX || !minX) minX = screenCoords[off];
				if (screenCoords[off + 1] > maxY || !maxY) maxY = screenCoords[off + 1];
				if (screenCoords[off + 1] < minY || !minY) minY = screenCoords[off + 1];
			}
		}

		let scale = Math.max((maxX - minX) / 2, (maxY - minY) / 2) * 1.1,
			xOff = (maxX + minX) * canvas.width / this.curZoom / 4,
			yOff = (maxY + minY) * canvas.height / this.curZoom / 4;

		this.saveAnimateCameraStage();
		this.animCenter = glVec3.scaleAndAdd(this.curCenter, 1, this.curQ.xAxis, xOff);
		this.animCenter.scaleAndAdd(this.curQ.yAxis, yOff);
		this.animZoom = this.curZoom / scale;
	}
}