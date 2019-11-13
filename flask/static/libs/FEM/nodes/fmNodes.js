var fmNodesDict = null;

class fmNodes {
    constructor(card) {
        let self;
        if (Array.isArray(card)) {
            this.id = card[1]; // Patran ID
            if (this.id in fmNodesDict) {
                self = fmNodesDict[this.id];
            } else {
                fmNodesDict[this.id] = this;
                self = this;
                self.conElm = []; // connected elements
            }
            self.rcid = self.checkCID(card[2]); // reference CID ID
            self.acid = self.checkCID(card[6]); // analysis CID ID
            self.glID = glNodes.count++; // Internal ID
            self.load2GL(card[3], card[4], card[5]);

            self.groupShow = 1;
            self.groupSelect = 0;
            self.show = true;
            self.select = 0;
        } else {
            this.id = card;
            this.conElm = []; // connected elements
            fmNodesDict[this.id] = this;
        }
    }
    get coords() {
        let off = this.glID * 3;
        return new glVec3(glNodes.coords[off], glNodes.coords[off + 1], glNodes.coords[off + 2]);
    }
    load2GL(x, y, z) {
        const sColor = hover.createColor(this.id * 10 + 1);
        glNodes.coords.push(x, y, z);
        glNodes.selColors.push(...sColor);
    }
    checkCID(cid) {
        let coord = fmCIDDict[cid];
        if (coord) {
            return coord;
        } else {
            return new fmCID(cid);
        }
    }
    setStage() {
        let show;
        if (this.groupShow && this.show) {
            if (this.groupSelect || this.select) {
                show = 0.6;
            } else {
                show = 0.9;
            }
        } else {
            show = 0;
        }
        glNodes.stage[this.glID] = show;
    }
}