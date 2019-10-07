const selectFilter = {
	NONE: 0,
	NODES: 1,
	BARS: 2,
	TRIAS: 3,
	QUADS: 4,
	ELEMENTS: 5,
	SHELLS: 6
};

class $glSelection {
	constructor() {
		this.filter = selectFilter.NONE;
		this.screenCoords = null;

		// TextBox select
		this.textBox = null;
		this.selectList = new fmList();
	}
	multiSelection() {
		let rX1 = Math.min(MouseState.prevX, MouseState.x) / canvas.width * 2 - 1,
			rY1 = -Math.max(MouseState.prevY, MouseState.y) / canvas.height * 2 + 1,
			rX2 = Math.max(MouseState.prevX, MouseState.x) / canvas.width * 2 - 1,
			rY2 = -Math.min(MouseState.prevY, MouseState.y) / canvas.height * 2 + 1,
			off;

		if (!model) {
			return;
		}

		if (!KeyboardState.Shift) {
			this.selectList = new fmList();
		}

		this.screenCoords = model.getScreenCoords();

		//Nodes
		if (this.filter == selectFilter.NONE || this.filter == selectFilter.NODES) {
			for (const [key, node] of Object.entries(fmNodesDict)) {
				if (node.groupShow && node.show) {
					off = node.glID * 4;
					if (this.screenCoords[off].between(rX1, rX2) && this.screenCoords[off + 1].between(rY1, rY2)) {
						this.selectList.nodeArr.push(node);
					}
				}
			}
		}

		//Elements
		if (this.filter == selectFilter.NONE || this.filter > selectFilter.NODES) {
			for (const [key, node] of Object.entries(fmElemsDict)) {
				if (elm.groupShow && elm.show) {
					if (!this.isPassFilter(elm.nodeCount)) {
						continue;
					}
					if (this.elmIntersect(elm, rX1, rX2, rY1, rY2)) {
						this.selectList.elmArr.push(elm);
					}
				}
			}
		}

		this.screenCoords = [];
		this.setTextBox();
	}
	setTextBox() {
		if (this.textBox) {
			this.clearSelection(false);
			this.setSelection();

			this.textBox.value = '';

			if (this.selectList.nodeArr.length) {
				this.selectList.fromArr();
				this.textBox.value = 'Node' + this.selectList.nodeList;
			}

			if (this.selectList.elmArr.length) {
				if (this.textBox.value)
					this.textBox.value += ' ';
				this.selectList.fromArr(false);
				this.textBox.value += 'Element' + this.selectList.elmList;
			}
			this.textBox.scrollLeft = this.textBox.scrollWidth;
			this.textBox.setSelectionRange(this.textBox.value.length, this.textBox.value.length);
		}
	}
	elmIntersect(elm, rX1, rX2, rY1, rY2) {
		let off, x = [],
			y = [],
			rX = [rX1, rX2, rX2, rX1, rX1],
			rY = [rY1, rY1, rY2, rY2, rY1];

		//Nodes inside rectangle
		for (let i = 0; i < elm.nodeCount; i++) {
			off = elm.con[i] * 4;
			x.push(this.screenCoords[off]);
			y.push(this.screenCoords[off + 1]);
			if (x[i].between(rX1, rX2) && y[i].between(rY1, rY2)) {
				return true;
			}
		}

		//rectangle inside Triangle/Quad
		if (elm.nodeCount > 2) {
			off = elm.con[0] * 4;
			x.push(this.screenCoords[off]);
			y.push(this.screenCoords[off + 1]);

			for (let i = 0; i < 4; i++) {
				if (this.pointInside(rX[i], rY[i], x, y)) {
					return true;
				}
			}
		}

		//Intersect
		for (let i = 0; i < x.length - 1; i++) { //elm edge
			for (let j = 0; j < 4; j++) { //rectangle edge
				if (this.linesIntersect(x[i], y[i], x[i + 1], y[i + 1], rX[j], rY[j], rX[j + 1], rY[j + 1])) {
					return true;
				}
			}
		}

		return false;
	}
	linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
		let d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (d == 0) {
			return false;
		}
		let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
		let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d;
		return t.between(0, 1) && u.between(0, 1);
	}
	pointInside(x1, y1, x, y) {
		let s, s0;

		for (let i = 0; i < x.length - 1; i++) {
			s = this.sign(x1, y1, x[i], y[i], x[i + 1], y[i + 1]);
			if (s == 0) {
				return false;
			}
			if (i == 0) {
				s0 = s;
			} else if (s * s0 < 0) {
				return false;
			}
		}
		return true;
	}
	sign(x1, y1, x2, y2, x3, y3) {
		return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
	}
	setSelection() {
		for (const node of this.selectList.nodeArr) {
			node.select = true;
			node.setStage();
		}
		for (const elm of this.selectList.elmArr) {
			elm.select = true;
			elm.setStage();
		}
		model.updateStages();
	}
	clearSelection(update = true) {
		for (const [key, node] of Object.entries(fmNodesDict)) {
			node.select = false;
			node.setStage();
		}
		for (const [key, node] of Object.entries(fmElemsDict)) {
			elm.select = false;
			elm.setStage();
		}
		if (update)
			model.updateStages();
	}
	isPassFilter(inpType) {
		if (this.filter == selectFilter.NONE) {
			return true;
		} else if (this.filter == inpType) {
			return true;
		} else if (this.filter == selectFilter.ELEMENTS && inpType > 1) {
			return true;
		} else if (this.filter == selectFilter.SHELLS && (inpType == 3 || inpType == 4)) {
			return true;
		} else {
			return false;
		}
	}
}