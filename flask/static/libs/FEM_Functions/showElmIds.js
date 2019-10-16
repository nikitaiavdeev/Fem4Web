class $showElmIds {
	constructor(oldMe = this) {
		this.selectNodes = sideBar.addSelect(
			oldMe.selectNodes, /*object*/
			'Select Nodes:', /*caption*/
			'', /*inpVal*/
			selectFilter.NODES, /*selec type*/
			true /*focus*/
		);

		this.selectElements = sideBar.addSelect(
			oldMe.selectElements, /*object*/
			'Select Elements:', /*caption*/
			'', /*inpVal*/
			selectFilter.ELEMENTS, /*selec type*/
			false /*focus*/
		);

		let row = sideBar.addRow();
		this.addElementNodes = sideBar.addCheckBox(
			oldMe.addElementNodes, /*object*/
			"Include Elm's Nodes:", /*caption*/
			true, /*isChecked*/
			row /*parent*/
		);

		row = sideBar.addBtnRow();
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
		let self = showElmIds,
			nodeList = new fmList(),
			elmList = new fmList();

		nodeList.readList(self.selectNodes.value);
		elmList.readList(self.selectElements.value);

		for (const node of nodeList.nodeArr) {
			glText.nodeCoords.push(...node.coords.xyz);
			glText.nodeText.push(node.id);
		}

		for (const elm of elmList.elmArr) {
			glText.elmCoords.push(...elm.centroid.xyz);
			glText.elmText.push(elm.id);
		}

		glText.updateLocations();
	}
	clearAll(e) {
		glText.nodeCoords = [];
		glText.nodeText = [];

		glText.elmCoords = [];
		glText.elmText = [];
		glText.updateLocations();
	}
}

var showElmIds = new $showElmIds();