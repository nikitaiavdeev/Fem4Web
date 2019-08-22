showHideFem = function (){
	this.init();
	sideBar.currentObject = this;
}

showHideFem.prototype = {
	init:function(){
		this.selectFem = sideBar.addSelect(
				/*object*/		this.selectFem,
				/*caption*/ 	'Select FEM:', 
				/*inpVal*/		'',
				/*selec type*/ 	selectFilter.NONE,
				/*focus*/ 		true
			);
		
		let row = sideBar.addBtnRow();
		this.showBtn = sideBar.addButton(
				/*object*/		this.showBtn,
				/*caption*/ 	'Show',
				/*parent*/ 		row, 
				/*callback*/ 	this.show
			);
		this.hideBtn = sideBar.addButton(
				/*object*/		this.hideBtn,
				/*caption*/ 	'Hide',
				/*parent*/ 		row, 
				/*callback*/	this.hide
			);
		
		row = sideBar.addBtnRow();
		this.showAllBtn = sideBar.addButton(
				/*object*/		this.showAllBtn,
				/*caption*/ 	'Show All',
				/*parent*/ 		row, 
				/*callback*/ 	this.showAll
			);
		this.hideAllBtn = sideBar.addButton(
				/*object*/		this.hideAllBtn,
				/*caption*/ 	'Hide All',
				/*parent*/ 		row, 
				/*callback*/	this.hideAll
			);
	},
	showHide:function(nodeArr, elmArr, isShow = true){
		for(node of nodeArr){
			node.show = isShow;
			node.setStage();
		}
		
		for(elm of elmArr){
			elm.show = isShow;
			elm.setStage();
		}
		model.updateStages();
		model.updateSelectStages();
	},
	//CallBacks
	show:function(e){
		let self = showHideFem,
			femList = new fmList;
		femList.readList(self.selectFem.value);
		
		self.showHide(femList.nodeArr, femList.elmArr);
	},
	showAll:function(e){
		let self = showHideFem;
		self.showHide(fmNodes, fmElems);
	},
	hide:function(e){
		let self = showHideFem,
			femList = new fmList;
		femList.readList(self.selectFem.value);
		
		self.showHide(femList.nodeArr, femList.elmArr, false);
	},
	hideAll:function(e){
		let self = showHideFem;
		self.showHide(fmNodes, fmElems, false);
	}
};

var showHideFem = new showHideFem();