class $showHideFem {
	constructor() {
		sideBar.currentObject = this;

		this.selectFem = sideBar.addSelect(
			/*object*/
			this.selectFem,
			/*caption*/
			'Select FEM:',
			/*inpVal*/
			'',
			/*selec type*/
			selectFilter.NONE,
			/*focus*/
			true
		);

		let row = sideBar.addBtnRow();
		this.showBtn = sideBar.addButton(
			/*object*/
			this.showBtn,
			/*caption*/
			'Show',
			/*parent*/
			row,
			/*callback*/
			this.show
		);
		this.hideBtn = sideBar.addButton(
			/*object*/
			this.hideBtn,
			/*caption*/
			'Hide',
			/*parent*/
			row,
			/*callback*/
			this.hide
		);

		row = sideBar.addBtnRow();
		this.showAllBtn = sideBar.addButton(
			/*object*/
			this.showAllBtn,
			/*caption*/
			'Show All',
			/*parent*/
			row,
			/*callback*/
			this.showAll
		);
		this.hideAllBtn = sideBar.addButton(
			/*object*/
			this.hideAllBtn,
			/*caption*/
			'Hide All',
			/*parent*/
			row,
			/*callback*/
			this.hideAll
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

const showHideFem = new $showHideFem();