class $showElmProp {
	constructor(oldMe = this) {
		this.selectElements = sideBar.addSelect(
			oldMe.selectElements, /*object*/
			'Select Elements:', /*caption*/
			'', /*inpVal*/
			selectFilter.ELEMENTS, /*selec type*/
			true /*focus*/
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
		let self = showElmProp,
			elmList = new fmList(),
			tmpProp, tmpMat, text;

		elmList.readList(self.selectElements.value);

		for (const elm of elmList.elmArr) {
			tmpProp = fmPropDict[elm.pid];
			tmpMat = fmMatDict[tmpProp.mid];

			if (elm.type == 'CROD')
				text = 'A=' + tmpProp.a;
			else if (elm.type == 'CQUAD4' || elm.type == 'CTRIA3' || elm.type == 'CSHEAR')
				text = 't=' + tmpProp.t;
			text += '; E=' + tmpMat.e + '; nu=' + tmpMat.nu;

			glText.elmPropCoords.push(...elm.centroid.xyz);
			glText.elmPropText.push(text);
		}

		glText.updateLocations();
	}
	clearAll(e) {
		glText.elmPropCoords = [];
		glText.elmPropText = [];
		glText.updateLocations();
	}
}

var showElmProp = new $showElmProp();