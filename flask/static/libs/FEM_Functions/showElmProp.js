showElmProp = function (){
	this.init();
	sideBar.currentObject = this;
}

showElmProp.prototype = {
	init:function(){
		this.selectElements = sideBar.addSelect(
				/*object*/		this.selectElements,
				/*caption*/ 	'Select Elements:', 
				/*inpVal*/		'',
				/*selec type*/ 	selectFilter.ELEMENTS,
				/*focus*/ 		true
			);
		
		let row = sideBar.addBtnRow();
		this.applyBtn = sideBar.addButton(
				/*object*/		this.applyBtn,
				/*caption*/ 'Apply',
				/*parent*/ row, 
				/*callback*/ this.apply
			);
		this.clearBtn = sideBar.addButton(
				/*object*/		this.clearBtn,
				/*caption*/ 'Clear All',
				/*parent*/ row, 
				/*callback*/this.clearAll
			);
	},
	//CallBacks
	apply:function(e){
		let self = showElmProp,
			elmList = new fmList,
			tmpProp, tmpMat, text;
		
		elmList.readList(self.selectElements.value);
		
		for(elm of elmList.elmArr){
			tmpProp = fmPropDict[elm.pid];
			tmpMat = fmMatDict[tmpProp.mid];
			
			if( elm.type == 'CROD' )
				text = 'A=' + tmpProp.a
			else if( elm.type == 'CQUAD' || elm.type == 'CTRIA' || elm.type == 'CSHEAR' )
				text = 't=' + tmpProp.t
			text += '; E=' + tmpMat.e + '; nu=' + tmpMat.nu;
			
			glText.elmPropCoords.push(...elm.getCentroid());
			glText.elmPropText.push(text);
		}
		
		glText.updateLocations();
	},
	clearAll:function(e){
		glText.elmPropCoords = [];
		glText.elmPropText = [];
		glText.updateLocations();
	}
}

var showElmProp = new showElmProp();