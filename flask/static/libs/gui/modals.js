class $guiModals {
	constructor() {
		this.container = document.getElementById('popModals');
	}
	addRow(table) {
		let row = document.createElement('div');
		row.classList.add('divTableRow');
		table.appendChild(row);
		return row;
	}
	addCell(row) {
		let cell = document.createElement('div');
		cell.classList.add('divTableCell');
		row.appendChild(cell);
		return cell;
	}
	addBtn(parent, caption, callback) {
		let button;

		button = document.createElement('button');
		button.innerHTML = caption;
		button.classList.add('modalButton');
		button.addEventListener('click', callback);

		parent.appendChild(button);
		return button;
	}
	addDropDown(num, label, id, val, row) {
		let cell, div, span;
		cell = this.addCell(row);
		div = document.createElement('div');
		div.innerHTML = num;
		div.classList.add('modalTableRowNumber');
		cell.appendChild(div);

		cell = this.addCell(row);
		div = document.createElement('div');
		div.innerHTML = label;
		div.classList.add('modalTableRowLabel');
		cell.appendChild(div);

		cell = this.addCell(row);
		div = document.createElement('div');
		div.id = id;
		span = document.createElement('span');
		span.innerHTML = val;
		div.appendChild(span);
		div.classList.add('modalDropdown');
		cell.appendChild(div);

		div.onclick = function (e) {
			e.stopPropagation();

			if (this.classList.length == 1) {
				guiModals.closeAllDropDown();

				this.childNodes[1].classList.toggle("show-hide");
				this.classList.toggle("arrow-active");
				window.addEventListener('click', guiModals.onDropDownClick);
			} else {
				guiModals.closeAllDropDown();
			}
		};

		let ul = document.createElement('ul');
		ul.classList.add('modalDrpdnCont', 'show-hide');
		div.appendChild(ul);

		return ul;
	}
	appendDropDown(items, ul) {
		let li;
		for (const item of items) {
			li = document.createElement('li');
			li.innerHTML = item;
			li.onclick = this.dropDownOptionClick;
			ul.appendChild(li);
		}
	}
	onDropDownOptionClick(e) {
		e.stopPropagation();
		guiModals.closeAllDropDown();
		this.parentNode.previousSibling.innerHTML = this.innerHTML;
	}
	onDropDownClick(e) {
		e.stopPropagation();
		guiModals.closeAllDropDown();
	}
	closeAllDropDown() {
		for (const ddElm of document.getElementsByClassName("modalDrpdnCont")) {
			if (ddElm.classList.length == 1) {
				ddElm.classList.toggle("show-hide");
				ddElm.parentNode.classList.toggle("arrow-active");
			}
		}
		window.removeEventListener('click', this.onDropDownClick);
	}
	clearAll() {
		this.container.innerHTML = '';
		guiModals.container.style.display = 'none';
		window.removeEventListener('click', this.onCloseClick);
		window.removeEventListener('keydown', this.onKey);
	}
	onCloseClick(e) {
		e.stopPropagation();
		guiModals.clearAll();
	}
	onKey(e) {
		e.stopPropagation();
		if (e.keyCode == 27) { //esc
			guiModals.clearAll();
		}
	}
}

class $aboutModal extends $guiModals {
	constructor() {
		let wrapper = document.createElement('div'),
			divWrap = document.createElement('div'),
			div = document.createElement('div'),
			a = document.createElement('a');

		//Ininit super
		super();

		wrapper.id = 'modalAbout';
		wrapper.classList.add('modalContent');
		this.container.appendChild(wrapper);

		//about
		divWrap.id = 'modalAboutText';
		wrapper.appendChild(divWrap);

		div.innerHTML = 'H5View';
		div.id = 'modalAboutTitle';
		divWrap.appendChild(div);

		div = document.createElement('div');
		div.innerHTML = 'Web .h5 file viewer';
		div.id = 'modalAboutSubTitle';
		divWrap.appendChild(div);

		div = document.createElement('div');
		div.id = 'modalAboutVersion';
		divWrap.appendChild(div);

		div = document.createElement('div');
		div.innerHTML = 'H5View is an online Patran .h5 file viewer. It allows you to view files on any computer with a web browser without having to bootup bulky Patran files.';
		div.id = 'modalAboutDescription';
		divWrap.appendChild(div);

		//logo
		div = document.createElement('div');
		div.id = 'modalAboutLogo';
		wrapper.appendChild(div);

		//footer
		div = document.createElement('div');
		div.id = 'modelAboutFoooter';
		div.innerHTML = 'Developed by ';
		a.href = 'mailto:nikita.avdeev@gulfstream.com';
		a.innerHTML = 'Nikita Avdeev';
		div.appendChild(a);
		wrapper.appendChild(div);

		window.addEventListener('click', this.onCloseClick);
		window.addEventListener('keydown', this.onKey);

		this.container.style.display = 'block';
	}
}

class $openModal extends $guiModals {
	constructor() {
		let wrapper = document.createElement('div'),
			div = document.createElement('div'),
			button = document.createElement('button'),
			table = document.createElement('div'),
			row, ul, btn;

		//Ininit super this
		super();

		wrapper.id = 'modalOpenFile';
		wrapper.classList.add('modalContent');

		//Close btn
		button.classList.add('closeBtn');
		button.addEventListener('click', super.onCloseClick);
		wrapper.appendChild(button);

		//Open
		div.innerHTML = 'Open Database';
		div.id = 'modalOpenTitle';
		wrapper.appendChild(div);

		div = document.createElement('div');
		div.classList.add('modalSplitter');
		wrapper.appendChild(div);

		table.classList.add('divTable');
		wrapper.appendChild(table);

		row = this.addRow(table);
		ul = this.addDropDown('1', 'Select Program:', 'openProgram', 'GVI', row);
		this.appendDropDown(['GVI', 'AAP'], ul);

		row = this.addRow(table);
		ul = this.addDropDown('2', 'Select Category:', 'openCategory', 'Static', row);
		this.appendDropDown(['Static', 'Fatigue', 'Test'], ul);

		row = this.addRow(table);
		ul = this.addDropDown('3', 'Select Model:', 'openModel', 'GVI_E1_F1', row);
		this.appendDropDown(['GVI_E1_F1', 'GVI_E2_F2', 'GVI_E2_F2'], ul);

		div = document.createElement('div');
		div.classList.add('modalBtnContainer');
		wrapper.appendChild(div);
		btn = this.addBtn(div, 'Apply', this.openDB);
		btn = this.addBtn(div, 'Close', this.onCloseClick);

		window.addEventListener('keydown', this.onKey);

		this.container.appendChild(wrapper);
		this.container.style.display = 'block';
	}
	openDB(e) {
		let xhr = new XMLHttpRequest(); // new HttpRequest instance 
		e.stopPropagation();

		xhr.open('POST', '/openDB', true);
		xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
		xhr.send(JSON.stringify({
			'program': document.getElementById('openProgram').firstChild.innerHTML,
			'category': document.getElementById('openCategory').firstChild.innerHTML,
			'model': document.getElementById('openModel').firstChild.innerHTML
		}));

		loaderShow();

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				loadModel.load(JSON.parse(xhr.responseText));
				camera.fitZoom();
				render.drawSelectScene();
				guiModals.clearAll();
				loaderFade();
			}
		};
	}
}

const guiModals = new $guiModals();