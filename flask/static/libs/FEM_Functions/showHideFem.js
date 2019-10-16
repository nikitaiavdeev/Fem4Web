class $showHideFem {
	constructor(oldMe = this) {
		this.selectFem = sideBar.addSelect(
			oldMe.selectFem, /*object*/
			'Select FEM:', /*caption*/
			'', /*inpVal*/
			selectFilter.NONE, /*selec type*/
			true /*focus*/
		);

		let row = sideBar.addBtnRow();
		this.showBtn = sideBar.addButton(
			oldMe.showBtn, /*object*/
			'Show', /*caption*/
			row, /*parent*/
			this.show /*callback*/
		);
		this.hideBtn = sideBar.addButton(
			oldMe.hideBtn, /*object*/
			'Hide', /*caption*/
			row, /*parent*/
			this.hide /*callback*/
		);

		row = sideBar.addBtnRow();
		this.showAllBtn = sideBar.addButton(
			oldMe.showAllBtn, /*object*/
			'Show All', /*caption*/
			row, /*parent*/
			this.showAll /*callback*/
		);
		this.hideAllBtn = sideBar.addButton(
			oldMe.hideAllBtn, /*object*/
			'Hide All', /*caption*/
			row, /*parent*/
			this.hideAll /*callback*/
		);
	}
	showHide(nodeArr, elmArr, isShow = true) {
		for (const node of nodeArr) {
			node.show = isShow;
			node.setStage();
		}

		for (const elm of elmArr) {
			elm.show = isShow;
			elm.setStage();
		}
		model.updateStages();
		model.updateSelectStages();
	}
	showHideAll(isShow) {
		for (const [key, node] of Object.entries(fmNodesDict)) {
			node.show = isShow;
			node.setStage();
		}

		for (const [key, elm] of Object.entries(fmElemsDict)) {
			elm.show = isShow;
			elm.setStage();
		}
		model.updateStages();
		model.updateSelectStages();
	}
	//CallBacks
	show(e) {
		let self = showHideFem,
			femList = new fmList();
		femList.readList(self.selectFem.value);

		self.showHide(femList.nodeArr, femList.elmArr);
	}
	hide(e) {
		let self = showHideFem,
			femList = new fmList();
		femList.readList(self.selectFem.value);

		self.showHide(femList.nodeArr, femList.elmArr, false);
	}
	showAll(e) {
		let self = showHideFem;
		self.showHideAll(true);
	}
	hideAll(e) {
		let self = showHideFem;
		self.showHideAll(false);
	}
}

var showHideFem = new $showHideFem();