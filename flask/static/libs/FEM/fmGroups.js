fmGroupsDict = {};

class fmGroup {
	constructor(name) {
		this.name = name;
		this.list = new fmList();
	}
	addShow() {
		for (const elm of this.list.elmArr) {
			elm.groupShow++;
		}
		for (const node of this.list.nodeArr) {
			node.groupShow++;
		}
	}
	toggleSelection(s, multiple = false) {
		for (const elm of this.list.elmArr) {
			if (s) {
				elm.groupSelect++;
			} else {
				elm.groupSelect--;
			}

			if (elm.groupShow) {
				elm.setStage();
			}
		}

		for (const node of this.list.nodeArr) {
			if (s) {
				node.groupSelect++;
			} else {
				node.groupSelect--;
			}

			if (node.groupShow) {
				node.setStage();
			}
		}

		if (!multiple) {
			model.updateStages();
		}
	}
	toggleVisibility(v, s, multiple = false) {
		for (const elm of this.list.elmArr) {
			if (v) {
				elm.groupShow++;
				//if(s){elm.groupSelect ++;}
			} else {
				elm.groupShow--;
				//if(s){elm.groupSelect --;}
			}
			if (!elm.groupShow || elm.groupShow == 1) {
				elm.setStage();
			}
		}

		for (const node of this.list.nodeArr) {
			if (v) {
				node.groupShow++;
				if (s) {
					node.groupSelect++;
				}
			} else {
				node.groupShow--;
				if (s) {
					node.groupSelect--;
				}
			}
			if (!node.groupShow || node.groupShow == 1) {
				node.setStage();
			}
		}

		if (!multiple) {
			model.updateStages();
			model.updateSelectStages();
		}
	}
}