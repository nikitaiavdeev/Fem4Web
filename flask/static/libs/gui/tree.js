guiGroupsDict = {};

class guiGroup {
	constructor(name) {
		// html representation
		this.div = document.createElement('div');
		this.div.classList.add('treeTableRow');
		this.div.rowIndex = tree.count;
		let td = document.createElement('div');
		td.classList.add('treeTableCell', 'col1');
		td.innerHTML = name;
		this.div.appendChild(td);

		td = document.createElement('div');
		td.classList.add('treeTableCell', 'checkBox', 'checked');
		this.div.appendChild(td);

		// Hide/Show event
		td.addEventListener("click", function (e) {
			e.stopPropagation();
			tree.toggleGroupVisibility(this);
		});

		// Selection event
		this.div.addEventListener("click", function (e) {
			e.stopPropagation();
			let trs = tree.table.getElementsByClassName('treeTableRow');

			if (KeyboardState.Ctrl) {
				this.classList.toggle('selected');
				tree.toggleGroupSelect(this);
				tree.firstSelectedRow = this.rowIndex;
				tree.lastSelectedRow = -1;
			}

			if (!KeyboardState.Ctrl && !KeyboardState.Shift) {
				for (let i = 0; i < trs.length; i++) {
					if (trs[i].classList.contains('selected') && trs[i] !== this) {
						trs[i].classList.remove('selected');
						tree.toggleGroupSelect(trs[i], true);
					}
				}

				this.classList.toggle('selected');
				tree.toggleGroupSelect(this, true);
				tree.firstSelectedRow = this.rowIndex;
				tree.lastSelectedRow = -1;

				model.updateStages();
			}

			if (KeyboardState.Shift) {
				if (tree.lastSelectedRow > -1) {
					for (let i = Math.min(this.rowIndex, tree.lastSelectedRow); i <= Math.max(this.rowIndex, tree.lastSelectedRow); i++) {
						if (trs[i].classList.contains('selected')) {
							trs[i].classList.remove('selected');
							tree.toggleGroupSelect(trs[i], true);
						}
					}
				}

				tree.lastSelectedRow = this.rowIndex;

				for (let i = Math.min(tree.firstSelectedRow, tree.lastSelectedRow); i <= Math.max(tree.firstSelectedRow, tree.lastSelectedRow); i++) {
					if (!trs[i].classList.contains('selected')) {
						trs[i].classList.add('selected');
						tree.toggleGroupSelect(trs[i], true);
					}
				}

				model.updateStages();
			}

			if (!tree.documentClickAdded) {
				tree.documentClickAdded = true;

				selectCanvas.addEventListener('click', function (e) {
					if (tree.documentClickAdded && e.button == 0) { //left click
						tree.documentClickAdded = false;
						tree.removeAllSelect();
					}
				}, {
					once: true
				});
			}
		}, false);
	}
	expand(newNode) {
		//this.arrowInpt.setAttribute("checked", "checked"); // added line
	}
	collapse(newNode) {
		//this.arrowInpt.setAttribute("checked", ""); // added line
	}
}

class treeControl {
	constructor() {
		// Maximum height
		this.MAX_HEIGHT = 650;

		// First create the Tree Control	
		this.module = document.getElementById('treeView');
		this.showBtn = document.createElement('button');
		this.hideBtn = document.createElement('button');

		this.showBtn.id = 'showTree';
		this.showBtn.style.display = 'none';
		this.hideBtn.classList.add('hideBtn');

		this.hideBtn.onclick = this.showBtn.onclick = function () {
			tree.container.style.display = tree.container.style.display === 'none' ? '' : 'none';
			tree.showBtn.style.display = tree.showBtn.style.display === 'none' ? '' : 'none';
			tree.hideBtn.style.display = tree.hideBtn.style.display === 'none' ? '' : 'none';
			tree.module.classList.toggle('hidden');
			tree.module.classList.toggle('resizable');
		};

		this.module.appendChild(this.showBtn);
		this.module.appendChild(this.hideBtn);

		this.container = document.createElement('div');
		this.container.id = 'treeContent';
		this.module.appendChild(this.container);

		this.filter = document.createElement('input');
		this.filter.type = 'text';
		this.filter.id = 'treeFilter';
		this.filter.placeholder = 'Groups filter..';
		this.container.appendChild(this.filter);

		this.head = document.createElement('div');
		this.head.classList.add('treeTableHead');
		this.container.appendChild(this.head);

		let div = document.createElement('div');
		div.classList.add('treeTableCell', 'col1');
		div.innerHTML = 'Name';
		this.head.appendChild(div);

		div = document.createElement('div');
		div.classList.add('treeTableCell', 'col2');
		div.id = 'treeH2';
		this.head.appendChild(div);

		// Hide/Show all event
		div.onclick = function (e) {
			e.stopPropagation();
			tree.toggleAllGroupsVisibility();
		};

		this.table = document.createElement('div');
		this.table.classList.add('treeTable');
		this.container.appendChild(this.table);

		// Patran groups
		this.count = 0;
		this.maxHeight = null;

		// Click Handler
		this.firstSelectedRow = null;
		this.lastSelectedRow = null;
		this.documentClickAdded = false;

		this.module.addEventListener("mouseenter", function (e) {
			this.classList.add("hovered");
		}, false);

		this.module.addEventListener("mouseleave", function (e) {
			this.classList.remove("hovered");
		}, false);

		this.filter.onkeyup = function () {
			let trs = tree.table.getElementsByClassName('treeTableRow'),
				filter = tree.filter.value.toUpperCase(),
				txtValue, td, count;

			// Loop through all table rows, and hide those who don't match the search query
			for (let i = 0; i < trs.length; i++) {
				td = trs[i].firstChild;
				if (td) {
					txtValue = td.innerText;
					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						trs[i].style.display = "flex";
						count++;
					} else {
						trs[i].style.display = "none";
					}
				}
			}
			tree.module.style.maxHeight = Math.min(tree.maxHeight, tree.MAX_HEIGHT) + 'px';
		};
	}
	addGroup(newGroup) {
		guiGroupsDict[newGroup.name] = newGroup;
		this.count++;
		this.maxHeight = (this.count + 1) * (this.head.offsetHeight - 1) + this.filter.offsetHeight + 6;

		this.table.appendChild(newGroup.div);

		this.module.style.maxHeight = Math.min(this.maxHeight, this.MAX_HEIGHT) + 'px';
		if (this.container.offsetHeight > tree.MAX_HEIGHT) {
			this.module.style.height = this.MAX_HEIGHT + 'px';
		}
	}
	removeAllSelect() {
		let trs = this.table.getElementsByClassName('treeTableRow');
		for (let i = 0; i < trs.length; i++) {
			if (trs[i].classList.contains('selected')) {
				trs[i].classList.remove("selected");
				this.toggleGroupSelect(trs[i], true);
			}
		}
		model.updateStages();
	}
	toggleGroupSelect(tr) {
		let selected = tr.classList.contains('selected');
		let name = tr.firstChild.innerHTML;
		let tmpGroup = fmGroupsDict[name];
		tmpGroup.toggleSelection(selected);
	}
	toggleGroupVisibility(td) {
		td.classList.toggle('checked');

		let selected = td.parentElement.classList.contains('selected');
		let visibility = td.classList.contains('checked');
		let name = td.previousSibling.innerHTML;
		let tmpGroup = fmGroupsDict[name];
		tmpGroup.toggleVisibility(visibility, selected);
	}
	toggleAllGroupsVisibility() {
		let trs = this.table.getElementsByClassName('treeTableRow'),
			td, v, visibility;

		for (let i = 0; i < trs.length; i++) {
			td = trs[i].lastChild;
			v = td.classList.contains('checked');
			if (i == 0) {
				//determine disability by first element
				visibility = v;
				this.toggleGroupVisibility(td, true);
			} else if (v == visibility) {
				this.toggleGroupVisibility(td, true);
			}
		}
		model.updateStages();
		model.updateSelectStages();
	}
	toggleSelectedGroupsVisibility() {
		let trs = this.table.getElementsByClassName('treeTableRow'),
			td, v, visibility;

		for (let i = 0; i < trs.length; i++) {
			td = trs[i].lastChild;
			v = td.classList.contains('checked');
			if (i == 0) {
				//determine disability by first element
				visibility = v;
				this.toggleGroupVisibility(td, true);
			} else if (v == visibility) {
				this.toggleGroupVisibility(td, true);
			}
		}
		model.updateStages();
		model.updateSelectStages();
	}
};

const tree = new treeControl();

document.onkeydown = function (e) {
	if (e.keyCode == 32) { //space
		tree.toggleSelectedGroupsVisibility();
	}
	if (tree.documentClickAdded && e.keyCode == 27) { //esc
		tree.documentClickAdded = false;
		tree.removeAllSelect();
	}
}