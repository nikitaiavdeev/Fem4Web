class $sideBar {
	constructor() {
		this.wrapper = document.getElementById('sideBar');

		this.closeBtn = document.createElement('button');
		this.closeBtn.classList.add('closeBtn');
		this.wrapper.appendChild(this.closeBtn);

		this.closeBtn.onclick = this.closeBtnClick;

		this.mouseInitX = null;
		this.dragWidth = document.createElement('div');
		this.dragWidth.classList.add('dragWidthLeft');
		this.dragWidth.addEventListener('mousedown', this.dragWidthClick);
		this.wrapper.appendChild(this.dragWidth);

		this.table = document.createElement('div');
		this.table.classList.add('sideBarContent');
		this.table.id = 'sideBarContent';
		this.wrapper.appendChild(this.table);

		this.btnContainer = document.createElement('div');
		this.btnContainer.id = 'sideBarBtnContent';
		this.wrapper.appendChild(this.btnContainer);

		this.inputCount = 0;
		this.currentFunction = null;
		this.focusElement = null;
		this.timeout = null;
	}
	closeBtnClick(e) {
		sideBar.wrapper.style.display = 'none';
	}
	dragWidthClick(e) {
		sideBar.mouseInitX = e.clientX;
		window.addEventListener('mousemove', sideBar.dragWidthMove);
		window.addEventListener('mouseup', sideBar.dragWidthUp);
	}
	dragWidthMove(e) {
		let width = sideBar.wrapper.clientWidth - 10 - e.clientX + sideBar.mouseInitX;
		sideBar.wrapper.style.width = width + 'px';
		sideBar.mouseInitX = e.clientX;
	}
	dragWidthUp(e) {
		window.removeEventListener('mousemove', sideBar.dragWidthMove);
	}
	addFunction(source, inpObject) {
		if (this.currentFunction === source) {
			sideBar.wrapper.style.display = '';
			return;
		} else {
			this.cleanAll();
		}

		if (this.wrapper.style.display == 'none') {
			this.wrapper.style.display = '';
		}

		if (typeof window[inpObject] !== 'object') {
			let script = document.createElement('script');
			script.src = source;
			document.getElementsByTagName('head')[0].appendChild(script);
		} else {
			window[inpObject] = new window[inpObject].constructor(window[inpObject]);
		}

		this.currentFunction = source;
	}
	setFocus(inInput) {
		this.focusElement = inInput;
		this.focusElement.focus();
	}
	cleanAll() {
		this.table.innerHTML = '';
		this.btnContainer.innerHTML = '';
	}
	addSelect(inpObj, caption, inpVal, selectType, isFocus) {
		let col = document.createElement('div'),
			row = this.addRow(),
			input;


		col.classList.add('sideBarCol1');
		col.innerHTML = caption;
		row.appendChild(col);

		col = document.createElement('div');
		col.classList.add('sideBarCol2');
		row.appendChild(col);

		if (inpObj) {
			input = inpObj;
		} else {
			input = document.createElement('input');
			input.id = 'input_' + this.inputCount++;
			input.type = 'caption';
			input.setAttribute('autocomplete', 'off');
			input.value = inpVal;
			input.classList.add('sideBarSelect');
		}
		input.onfocus = function () {
			selection.filter = selectType;
			selection.textBox = this;
			selection.selectList.readList(this.value);

			this.scrollLeft = this.scrollWidth;
			this.setSelectionRange(this.value.length, this.value.length);
			selection.clearSelection(false);
			selection.setSelection();
		};
		input.onblur = function (e) {
			row.classList.remove('focus');
			selection.filter = selectFilter.NONE;
			selection.textBox = null;
			selection.clearSelection();
		};
		input.addEventListener('input', function (e) {
			clearTimeout(this.timeout);
			this.timeout = setTimeout(function () {
				selection.selectList.readList(input.value);
				selection.clearSelection(false);
				selection.setSelection();
			}, 1000);
		}, false);
		col.appendChild(input);

		if (isFocus) this.setFocus(input);
		return input;
	}
	addTextBox(inpObj, caption, inpVal, inpType, isFocus) {
		let row = this.addRow(),
			col = document.createElement('div'),
			input;

		col.classList.add('sideBarCol1');
		col.innerHTML = caption;
		row.appendChild(col);

		col = document.createElement('div');
		col.classList.add('sideBarCol2');
		row.appendChild(col);

		if (inpObj) {
			input = inpObj;
		} else {
			input = document.createElement('input');
			input.id = 'input_' + this.inputCount++;
			input.type = 'caption';
			input.setAttribute('autocomplete', 'off');
			input.value = inpVal;
			input.inpType = inpType;

			input.classList.add('sideBarSelect');
		}
		input.onfocus = function () {
			this.scrollLeft = this.scrollWidth;
			this.setSelectionRange(this.value.length, this.value.length);
		};
		input.onblur = function (e) {
			row.classList.remove('focus');
		};

		input.onkeypress = function (e) {
			if (e.which == 0) // sys keys
				return true;

			if (this.inpType == 'string')
				return true;
			if (e.which.between(48, 57) || e.which == 8)
				return true;
			if (this.inpType == 'float' && e.which == 46 && this.value.indexOf('.') == -1)
				return true;
			return false;
		};
		col.appendChild(input);

		if (isFocus) this.setFocus(input);
		return input;
	}
	addMultiOption(inpObj, caption, isFocus, callback) {
		let col = document.createElement('div'),
			row = this.addRow(),
			select;

		col.classList.add('sideBarCol1');
		col.innerHTML = caption;
		row.appendChild(col);

		col = document.createElement('div');
		col.classList.add('sideBarCol2');
		row.appendChild(col);

		if (inpObj) {
			select = inpObj;
		} else {
			select = document.createElement('select');
			select.id = 'input_' + this.inputCount++;
			select.classList.add('sideBarSelect');
			select.onchange = callback;
		}
		col.appendChild(select);

		if (isFocus) this.setFocus(select);
		return select;
	}
	addRow() {
		let row = document.createElement('div');

		row.classList.add('sideBarRow');
		this.table.appendChild(row);

		return row;
	}
	addBtnRow() {
		let row = document.createElement('div');

		row.classList.add('sideBarRow');
		this.btnContainer.appendChild(row);

		return row;
	}
	addCheckBox(inpObj, caption, isChecked, parent) {
		let label = document.createElement('label'),
			span = document.createElement('span'),
			input;

		label.innerHTML = caption;
		label.classList.add('sideBarCheckContainer');

		span.classList.add('sideBarCheck');

		if (inpObj) {
			input = inpObj;
		} else {
			input = document.createElement('input');
			input.id = 'input_' + this.inputCount++;
			input.type = 'checkbox';

			if (isChecked)
				input.setAttribute('checked', '');
		}

		label.appendChild(input);
		label.appendChild(span);

		if (parent) {
			parent.appendChild(label);
		} else {
			let row = document.createElement('div');

			row.classList.add('sideBarRow');
			row.appendChild(label);
			this.table.appendChild(row);
		}

		return input;
	}
	addRadio(inpObj, caption, groupName, isChecked, parent) {
		let label = document.createElement('label'),
			span = document.createElement('span'),
			input;

		label.classList.add('sideBarRadioContainer');

		span.classList.add('sideBarRadio');
		if (inpObj) {
			input = inpObj;
		} else {
			input = document.createElement('input');
			input.id = 'input_' + this.inputCount++;
			input.type = 'radio';
			input.name = groupName;
			if (isChecked)
				input.setAttribute('checked', '');
		}

		label.appendChild(input);
		label.appendChild(span);
		label.innerHTML = label.innerHTML + caption;

		if (parent) {
			parent.appendChild(label);
		} else {
			let row = document.createElement('div');

			row.classList.add('sideBarRow');
			row.appendChild(label);
			this.table.appendChild(row);
		}

		return input;
	}
	addMultiOptionAdd(text, parent) {
		let option = document.createElement('option');
		option.innerHTML = text;
		parent.appendChild(option);
	}
	addButton(inpObj, caption, parent, callback) {
		let button;

		if (inpObj) {
			button = inpObj;
		} else {
			button = document.createElement('button');
			button.id = 'input_' + this.inputCount++;
			button.innerHTML = caption;
			button.classList.add('sideBarButton');
			button.addEventListener('click', callback);
		}
		button.onclick = function (e) {
			sideBar.focusElement.focus();
		};

		parent.appendChild(button);
		return button;
	}
}

const sideBar = new $sideBar();