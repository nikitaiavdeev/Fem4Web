class $glText {
	constructor() {
		this.screenCoords = [];

		this.nodeText = [];
		this.nodeCoords = [];

		this.elmText = [];
		this.elmCoords = [];

		this.measureText = [];
		this.measureCoords = [];

		this.elmPropText = [];
		this.elmPropCoords = [];

		this.vectorText = [];

		this.needUpdate = true;
	}
	updateLocations() {
		let off = 0;

		this.needUpdate = true;
		let count = this.nodeText.length + this.elmText.length + this.measureText.length + this.elmPropText.length + this.vectorText.length;
		if (count < 1)
			return;

		this.screenCoords = new Float32Array(count * 4);
		let coords = new Float32Array(count * 3);
		if (this.nodeCoords) {
			coords.append(this.nodeCoords, off);
			off += this.nodeCoords.length;
		}
		if (this.elmCoords) {
			coords.append(this.elmCoords, off);
			off += this.elmCoords.length;
		}
		if (this.measureCoords) {
			coords.append(this.measureCoords, off);
			off += this.measureCoords.length;
		}
		if (this.elmPropCoords) {
			coords.append(this.elmPropCoords, off);
			off += this.elmPropCoords.length;
		}
		if (this.vectorText) {
			fmVectors.getTextCoords(coords, off);
		}

		//Get text locations in screen
		gl.useProgram(render.shaderModel.program);

		let bufferCoordsTrans = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoordsTrans);
		gl.bufferData(gl.ARRAY_BUFFER, this.screenCoords, gl.STREAM_READ);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, render.tf);
		gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufferCoordsTrans);

		gl.beginTransformFeedback(gl.POINTS);

		//Create buffer for text coords
		let bufferCoords = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
		gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderModel.aPosition);
		gl.vertexAttribPointer(render.shaderModel.aPosition, 3, gl.FLOAT, false, 0, 0);

		gl.enable(gl.RASTERIZER_DISCARD);
		gl.drawArrays(gl.POINTS, 0, count);
		gl.endTransformFeedback();
		gl.disable(gl.RASTERIZER_DISCARD);

		gl.finish();
		gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.screenCoords);
		gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		//Delete buffers
		gl.deleteBuffer(bufferCoordsTrans);
		gl.deleteBuffer(bufferCoords);
	}
	drawText() {
		let start = 0;

		if (glCameraMove.state != glCameraMove.NONE) {
			this.needUpdate = true;
		}

		if (!this.needUpdate) {
			return;
		}

		if (glCameraMove.state == glCameraMove.NONE) {
			this.needUpdate = false;
		}

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.save();

		ctx.font = "16px Arial";

		if (glCameraMove.state == glCameraMove.NONE) {
			ctx.fillStyle = 'rgb(255, 125, 0)';
			start += this.drawArrText(start, this.nodeText);

			ctx.fillStyle = 'rgb(255, 255, 0)';
			start += this.drawArrText(start, this.elmText);

			ctx.fillStyle = 'rgb(255, 0, 0)';
			start += this.drawArrText(start, this.measureText);

			ctx.fillStyle = 'rgb(255, 0, 150)';
			start += this.drawArrText(start, this.elmPropText);

			ctx.fillStyle = 'rgb(255, 0, 0)';
			start += this.drawArrText(start, this.vectorText);
		}

		let x = camera.curQ.xAxis.xyz,
			y = camera.curQ.yAxis.xyz;

		ctx.font = "14px Arial";
		// translate the canvas origin so 0, 0 is at
		// the top front right corner of our F
		ctx.translate(77, ctx.canvas.height - 55);

		// Axis x
		ctx.font = "14px Arial";

		ctx.fillStyle = 'rgb(255,0,0)';
		ctx.fillText("X", x[0] * 50, -y[0] * 50);

		// Axis y
		ctx.fillStyle = 'rgb(0,255,0)';
		ctx.fillText("Y", x[1] * 50, -y[1] * 50);

		// Axis z
		ctx.fillStyle = 'rgb(0,170,255)';
		ctx.fillText("Z", x[2] * 50, -y[2] * 50);
		// restore the canvas to its old settings.
		ctx.restore();
	}
	drawArrText(start, arr) {
		let x, y, off = 0;
		for (let i = 0; i < arr.length; i++) {
			off = start + i * 4;
			x = this.screenCoords[off];
			y = this.screenCoords[off + 1];
			if (x.between(-1, 1) && y.between(-1, 1)) {
				ctx.fillText(arr[i], (x + 1) / 2 * ctx.canvas.width, (1 - y) / 2 * ctx.canvas.height);
			}
		}

		return arr.length * 4;
	}
	drawSelect() {
		csel.clearRect(0, 0, csel.canvas.width, csel.canvas.height);
		csel.save();
		if (MouseState.hold) {
			csel.beginPath();
			csel.strokeStyle = 'rgb(255, 125, 0)';
			csel.rect(MouseState.prevX, MouseState.prevY, MouseState.x - MouseState.prevX, MouseState.y - MouseState.prevY);
			csel.stroke();
		}
		csel.restore();
	}
}

const glText = new $glText();