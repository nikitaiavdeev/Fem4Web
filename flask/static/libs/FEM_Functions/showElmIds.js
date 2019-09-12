class $showElmIds{
	constructor(){
		sideBar.currentObject = this;
		
		this.selectNodes = sideBar.addSelect(
				/*object*/		this.selectNodes,
				/*caption*/ 	'Select Nodes:', 
				/*inpVal*/		'',
				/*selec type*/ 	selectFilter.NODES,
				/*focus*/ 		true
			);
		
		this.selectElements = sideBar.addSelect(
				/*object*/		this.selectElements,
				/*caption*/ 	'Select Elements:', 
				/*inpVal*/		'',
				/*selec type*/ 	selectFilter.ELEMENTS,
				/*focus*/ 		false
			);
			
		let row = sideBar.addRow();
		this.addElementNodes = sideBar.addCheckBox(
				/*object*/		this.addElementNodes,
				/*caption*/		"Include Elm's Nodes:", 
				/*isChecked*/	true,
				/*parent*/		row 
			);	
		
		row = sideBar.addBtnRow();
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
	apply(e){
		let	self = showElmIds,
			nodeList = new fmList(),
			elmList = new fmList();
		
		nodeList.readList(self.selectNodes.value);
		elmList.readList(self.selectElements.value);
		
		for(const node of nodeList.nodeArr){
			glText.nodeCoords.push(...node.coords.xyz);
			glText.nodeText.push(node.id);
		}
		
		for(const elm of elmList.elmArr){
			glText.elmCoords.push(...elm.centroid.xyz);
			glText.elmText.push(elm.id);
		}
		
		glText.updateLocations();
	}
	clearAll(e){
		glText.nodeCoords = [];
		glText.nodeText = [];
		
		glText.elmCoords = [];
		glText.elmText = [];
		glText.updateLocations();
	}
}

const showElmIds = new $showElmIds();