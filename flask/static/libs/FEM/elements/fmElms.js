var fmElemsDict = null;

class fmElms {
    constructor(id, pid, con) {
        const count = con.length;
        this.id = id; // Patran ID
        this.con = new Array(count);
        this.pid = pid;
        this.groupShow = 1;
        this.groupSelect = 0;
        this.show = true;
        this.select = 0;

        fmElemsDict[id] = this;
        for (let i = 0; i < count; ++i) {
            this.con[i] = this.checkNode(con[i]);
            this.con[i].conElm.push(this);
        }

        // Gui ID
        if (count == 2) {
            this.glID = glBars.count++;
        } else if (count == 3) {
            this.glID = glTrias.count++;
        } else if (count == 4) {
            this.glID = glQuads.count++;
        }
    }
    get nodeCount() {
        return this.con.length;
    }
    get centroid() {
        let centr = new glVec3(),
            inv = 1 / this.nodeCount;
        for (let i = 0; i < this.nodeCount; i++) {
            centr.scaleAndAdd(this.con[i].coords, inv);
        }
        return centr;
    }
    get eCid() {
        let nc = this.connectivity,
            x, y, z;
        switch (this.nodeCount) {
            case 2:
                x = glVec3.sub(nc[1].coords, nc[0].coords).normalize();
                break;
            case 3:
                x = glVec3.sub(nc[1].coords, nc[0].coords).normalize();
                z = glVec3.getNormal(nc[0].coords, nc[1].coords, nc[2].coords);
                y = glVec3.cross(z, x);
                break;
            case 4:
                let v1 = glVec3.sub(nc[2].coords, nc[0].coords).normalize(),
                    v2 = glVec3.sub(nc[3].coords, nc[1].coords).normalize();
                x = glVec3.sub(v1, v2).normalize();
                y = glVec3.add(v1, v2).normalize();
                z = glVec3.cross(x, y);
                break;
        }
        return [x, y, z];
    }
    get normal() {
        if (this.nodeCount == 3 || this.nodeCount == 4) {
            return this.eCid[2];
        }
    }
    get glCoords() {
        let coords, off;
        if (this.nodeCount == 4) {
            coords = new Array(18);
            off = [this.con[0].glID * 3, this.con[1].glID * 3, this.con[2].glID * 3,
                this.con[0].glID * 3, this.con[2].glID * 3, this.con[3].glID * 3
            ];
            for (let i = 0; i < 6; i++) {
                coords[i * 3] = glNodes.coords[off[i]];
                coords[i * 3 + 1] = glNodes.coords[off[i] + 1];
                coords[i * 3 + 2] = glNodes.coords[off[i] + 2];
            }
        } else {
            coords = new Array(this.nodeCount * 3);
            for (let i = 0; i < this.nodeCount; i++) {
                off = this.con[i].glID * 3;
                coords[i * 3] = glNodes.coords[off];
                coords[i * 3 + 1] = glNodes.coords[off + 1];
                coords[i * 3 + 2] = glNodes.coords[off + 2];
            }
        }
        return coords;
    }
    checkProp(pid) {
        let prop = fmPropDict[pid];
        if (prop) {
            return prop;
        } else {
            return new fmProps(id, null);
        }
    }
    checkNode(id) {
        let node = fmNodesDict[id];
        if (node) {
            return node;
        } else {
            return new fmNodes(id);
        }
    }
    setStage() {
        let off, show;
        if (this.groupShow && this.show) {
            if (this.groupSelect || this.select) {
                show = this.nodeCount == 2 ? 0.7 : 0.8;
            } else {
                show = 1;
            }
        } else {
            show = 0;
        }

        if (this.nodeCount == 2) {
            off = this.glID * 2;
            glBars.ctrStage[this.glID] = show; //selection centroids

            glBars.stage[off] = show;
            glBars.stage[off + 1] = show;
        } else if (this.nodeCount == 3) {
            off = this.glID * 3;
            glTrias.stage[off] = show;
            glTrias.stage[off + 1] = show;
            glTrias.stage[off + 2] = show;
        } else if (this.nodeCount == 4) {
            off = this.glID * 6;
            glQuads.stage[off] = show;
            glQuads.stage[off + 1] = show;
            glQuads.stage[off + 2] = show;
            glQuads.stage[off + 3] = show;
            glQuads.stage[off + 4] = show;
            glQuads.stage[off + 5] = show;
        }
    }
    load2GL() {
        if (this.nodeCount == 2) {
            this.loadBar2GL();
        } else if (this.nodeCount == 3) {
            this.loadTria2GL();
        } else if (this.nodeCount == 4) {
            this.loadQuad2GL();
        }
    }
    loadBar2GL() {
        const sColor = hover.createColor(this.id * 10 + 2);
        let off = this.glID * 3;

        glBars.centroids.addBarCentroid(this, off);

        off *= 2; //(glBars.count+i)*6
        glBars.coords.addElmCords(this, off);
        glBars.barycentric.append(BARYCENTRIC.BAR, off);

        // Select color for centroid
        off = this.glID * 4;
        glBars.selCtrColors.append(sColor, off);

        // Select color for line
        off *= 2; //(glBars.count+i)*8
        glBars.selColors.appendNTimes(sColor, 2, off);
    }
    loadTria2GL() {
        const sColor = hover.createColor(this.id * 10 + 3);
        let off = this.glID * 9;

        glTrias.coords.addElmCords(this, off);
        glTrias.barycentric.append(BARYCENTRIC.TRIA, off);
        glTrias.normals.addElmNormals(this, off);

        off = this.glID * 12;
        glTrias.selColors.appendNTimes(sColor, 3, off);
    }
    loadQuad2GL() {
        const sColor = hover.createColor(this.id * 10 + 4);
        let off = this.glID * 18;

        glQuads.coords.addElmCords(this, off);
        glQuads.barycentric.append(BARYCENTRIC.QUAD, off);
        glQuads.normals.addElmNormals(this, off);

        off = this.glID * 24;
        glQuads.selColors.appendNTimes(sColor, 6, off);
    }
}