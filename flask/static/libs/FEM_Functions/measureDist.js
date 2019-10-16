class $measureDist {
	constructor(oldMe = this) {
		this.selectNode1 = sideBar.addSelect(
			oldMe.selectNode1, /*object*/
			'Select 1st Node:', /*caption*/
			'', /*inpVal*/
			selectFilter.NODES, /*selec type*/
			true /*focus*/
		);

		this.selectNode2 = sideBar.addSelect(
			oldMe.selectNode2, /*object*/
			'Select 2nd Node:', /*caption*/
			'', /*inpVal*/
			selectFilter.NODES, /*selec type*/
			false /*focus*/
		);

		let row = sideBar.addBtnRow();
		this.applyBtn = sideBar.addButton(
			oldMe.applyBtn, /*object*/
			'Apply', /*caption*/
			row, /*parent*/
			this.apply /*callback*/
		);
		this.clearBtn = sideBar.addButton(
			oldMe.clearBtn, /*object*/
			'Clear All', /*caption*/
			row, /*parent*/
			this.clearAll /*callback*/
		);
	}
	//CallBacks
	apply(e) {
		let self = measureDist,
			nodeList1 = new fmList(),
			nodeList2 = new fmList();

		nodeList1.readList(self.selectNode1.value);
		nodeList2.readList(self.selectNode2.value);

		let p1 = nodeList1.nodeArr[0].coords,
			p2 = nodeList2.nodeArr[0].coords,
			centr = glVec3.average(p1, p2),
			dist = glVec3.sub(p1, p2).length;

		measure.addPoint(p1);
		measure.addPoint(p2);

		measure.addLine(p1, p2);
		glText.measureCoords.push(...centr.xyz);
		glText.measureText.push(dist.toFixed(2));

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

var measureDist = new $measureDist();