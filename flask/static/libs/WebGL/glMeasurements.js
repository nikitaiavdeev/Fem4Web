class $glMeasurements {
	constructor() {
		this.lineVao = null;
		this.lineBufferCoords = null;
		this.lineCoords = new Float32Array();

		this.pointVao = null;
		this.pointBufferCoords = null;
		this.pointCoords = new Float32Array();

		//Create and bind vertex array object (attribute state)
		this.pointVao = gl.createVertexArray();
		gl.bindVertexArray(this.pointVao);

		//Bind coordinates
		this.pointBufferCoords = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBufferCoords);
		gl.enableVertexAttribArray(render.shaderHover.aPosition);
		gl.vertexAttribPointer(render.shaderHover.aPosition, 3, gl.FLOAT, false, 0, 0);

		// The same for lines
		this.lineVao = gl.createVertexArray();
		gl.bindVertexArray(this.lineVao);

		//Bind coordinates
		this.lineBufferCoords = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBufferCoords);
		gl.enableVertexAttribArray(render.shaderHover.aPosition);
		gl.vertexAttribPointer(render.shaderHover.aPosition, 3, gl.FLOAT, false, 0, 0);

		// Delete bufferes
		gl.bindVertexArray(null);
	}
	addLine(p1, p2) {
		this.lineCoords = this.lineCoords.concat(p1.xyz || p1, p2.xyz || p2);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBufferCoords);
		gl.bufferData(gl.ARRAY_BUFFER, this.lineCoords, gl.DYNAMIC_DRAW);
	}
	addPoint(p) {
		this.pointCoords = this.pointCoords.concat(p.xyz || p);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBufferCoords);
		gl.bufferData(gl.ARRAY_BUFFER, this.pointCoords, gl.DYNAMIC_DRAW);
	}
	draw() {
		gl.useProgram(render.shaderHover.program);
		gl.uniform1f(render.shaderHover.uPointSize, render.nodeMeasureSize);
		gl.uniform4fv(render.shaderHover.uColor, render.measureColor);
		gl.uniform1f(render.shaderHover.uShrink, 0.0);
		gl.depthFunc(gl.ALWAYS);

		if (this.lineCoords.length > 0) {
			gl.bindVertexArray(this.lineVao);
			gl.drawArrays(gl.LINES, 0, this.lineCoords.length / 3);
		}

		if (this.pointCoords.length > 0) {
			gl.bindVertexArray(this.pointVao);
			gl.drawArrays(gl.POINTS, 0, this.pointCoords.length / 3);
		}

		gl.depthFunc(gl.LEQUAL);
		gl.bindVertexArray(null);
	}
}