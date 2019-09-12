var fmVectors = {
	arrows: [],
	addVector: function (origin, vec, value, color, isMoment = false) {
		let sgn = Math.sign(value),
			arrow = new glArrow();

		arrow.value = value;
		arrow.origin = [...origin, 1];
		arrow.direction = [sgn * vec[0], sgn * vec[1], sgn * vec[2]];
		if (isMoment)
			arrow.addMomArrow();
		else
			arrow.addArrow();
		arrow.color = color;
		arrow.size = 0.1;
		arrow.initBuffers();

		glText.vectorText.push(value.toFixed(2));

		this.arrows.push(arrow);
	},
	getTextCoords: function (textCoords, start) {
		let off = start,
			scale = 3 * 17 / camera.curZoom;
		for (const arrow of fmVectors.arrows) {
			textCoords[off] = arrow.origin[0] + arrow.direction[0] * scale;
			textCoords[off + 1] = arrow.origin[1] + arrow.direction[1] * scale;
			textCoords[off + 2] = arrow.origin[2] + arrow.direction[2] * scale;
			off += 3;
		}
	}
};