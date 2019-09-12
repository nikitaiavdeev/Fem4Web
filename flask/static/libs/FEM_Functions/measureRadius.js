class $measureRadius {
	constructor() {
		sideBar.currentObject = this;
		
		this.selectNode1 = sideBar.addSelect(
			/*object*/		this.selectNode1,
			/*caption*/ 	'Select 1st Node:',
			/*inpVal*/		'',
			/*selec type*/ 	selectFilter.NODES,
			/*focus*/ 		true
		);
	
		this.selectNode2 = sideBar.addSelect(
				/*object*/		this.selectNode2,
				/*caption*/ 	'Select 2nd Node:', 
				/*inpVal*/		'',
				/*selec type*/ 	selectFilter.NODES,
				/*focus*/ 		false
			);
		
		this.selectNode3 = sideBar.addSelect(
				/*object*/		this.selectNode3,
				/*caption*/ 	'Select 3rd Node:',
				/*inpVal*/		'',
				/*selec type*/ 	selectFilter.NODES,
				/*focus*/ 		false
			);
		
		let row = sideBar.addBtnRow();
		this.applyBtn = sideBar.addButton(
				/*object*/		this.applyBtn,
				/*caption*/ 	'Apply',
				/*parent*/ 		row, 
				/*callback*/ 	this.apply
			);
		this.clearBtn = sideBar.addButton(
				/*object*/		this.clearBtn,
				/*caption*/ 	'Clear All',
				/*parent*/ 		row, 
				/*callback*/	this.clearAll
			);
	}
	//CallBacks
	apply(e) {
		let self = measureRadius,
			nodeList1 = new fmList(),
			nodeList2 = new fmList(),
			nodeList3 = new fmList();

		nodeList1.readList(self.selectNode1.value);
		nodeList2.readList(self.selectNode2.value);
		nodeList3.readList(self.selectNode3.value);

		let p1 = nodeList1.nodeArr[0].coords,
			p2 = nodeList2.nodeArr[0].coords,
			p3 = nodeList3.nodeArr[0].coords,
			v1 = glVec3.sub(p1, p2),
			v2 = glVec3.sub(p2, p3),
			v3 = glVec3.sub(p3, p1),
			l1 = v1.length,
			l2 = v2.length,
			l3 = v3.length,
			l12 = l1 * l1,
			l22 = l2 * l2,
			l32 = l3 * l3,
			c1 = l22 * (l12 + l32 - l22) / ((l1 + l3) ** 2 - l22) / (l22 - (l1 - l3) ** 2),
			c2 = l32 * (l22 + l12 - l32) / ((l2 + l1) ** 2 - l32) / (l32 - (l2 - l1) ** 2),
			c3 = l12 * (l22 + l32 - l12) / ((l2 + l3) ** 2 - l12) / (l12 - (l2 - l3) ** 2),
			centr = glVec3.scaleAndAdd(p1, c1, p2, c2, p3, c3),
			r = glVec3.sub(centr, p1).length,
			axis = glVec3.cross(v2, v3).normalize().xyz;

		measure.addPoint(p1);
		measure.addPoint(p2);
		measure.addPoint(p3);

		v1 = glVec3.sub(p1, centr);
		v2 = glVec3.sub(p2, centr);
		v3 = glVec3.sub(p3, centr);
		l1 = 1 / v1.length;
		l2 = 1 / v2.length;
		l3 = 1 / v3.length;

		let angle13 = Math.acos(glVec3.dot(v1, v3) * l1 * l3),
			angle21 = Math.acos(glVec3.dot(v2, v1) * l2 * l1),
			angle23 = Math.acos(glVec3.dot(v2, v3) * l2 * l3);

		if (Math.abs(angle13 - angle21 - angle23) > 0.01)
			angle13 = 2 * Math.PI - angle13;

		let n = Math.ceil(angle13 / 0.1),
			da = angle13 / 2 / n, //delata angle
			c = Math.cos(da),
			s = Math.sin(da),
			rot = [
				[c + (1 - c) * axis[0] ** 2, (1 - c) * axis[0] * axis[1] - s * axis[2], (1 - c) * axis[0] * axis[2] + s * axis[1]],
				[(1 - c) * axis[0] * axis[1] + s * axis[2], c + (1 - c) * axis[1] ** 2, (1 - c) * axis[1] * axis[2] - s * axis[0]],
				[(1 - c) * axis[0] * axis[2] - s * axis[1], (1 - c) * axis[1] * axis[2] + s * axis[0], c + (1 - c) * axis[2] ** 2]
			];

		for (let i = 0; i < 2 * n; i++) {
			v1 = glMat33.vecMult(rot, v1);
			p2 = glVec3.add(v1, centr);
			measure.addLine(p1, p2);

			if (i == n - 1) {
				measure.addLine(centr, p2);
				glText.measureCoords.push(...glVec3.average(centr, p2).xyz);
				glText.measureText.push(r.toFixed(2));
			}

			p1 = p2;
		}

		glText.updateLocations();
	}
	clearAll(e) {
		glText.measureCoords = [];
		glText.measureText = [];
		glText.updateLocations();

		measure.lineCoords = [];
		measure.pointCoords = [];
	}
}

const measureRadius = new $measureRadius();