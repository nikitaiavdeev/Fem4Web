class $guiModals {
	constructor() {
		this.container = document.getElementById('popModals');
	}
	addCloseBtn(wrap) {
		const button = document.createElement('button');
		button.classList.add('closeBtn');
		button.addEventListener('click', this.onCloseClick);
		wrap.appendChild(button);
	}
	addCaption(wrap, text) {
		const div = document.createElement('div');
		div.innerHTML = text;
		div.classList.add('modalTitle');
		wrap.appendChild(div);
	}
	addSplitter(wrap) {
		const div = document.createElement('div');
		div.classList.add('modalSplitter');
		wrap.appendChild(div);
	}
	addTable(wrap) {
		const table = document.createElement('div');
		table.classList.add('divTable');
		wrap.appendChild(table);
		return table;
	}
	addRow(table) {
		const row = document.createElement('div');
		row.classList.add('divTableRow');
		table.appendChild(row);
		return row;
	}
	addCell(row) {
		const cell = document.createElement('div');
		cell.classList.add('divTableCell');
		row.appendChild(cell);
		return cell;
	}
	addBtn(parent, caption, callback) {
		const button = document.createElement('button');

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
	//Events
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
			table, row, ul, btn;

		//Ininit super this
		super();

		wrapper.id = 'modalOpenFile';
		wrapper.classList.add('modalContent');

		//Close btn
		this.addCloseBtn(wrapper);

		//Caption
		this.addCaption(wrapper, 'Open Database');

		//Splitter
		this.addSplitter(wrapper);

		table = this.addTable(wrapper);
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
		btn = this.addBtn(div, 'Open', this.openDB);
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

class $importBdf extends $guiModals {
	constructor() {
		let wrapper = document.createElement('div'),
			div = document.createElement('div'),
			input = document.createElement('input'),
			btnCont = document.createElement('div'),
			span = document.createElement('span'),
			label = document.createElement('label');

		//Init super
		super();

		this.files = null;

		wrapper.id = 'modalImportBdf';
		wrapper.classList.add('modalContent');

		//Close btn
		this.addCloseBtn(wrapper);

		//Caption
		this.addCaption(wrapper, 'Import Model');

		//Splitter
		this.addSplitter(wrapper);

		//File Drop
		div.classList.add('modalFileDrop');
		input.type = 'file';
		input.id = 'modalImportBdfFiles';
		input.style.display = 'none';
		input.setAttribute('multiple', '');
		div.appendChild(input);

		//Label for File Drop
		span.innerHTML = 'Choose a files';
		span.onclick = () => {
			input.click();
		};

		label.appendChild(span);
		span = document.createElement('span');
		span.innerHTML = ' or drag it here';
		label.appendChild(span);
		div.appendChild(label);

		wrapper.appendChild(div);

		//Add Buttons
		btnCont = document.createElement('div');
		btnCont.classList.add('modalBtnContainer');
		const applyBtn = this.addBtn(btnCont, 'Import', this.importBdfClick);
		const closeBtn = this.addBtn(btnCont, 'Close', this.onCloseClick);
		wrapper.appendChild(btnCont);

		this.container.appendChild(wrapper);
		this.container.style.display = 'block';

		// Esc key down Listener
		window.addEventListener('keydown', this.onKey);

		//File drop events
		['dragover', 'dragenter'].forEach((event) => {
			div.addEventListener(event, (e) => {
				e.preventDefault();
				e.stopPropagation();
				e.dataTransfer.dropEffect = "move";
				e.dataTransfer.effectAllowed = 'move';
				div.classList.add('is-dragover');
			});
		});
		['dragleave', 'dragend', 'drop'].forEach((event) => {
			div.addEventListener(event, function (e) {
				e.preventDefault();
				e.stopPropagation();
				div.classList.remove('is-dragover');
			});
		});
		div.ondrop = (e) => {
			applyBtn.files = e.dataTransfer.files;
			label.textContent = applyBtn.files.length > 1 ? applyBtn.files.length + ' files selected' : applyBtn.files[0].name;
		};
		input.onchange = (e) => {
			applyBtn.files = e.target.files;
			label.textContent = applyBtn.files.length > 1 ? applyBtn.files.length + ' files selected' : applyBtn.files[0].name;
		};
	}
	importBdfClick(e) {
		importFiles.importBdf(e.target.files);
		guiModals.clearAll();
	}
}

const guiModals = new $guiModals();