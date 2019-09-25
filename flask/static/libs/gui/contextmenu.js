class $contextMenu {
    constructor() {
        this.wrapper = document.getElementById('contextMenu');

        // Canvas context menu
        this.idContainer = document.createElement('div');
        this.idContainer.classList.add('contextMenuIdCont');
        this.idContainer.setAttribute('hidden', 'true');
        this.idBtn = this.appendInfoBtn(this.idContainer, '','copy2Clip');

        this.idBtn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.idBtn.setAttribute('toolTip', 'copied');
            setTimeout(() => {
                this.idBtn.setAttribute('toolTip', '');
                setTimeout(() => {
                    this.idBtn.setAttribute('toolTip', 'copy2Clip');
                }, 1000);
            }, 1000);
        };

        this.wrapper.appendChild(this.idContainer);

        this.canvasBtns = document.createElement('div');
        this.canvasBtns.classList.add('contextMenuTable');

        this.zoomBtn = this.appendBtn(this.canvasBtns, 'Zooom To');
        this.hideBtn = this.appendBtn(this.canvasBtns, 'Hide');
        this.hideAllBtn = this.appendBtn(this.canvasBtns, 'Hide All');
        this.showAllBtn = this.appendBtn(this.canvasBtns, 'Show All');

        this.wrapper.appendChild(this.canvasBtns);

        // Hover data
        this.hoverID = null;
        this.hoverType = null;

        selectCanvas.oncontextmenu = this.onCanvasClick;
        document.oncontextmenu = this.contextMenu;
    }
    appendInfoBtn(parent, text, toolTip){
        const btn = document.createElement('div');
        btn.innerHTML = text;
        btn.classList.add('contextMenuBtn', 'copyable');
        btn.setAttribute('hidden', 'true');
        btn.setAttribute('toolTip', toolTip);
        parent.appendChild(btn);
        return btn;
    }
    appendBtn(parent, text) {
        const btn = document.createElement('div');
        btn.innerHTML = text;
        btn.classList.add('contextMenuBtn');
        btn.setAttribute('hidden', 'true');
        parent.appendChild(btn);
        return btn;
    }
    onCanvasClick(e) {
        const self = contextMenu,
            wr = self.wrapper;
        e.preventDefault();
        if (wr.style.display == 'block')
            self.clearAll();
        wr.style.display = 'block';
        wr.style.top = event.clientY - ribbon.height + 'px';
        wr.style.left = event.clientX + 'px';

        if (hover.id && hover.type) {
            self.hoverID = hover.id;
            self.hoverType = hover.type;
            if (self.hoverType == 1) {
                self.idBtn.innerHTML = 'Node ' + self.hoverID;
            } else {
                self.idBtn.innerHTML = 'Element ' + self.hoverID;
            }
            self.idContainer.setAttribute('hidden', 'false');
            self.idBtn.setAttribute('hidden', 'false');
            self.zoomBtn.setAttribute('hidden', 'false');
            self.hideBtn.setAttribute('hidden', 'false');
        }

        self.hideAllBtn.setAttribute('hidden', 'false');
        self.showAllBtn.setAttribute('hidden', 'false');

        // Event listeners
        window.addEventListener('click', contextMenu.onCloseClick);
        window.addEventListener('keydown', contextMenu.onKey);
    }
    clearAll() {
        this.wrapper.style.display = 'none';

        for (const btn of this.wrapper.getElementsByClassName('contextMenuBtn')) {
            btn.setAttribute('hidden', 'true');
        }

        window.removeEventListener('click', this.onCloseClick);
        window.removeEventListener('keydown', this.onKey);
    }
    //Close Events
    onKey(e) {
        e.stopPropagation();
        if (e.keyCode == 27) { //esc
            contextMenu.clearAll();
        }
    }
    onCloseClick(e) {
        e.stopPropagation();
        contextMenu.clearAll();
    }
}

const contextMenu = new $contextMenu();