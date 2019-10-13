class $glHover {
	constructor() {
		// Get the precision of each color component
		this.red_scale = Math.pow(2, gl.getParameter(gl.RED_BITS));
		this.green_scale = Math.pow(2, gl.getParameter(gl.GREEN_BITS));
		this.blue_scale = Math.pow(2, gl.getParameter(gl.BLUE_BITS));
		this.alpha_scale = Math.pow(2, gl.getParameter(gl.ALPHA_BITS));

		this.total_shift = Math.pow(2, gl.getParameter(gl.RED_BITS) + gl.getParameter(gl.GREEN_BITS) + gl.getParameter(gl.BLUE_BITS) + gl.getParameter(gl.ALPHA_BITS));
		this.red_shift = Math.pow(2, gl.getParameter(gl.GREEN_BITS) + gl.getParameter(gl.BLUE_BITS) + gl.getParameter(gl.ALPHA_BITS));
		this.green_shift = Math.pow(2, gl.getParameter(gl.BLUE_BITS) + gl.getParameter(gl.ALPHA_BITS));
		this.blue_shift = Math.pow(2, gl.getParameter(gl.ALPHA_BITS));

		this.pixels = null; // read pixeles from the screen

		this.item = null; // hovered node or element	
		this.id = null;
		this.type = null;

		this.vao = null;
		this.coords = new Float32Array(18);
		this.barycentric = null;
		this.bufferCoords = null;
		this.bufferBarycentric = null;

		//Create and bind vertex array object (attribute state)
		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		//Bind coordinates
		this.bufferCoords = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCoords);
		gl.enableVertexAttribArray(render.shaderHover.aPosition);
		gl.vertexAttribPointer(render.shaderHover.aPosition, 3, gl.FLOAT, false, 0, 0);

		//Bind barycentric
		this.bufferBarycentric = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferBarycentric);
		gl.enableVertexAttribArray(render.shaderHover.aBarycentric);
		gl.vertexAttribPointer(render.shaderHover.aBarycentric, 3, gl.FLOAT, false, 0, 0);

		// Delete bufferes
		gl.bindVertexArray(null);

		// Event listeners
		selectCanvas.onmouseup = this.onHoverMouseUp;
	}
	getID(inpC) {
		// Shift each component to its bit position in the integer
		return (inpC[0] * this.red_shift + inpC[1] * this.green_shift + inpC[2] * this.blue_shift + inpC[3]);
	}
	createColor(id) {
		let r = Math.floor(id / this.red_shift);
		id -= r * this.red_shift;

		let g = Math.floor(id / this.green_shift);
		id -= g * this.green_shift;

		let b = Math.floor(id / this.blue_shift);
		id -= b * this.blue_shift;

		let a = id;

		return [
			r / (this.red_scale - 1),
			g / (this.green_scale - 1),
			b / (this.blue_scale - 1),
			a / (this.alpha_scale - 1)
		];
	}
	mouseHover() {
		if (!model) return;

		let off = (gl.drawingBufferHeight - MouseState.y) * gl.drawingBufferWidth * 4 + MouseState.x * 4,
			hoverIndex = this.getID(this.pixels.slice(off, off + 4));

		if (hoverIndex > 0) {
			let id = Math.floor(hoverIndex / 10),
				type = hoverIndex % 10,
				bufferLen = type == 4 ? (type + 2) * 3 : type * 3;

			if (!selection.isPassFilter(type)) {
				return;
			}

			if (id != this.id || type != this.type) {
				this.id = id;
				this.type = type;

				if (type == 1) {
					this.item = fmNodesDict[id];
					this.coords.append(this.item.coords.xyz, 0);
				} else {
					this.item = fmElemsDict[id];
					this.coords.append(this.item.glCoords, 0);
				}

				switch (type) {
					case 1:
						this.barycentric = BARYCENTRIC.NODE;
						break;
					case 2:
						this.barycentric = BARYCENTRIC.BAR;
						break;
					case 3:
						this.barycentric = BARYCENTRIC.TRIA;
						break;
					case 4:
						this.barycentric = BARYCENTRIC.QUAD;
				}

				gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCoords);
				gl.bufferData(gl.ARRAY_BUFFER, this.coords, gl.DYNAMIC_DRAW, 0, bufferLen);

				gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferBarycentric);
				gl.bufferData(gl.ARRAY_BUFFER, this.barycentric, gl.DYNAMIC_DRAW);
			}
		} else {
			this.clear();
		}
	}
	draw() {
		gl.useProgram(render.shaderHover.program);
		gl.uniform1f(render.shaderHover.uPointSize, render.nodeHoverSize);
		gl.uniform4fv(render.shaderHover.uColor, render.hoverColor);

		if (render.shrink == true) {
			gl.uniform1f(render.shaderHover.uShrink, render.shrinkLevel);
		} else {
			gl.uniform1f(render.shaderHover.uShrink, 0.0);
		}

		gl.bindVertexArray(this.vao);

		switch (this.type) {
			case 1:
				gl.depthFunc(gl.ALWAYS);
				gl.drawArrays(gl.POINTS, 0, 1);
				gl.depthFunc(gl.LEQUAL);
				break;
			case 2:
				gl.drawArrays(gl.LINES, 0, 2);
				break;
			case 3:
				gl.drawArrays(gl.TRIANGLES, 0, 3);
				break;
			case 4:
				gl.drawArrays(gl.TRIANGLES, 0, 6);
				break;
		}
	}
	leftClick() {
		if (!this.item && selection.textBox)
			selection.textBox.blur();

		if (!model || !this.item || !selection.textBox) {
			return;
		}

		if (!KeyboardState.Shift) {
			selection.selectList = new fmList();
		}
		if (selection.filter == selectFilter.NONE || selection.filter == selectFilter.NODES) {
			if (this.type == 1)
				selection.selectList.nodeArr.push(this.item);
		}

		if (selection.filter == selectFilter.NONE || selection.filter > selectFilter.NODES && selection.isPassFilter(this.item.nodeCount)) {
			if (this.type > 1)
				selection.selectList.elmArr.push(this.item);
		}

		selection.setTextBox();
	}
	clear() {
		this.id = null;
		this.type = null;
		this.item = null;
	}
	// Event Left Click
	onHoverMouseUp(event) {
		if (event.button == 0 && !MouseState.hold) { // leftClick
			if (selection.textBox) {
				hover.leftClick();
			}
		}
	}
}