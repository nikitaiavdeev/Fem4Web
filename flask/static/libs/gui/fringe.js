class fringeControl {
	constructor() {
		this.wrap = document.getElementById('fringeWrap');

		let table = document.createElement('table');
		table.id = 'fringeValTable';
		this.wrap.appendChild(table);

		this.vBodie = document.createElement('tbody');
		table.appendChild(this.vBodie);

		table = document.createElement('table');
		table.id = 'fringeTable';
		this.wrap.appendChild(table);

		this.fBodie = document.createElement('tbody');
		table.appendChild(this.fBodie);

		this.colors = [
			[1, 0, 0, 1],
			[1, 0.43, 0, 1],
			[1, 0.69, 0, 1],
			[1, 0.855, 0, 1],
			[1, 1, 0, 1],
			[0.675, 1, 0, 1],
			[0, 1, 0, 1],
			[0, 0.75, 0, 1],
			[0, 0.624, 0, 1],
			[0, 0.835, 0.675, 1],
			[0, 1, 1, 1],
			[0, 0.7, 1, 1],
			[0, 0.4, 1, 1],
			[0, 0, 1, 1],
			[0, 0, 0.67, 1]
		];
	}
	setFringe(max, min) {
		let val = max,
			tr, td;

		if (this.wrap.style.display == 'none') {
			this.wrap.style.display = '';
		}

		//Clear
		this.clear();
		for (let i = 0; i < 16; i++) {
			val -= i * (max - min) / 15;
			tr = document.createElement('tr');

			td = document.createElement('td');
			td.innerHTML = val.toFixed(2);
			tr.appendChild(td);
			this.vBodie.appendChild(tr);
		}

		for (let i = 0; i < 15; i++) {
			val += i * (max - min) / 15;
			tr = document.createElement('tr');

			td = document.createElement('td');
			td.classList.add('fringeColor');
			td.style.backgroundColor = 'rgb(' +
				(this.colors[i][0] * 255 >> 0).toString() + ',' +
				(this.colors[i][1] * 255 >> 0).toString() + ',' +
				(this.colors[i][2] * 255 >> 0).toString() + ')';
			tr.appendChild(td);
			this.fBodie.appendChild(tr);
		}
	}
	clear() {
		//Clear
		this.fBodie.innerHTML = '';
		this.vBodie.innerHTML = '';
	}
}

const fringeBar = new fringeControl();