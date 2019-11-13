var fmCIDDict = {};

class fmCID {
    constructor(id, origin, mat, type) {
        this.id = id;
        this.origin = new glVec3(origin); //CID origin
        this.mat = new glMat33(mat); //transformation matris
        this.type = type; //CID type

        fmCIDDict[id] = this;
    }
    get xAxis() {
        return new glVec3(this.mat[0][0], this.mat[0][1], this.mat[0][2]);
    }
    get yAxis() {
        return new glVec3(this.mat[1][0], this.mat[1][1], this.mat[1][2]);
    }
    get zAxis() {
        return new glVec3(this.mat[2][0], this.mat[2][1], this.mat[2][2]);
    }
    createFrom3Points(p1, p2, p3) {
        this.origin = p1;
        this.type = 'R';

        let u = glVec3.sub(p2, p1).normalize(),
            v = glVec3.sub(p3, p1).normalize(),
            w = glVec3.cross(u, v).normalize();

        v = glVec3.cross(w, u);

        this.mat.arr33 = [
            [u[0], u[1], u[2]],
            [v[0], v[1], v[2]],
            [w[0], w[1], w[2]]
        ];
    }
    multVector(v) {
        return this.mat.multVector(v);
    }
    cylinderDispl(v, c) {
        let cv = glVec3.sub(c, this.origin),
            nv = new glVec3(this.mat[0][2], this.mat[1][2], this.mat[2][2]),
            rv = new glVec3(
                (1 - nv[0] ** 2) * cv[0] - nv[0] * nv[1] * cv[1] - nv[0] * nv[2] * cv[2],
                -nv[0] * nv[1] * cv[0] + (1 - nv[1] ** 2) * cv[1] - nv[1] * nv[2] * cv[2],
                -nv[0] * nv[2] * cv[0] - nv[1] * nv[2] * cv[1] + (1 - nv[2] ** 2) * cv[2]
            ).normalize(),
            tv = glVec3.cross(nv, rv);

        return new glVec3(
            rv[0] * v[0] + tv[0] * v[1] + nv[0] * v[2],
            rv[1] * v[0] + tv[1] * v[1] + nv[1] * v[2],
            rv[2] * v[0] + tv[2] * v[1] + nv[2] * v[2]
        );
    }
}