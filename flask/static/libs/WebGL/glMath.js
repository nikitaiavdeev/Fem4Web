class glMath {
	constructor() {
		this.PI = Math.PI || 3.14159265359;
		this.PiOver2 = this.PI * 0.5;
		this.PiOver4 = this.PI * 0.25;
		this.TwoPi = this.PI * 2;
		this.PI180 = this.PI / 180;
		this.PI180Rev = 180 / this.PI;
		this.GlEpsilon = 1e-06;
	}
	static Rad2Deg(d) {
		return d / this.PI180;
	}
	static Deg2Rad(d) {
		return d * this.PI180;
	}
}
const $glMath = new glMath();

//------------glVec3------------
class glVec3 {
	constructor(x = 0, y = 0, z = 0) {
		this.xyz = [x, y, z];
	}
	get length() {
		let v = this.xyz;

		return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	}
	get x() {
		return this.xyz[0];
	}
	get y() {
		return this.xyz[1];
	}
	get z() {
		return this.xyz[2];
	}
	copy(inpV) {
		let v = inpV.xyz || inpV;
		this.xyz = v;
	}
	add(inpV) {
		let v = this.xyz,
			vv = inpV.xyz || inpV;
		v[0] += vv[0];
		v[1] += vv[1];
		v[2] += vv[2];

		return this;
	}
	scaleAndAdd(inpV, s) {
		let v = this.xyz,
			vv = inpV.xyz || inpV;
		v[0] += s * vv[0];
		v[1] += s * vv[1];
		v[2] += s * vv[2];

		return this;
	}
	sub(inpV) {
		let v = this.xyz,
			vv = inpV.xyz || inpV;
		v[0] -= vv[0];
		v[1] -= vv[1];
		v[2] -= vv[2];

		return this;
	}
	normalize() {
		let v = this.xyz,
			invL = 1 / this.length;
		v[0] *= invL;
		v[1] *= invL;
		v[2] *= invL;

		return this;
	}
	scale(s) {
		let v = this.xyz;
		v[0] *= s;
		v[1] *= s;
		v[2] *= s;

		return this;
	}
	dot(inpV) {
		let v = this.xyz,
			vv = inpV.xyz || inpV;

		return v[0] * vv[0] + v[1] * vv[1] + v[2] * vv[2];
	}
	cross(inpV) {
		let v = this.xyz,
			vv = inpV.xyz || inpV;
		this.xyz = [v[1] * vv[2] - v[2] * vv[1], v[2] * vv[0] - v[0] * vv[2], v[0] * vv[1] - v[1] * vv[0]];

		return this;
	}
	lerp(inpV, t) {
		let v = this.xyz,
			vv = inpV.xyz || inpV;
		this.xyz = [(1 - t) * v[0] + t * vv[0], (1 - t) * v[1] + t * vv[1], (1 - t) * v[2] + t * vv[2]];

		return this;
	}
	static getNormal(inpP1, inpP2, inpP3) {
		let p1 = inpP1.xyz || inpP1,
			p2 = inpP2.xyz || inpP2,
			p3 = inpP3.xyz || inpP3,
			v = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]],
			vv = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

		return new glVec3(v[1] * vv[2] - v[2] * vv[1], v[2] * vv[0] - v[0] * vv[2], v[0] * vv[1] - v[1] * vv[0]).normalize();
	}
	static clone() {
		let v = this.xyz;

		return new glVec3(v[0], v[1], v[2]);
	}
	static cross(inpV, inpVV) {
		let v = inpV.xyz || inpV,
			vv = inpVV.xyz || inpVV;

		return new glVec3(v[1] * vv[2] - v[2] * vv[1], v[2] * vv[0] - v[0] * vv[2], v[0] * vv[1] - v[1] * vv[0]);
	}
	static dot(inpV, inpVV) {
		let v = inpV.xyz || inpV,
			vv = inpVV.xyz || inpVV;

		return v[0] * vv[0] + v[1] * vv[1] + v[2] * vv[2];
	}
	static sub(inpV, inpVV) {
		let v = inpV.xyz || inpV,
			vv = inpVV.xyz || inpVV;

		return new glVec3(v[0] - vv[0], v[1] - vv[1], v[2] - vv[2]);
	}
	static add(inpV, inpVV) {
		let v = inpV.xyz || inpV,
			vv = inpVV.xyz || inpVV;

		return new glVec3(v[0] + vv[0], v[1] + vv[1], v[2] + vv[2]);
	}
	static scaleAndAdd(...args){
		let ans = new glVec3(),
			v;
		for(let i = 0; i < args.length; i += 2){
			v = args[i].xyz||args[i];
			ans.xyz[0] += args[i+1] * v[0];
			ans.xyz[1] += args[i+1] * v[1];
			ans.xyz[2] += args[i+1] * v[2];
		}
		return ans;
	}
	static lerp(inpV, inpVV, t) {
		let v = inpV.xyz || inpV,
			vv = inpVV.xyz || inpVV,
			s = (1 - t);

		return new glVec3(s * v[0] + t * vv[0], s * v[1] + t * vv[1], s * v[2] + t * vv[2]);
	}
	static average(...points) {
		let avg = new glVec3(),
			inv = 1 / points.length;
		for (const p of points) {
			avg.xyz[0] += p.xyz[0] * inv;
			avg.xyz[1] += p.xyz[1] * inv;
			avg.xyz[2] += p.xyz[2] * inv;
		}
		return avg;
	}
}

//------------gl3D.glMat3------------
class glMat3 {
	constructor(
		a00 = 1, a03 = 0, a06 = 0,
		a01 = 0, a04 = 1, a07 = 0,
		a02 = 0, a05 = 0, a08 = 1) {
		this.arr33 = [
			a00, a01, a02,
			a03, a04, a05,
			a06, a07, a08
		];

		return this;
	}
	fromQuaternion(inpQ) {
		let q = inpQ.xyzw;
		this.arr33 = [
			1 - 2 * (q[1] * q[1] + q[2] * q[2]), 2 * (q[1] * q[0] - q[2] * q[3]), 2 * (q[2] * q[0] + q[1] * q[3]),
			2 * (q[1] * q[0] + q[2] * q[3]), 1 - 2 * (q[0] * q[0] + q[2] * q[2]), 2 * (q[2] * q[1] - q[0] * q[3]),
			2 * (q[2] * q[0] - q[1] * q[3]), 2 * (q[2] * q[1] + q[0] * q[3]), 1 - 2 * (q[0] * q[0] + q[1] * q[1])
		];
		return this;
	}
	fromQuaternionNorm(inpQ) {
		//Create inversed transposed matrix for Normals
		let q = inpQ.xyzw || inpQ,
			m = [1 - 2 * (q[1] * q[1] + q[2] * q[2]), 2 * (q[1] * q[0] - q[2] * q[3]), 2 * (q[2] * q[0] + q[1] * q[3]),
				2 * (q[1] * q[0] + q[2] * q[3]), 1 - 2 * (q[0] * q[0] + q[2] * q[2]), 2 * (q[2] * q[1] - q[0] * q[3]),
				2 * (q[2] * q[0] - q[1] * q[3]), 2 * (q[2] * q[1] + q[0] * q[3]), 1 - 2 * (q[0] * q[0] + q[1] * q[1])
			],
			n = [m[4] * m[8] - m[5] * m[7],
				m[3] * m[8] - m[5] * m[6],
				m[3] * m[7] - m[4] * m[6]
			];

		this.arr33 = [n[0], -n[1], n[2],
			-m[1] * m[8] + m[2] * m[7], m[0] * m[8] - m[2] * m[6], -m[0] * m[7] + m[1] * m[6],
			m[1] * m[5] - m[2] * m[4], -m[0] * m[5] + m[2] * m[3], m[0] * m[4] - m[1] * m[3]
		];
		return this;
	}
}

//------------gl3D.glMat3------------
class glMat33 {
	constructor(...arr) {
		if (arr.length == 9)
			this.arr33 = [
				[arr[0], arr[1], arr[2]],
				[arr[3], arr[4], arr[5]],
				[arr[6], arr[7], arr[8]]
			];
		else if (arr.length == 1)
			this.arr33 = arr;
		else
			this.arr33 = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1]
			];

		return this;
	}
	vecMult(inpV) {
		let v = inpV.xyz || inpV,
			m = this.arr33;
		return new glVec3(
			m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
			m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
			m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
		);
	}
	static vecMult(inpM, inpV) {
		let v = inpV.xyz || inpV,
			m = inpM.arr33 || inpM;
		return new glVec3(
			m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
			m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
			m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
		);
	}
}

//------------gl3D.glMat4------------
class glMat4 {
	constructor(
		a00 = 1, a04 = 0, a08 = 0, a12 = 0,
		a01 = 0, a05 = 1, a09 = 0, a13 = 0,
		a02 = 0, a06 = 0, a10 = 1, a14 = 0,
		a03 = 0, a07 = 0, a11 = 0, a15 = 1) {

		this.arr44 = [
			a00, a01, a02, a03,
			a04, a05, a06, a07,
			a08, a09, a10, a11,
			a12, a13, a14, a15
		];
	}
	createPerspective(fovy, a, n, f) {
		let fv = 1 / Math.tan(fovy / 2),
			nf = 1 / (n - f);

		this.arr44 = [
			fv / a, 0, 0, 0,
			0, fv, 0, 0,
			0, 0, (n + f) * nf, n * f * nf * 2,
			0, 0, -1, 0
		];
		return this;
	}
	createOrtho(l, r, b, t, n, f) {
		let rl = 1 / (r - l),
			tb = 1 / (t - b),
			fn = 1 / (f - n);

		this.arr44 = [
			2 * rl, 0, 0, 0,
			0, 2 * tb, 0, 0,
			0, 0, -2 * fn, 0,
			-(l + r) * rl, -(t + b) * tb, -(f + n) * fn, 1
		];

		return this;
	}
	fromQuaternion(inpQ) {
		let q = inpQ.xyzw || inpQ;
		this.arr44 = [
			1 - 2 * (q[1] * q[1] + q[2] * q[2]), 2 * (q[1] * q[0] - q[2] * q[3]), 2 * (q[2] * q[0] + q[1] * q[3]), 0,
			2 * (q[1] * q[0] + q[2] * q[3]), 1 - 2 * (q[0] * q[0] + q[2] * q[2]), 2 * (q[2] * q[1] - q[0] * q[3]), 0,
			2 * (q[2] * q[0] - q[1] * q[3]), 2 * (q[2] * q[1] + q[0] * q[3]), 1 - 2 * (q[0] * q[0] + q[1] * q[1]), 0,
			0, 0, 0, 1
		];
		return this;
	}
	fromQuaternionVC(inpQ, size) { //function for view cid
		let q = inpQ.xyzw || inpQ;
		this.arr44 = [
			(1 - 2 * (q[1] * q[1] + q[2] * q[2])) / size, 2 * (q[1] * q[0] - q[2] * q[3]) / size, -2 * (q[2] * q[0] + q[1] * q[3]) / 1000, 0,
			2 * (q[1] * q[0] + q[2] * q[3]) / size, (1 - 2 * (q[0] * q[0] + q[2] * q[2])) / size, -2 * (q[2] * q[1] - q[0] * q[3]) / 1000, 0,
			2 * (q[2] * q[0] - q[1] * q[3]) / size, 2 * (q[2] * q[1] + q[0] * q[3]) / size, -(1 - 2 * (q[0] * q[0] + q[1] * q[1])) / 1000, 0,
			0, 0, -2 * size / 40, 1
		];
		return this;
	}
	translate(inpV) {
		let m = this.arr44,
			v = inpV.xyz || inpV;

		m[12] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12];
		m[13] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13];
		m[14] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14];
		m[15] = m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15];

		return this;
	}
	static createLookAt(eye, target, up) {
		let f = glVec3.sub(eye, target).normalize(),
			r = glVec3.cross(up, f).normalize(),
			u = glVec3.cross(f, r),
			fv = f.xyz,
			rv = r.xyz,
			uv = u.xyz;

		return new glMat4(
			rv[0], uv[0], fv[0], -r.dot(eye),
			rv[1], uv[1], fv[1], -u.dot(eye),
			rv[2], uv[2], fv[2], -f.dot(eye),
			0, 0, 0, 1
		);
	}
	static createView(zoom, center, inpQ) {
		let q = inpQ.xyzw || inpQ,
			cv = center.xyz || center,
			rv = [(1 - 2 * (q[1] * q[1] + q[2] * q[2])) * zoom, 2 * (q[1] * q[0] + q[2] * q[3]) * zoom, 2 * (q[2] * q[0] - q[1] * q[3]) * zoom],
			uv = [2 * (q[1] * q[0] - q[2] * q[3]) * zoom, (1 - 2 * (q[0] * q[0] + q[2] * q[2])) * zoom, 2 * (q[2] * q[1] + q[0] * q[3]) * zoom],
			fv = [2 * (q[2] * q[0] + q[1] * q[3]) * zoom, 2 * (q[2] * q[1] - q[0] * q[3]) * zoom, (1 - 2 * (q[0] * q[0] + q[1] * q[1])) * zoom];

		return new glMat4(
			rv[0], rv[1], rv[2], -(rv[0] * cv[0] + rv[1] * cv[1] + rv[2] * cv[2]),
			uv[0], uv[1], uv[2], -(uv[0] * cv[0] + uv[1] * cv[1] + uv[2] * cv[2]),
			fv[0], fv[1], fv[2], -(fv[0] * cv[0] + fv[1] * cv[1] + fv[2] * cv[2]),
			0, 0, 0, 1
		);
	}
	static LookAtQuat(q, eye) {
		let rv = q.xAxis.xyz,
			uv = q.yAxis.xyz,
			fv = q.zAxis.xyz,
			ev = eye.xyz || eye;

		return new glMat4(
			rv[0], rv[1], rv[2], -(rv[0] * ev[0] + rv[1] * ev[1] + rv[2] * ev[2]),
			uv[0], uv[1], uv[2], -(uv[0] * ev[0] + uv[1] * ev[1] + uv[2] * ev[2]),
			fv[0], fv[1], fv[2], -(fv[0] * ev[0] + fv[1] * ev[1] + fv[2] * ev[2]),
			0, 0, 0, 1
		);
	}
	static multiply(inpM, inpMM) {
		let m = inpM.arr44 || inpM,
			mm = inpMM.arr44 || inpMM;

		return new glMat4(
			m[0] * mm[0] + m[4] * mm[1] + m[8] * mm[2] + m[12] * mm[3],
			m[0] * mm[4] + m[4] * mm[5] + m[8] * mm[6] + m[12] * mm[7],
			m[0] * mm[8] + m[4] * mm[9] + m[8] * mm[10] + m[12] * mm[11],
			m[0] * mm[12] + m[4] * mm[13] + m[8] * mm[14] + m[12] * mm[15],

			m[1] * mm[0] + m[5] * mm[1] + m[9] * mm[2] + m[13] * mm[3],
			m[1] * mm[4] + m[5] * mm[5] + m[9] * mm[6] + m[13] * mm[7],
			m[1] * mm[8] + m[5] * mm[9] + m[9] * mm[10] + m[13] * mm[11],
			m[1] * mm[12] + m[5] * mm[13] + m[9] * mm[14] + m[13] * mm[15],

			m[2] * mm[0] + m[6] * mm[1] + m[10] * mm[2] + m[14] * mm[3],
			m[2] * mm[4] + m[6] * mm[5] + m[10] * mm[6] + m[14] * mm[7],
			m[2] * mm[8] + m[6] * mm[9] + m[10] * mm[10] + m[14] * mm[11],
			m[2] * mm[12] + m[6] * mm[13] + m[10] * mm[14] + m[14] * mm[15],


			m[3] * mm[0] + m[7] * mm[1] + m[11] * mm[2] + m[15] * mm[3],
			m[3] * mm[4] + m[7] * mm[5] + m[11] * mm[6] + m[15] * mm[7],
			m[3] * mm[8] + m[7] * mm[9] + m[11] * mm[10] + m[15] * mm[11],
			m[3] * mm[12] + m[7] * mm[13] + m[11] * mm[14] + m[15] * mm[15]
		);
	}
}

//------------gl3D.glQuat------------
class glQuat {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.xyzw = [x, y, z, w];
	}
	copy(inpQ) {
		let q = inpQ.xyzw || inpQ;
		this.xyzw = [q[0], q[1], q[2], q[3]];
	}
	multiply(inpQ) {
		let q = this.xyzw,
			qq = inpQ.xyzw || inpQ;
		this.xyzw = [q[0] * qq[3] + q[3] * qq[0] + q[1] * qq[2] - q[2] * qq[1],
			q[1] * qq[3] + q[3] * qq[1] + q[2] * qq[0] - q[0] * qq[2],
			q[2] * qq[3] + q[3] * qq[2] + q[0] * qq[1] - q[1] * qq[0],
			q[3] * qq[3] - q[0] * qq[0] - q[1] * qq[1] - q[2] * qq[2]
		];

		return this;
	}
	dot(inpQ) {
		let q = this.xyzw,
			qq = inpQ.xyzw || inpQ;
		return q[0] * qq[0] + q[1] * qq[1] + q[2] * qq[2] + q[3] * qq[3];
	}
	length() {
		let q = this.xyzw;
		return Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
	}
	normalize() {
		let q = this.xyzw,
			norm = 1 / this.length();
		q[0] *= norm;
		q[1] *= norm;
		q[2] *= norm;
		q[3] *= norm;
		return this;
	}
	slerp(inpQ, t, isShortestPath = false) {
		let q = this.xyzw,
			qq = inpQ.xyzw || inpQ,
			qqS,
			c = q[0] * qq[0] + q[1] * qq[1] + q[2] * qq[2] + q[3] * qq[3];

		// Do we need to invert rotation?
		if (c < 0 && isShortestPath) {
			c = -c;
			qqS = [-qq[0], -qq[1], -qq[2], -qq[3]];
		} else {
			qqS = [qq[0], qq[1], qq[2], qq[3]];
		}

		let s = 1 - c * c;
		if (s <= $glMath.GlEpsilon) {
			s = 1 - t;
			q = [
				s * q[0] + t * qqS[0], s * q[1] + t * qqS[1], s * q[2] + t * qqS[2], s * q[3] + t * qqS[3]
			];
			this.normalize();
			return this;
		}

		// Standard case (slerp)
		s = Math.sqrt(s);
		let a = Math.atan2(s, c),
			c0 = Math.sin((1 - t) * a) / s,
			c1 = Math.sin(t * a) / s;

		q = [
			c0 * q[0] + c1 * qqS[0], c0 * q[1] + c1 * qqS[1], c0 * q[2] + c1 * qqS[2], c0 * q[3] + c1 * qqS[3]
		];
		return this;
	}
	fromAngleAxis(inpV, a) {
		let v = inpV.xyz || inpV,
			s = Math.sin(a / 2),
			c = Math.cos(a / 2);
		this.xyzw = [s * v[0], s * v[1], s * v[2], c];
	}
	fromEuler(v) { // v = angles
		let c1 = Math.cos(v[0] / 2), //roll (x)
			c2 = Math.cos(v[1] / 2), //pitch (y)
			c3 = Math.cos(v[2] / 2), //yaw (z)

			s1 = Math.sin(v[0] / 2),
			s2 = Math.sin(v[1] / 2),
			s3 = Math.sin(v[2] / 2);

		this.xyzw = [
			c3 * c2 * s1 - s3 * s2 * c1,
			s3 * c2 * s1 + c3 * s2 * c1,
			s3 * c2 * c1 - c3 * s2 * s1,
			c3 * c2 * c1 + s3 * s2 * s1
		];
	}
	from2AngleAxis(inpV1, a1, inpV2, a2) {
		let inpV3 = glVec3.cross(inpV1, inpV2),
			v1 = inpV1.xyz || inpV1,
			v2 = inpV2.xyz || inpV2,
			v3 = inpV3.xyz,
			s1 = Math.sin(a1 / 2),
			c1 = Math.cos(a1 / 2),
			s2 = Math.sin(a2 / 2),
			c2 = Math.cos(a2 / 2);

		//calc Quaternion from unit axis
		let qv = glQuat.fromUnitVectors(inpV1, inpV2, inpV3).xyzw;

		//calc Quaternion rotation aroun unit axis
		let qr = [
			s1 * v1[0] * c2 + c1 * s2 * v2[0] + s1 * v1[1] * s2 * v2[2] - s1 * v1[2] * s2 * v2[1],
			s1 * v1[1] * c2 + c1 * s2 * v2[1] + s1 * v1[2] * s2 * v2[0] - s1 * v1[0] * s2 * v2[2],
			s1 * v1[2] * c2 + c1 * s2 * v2[2] + s1 * v1[0] * s2 * v2[1] - s1 * v1[1] * s2 * v2[0],
			c1 * c2 - s1 * v1[0] * s2 * v2[0] - s1 * v1[1] * s2 * v2[1] - s1 * v1[2] * s2 * v2[2]
		];

		//multiply them
		this.xyzw = [
			qr[0] * qv[3] + qr[3] * qv[0] + qr[1] * qv[2] - qr[2] * qv[1],
			qr[1] * qv[3] + qr[3] * qv[1] + qr[2] * qv[0] - qr[0] * qv[2],
			qr[2] * qv[3] + qr[3] * qv[2] + qr[0] * qv[1] - qr[1] * qv[0],
			qr[3] * qv[3] - qr[0] * qv[0] - qr[1] * qv[1] - qr[2] * qv[2]
		];
	}
	get xAxis() {
		let q = this.xyzw;

		return new glVec3(1 - 2 * (q[1] * q[1] + q[2] * q[2]), 2 * (q[1] * q[0] + q[2] * q[3]), 2 * (q[2] * q[0] - q[1] * q[3]));
	}
	get yAxis() {
		let q = this.xyzw;

		return new glVec3(2 * (q[1] * q[0] - q[2] * q[3]), 1 - 2 * (q[0] * q[0] + q[2] * q[2]), 2 * (q[2] * q[1] + q[0] * q[3]));
	}
	get zAxis() {
		let q = this.xyzw;

		return new glVec3(2 * (q[2] * q[0] + q[1] * q[3]), 2 * (q[2] * q[1] - q[0] * q[3]), 1 - 2 * (q[0] * q[0] + q[1] * q[1]));
	}
	static toRotMatrix() {
		let q = this.xyzw;

		return new glMat3(
			1 - 2 * (q[1] * q[1] + q[2] * q[2]), 2 * (q[1] * q[0] - q[2] * q[3]), 2 * (q[2] * q[0] + q[1] * q[3]),
			2 * (q[1] * q[0] + q[2] * q[3]), 1 - 2 * (q[0] * q[0] + q[2] * q[2]), 2 * (q[2] * q[1] - q[0] * q[3]),
			2 * (q[2] * q[0] - q[1] * q[3]), 2 * (q[2] * q[1] + q[0] * q[3]), 1 - 2 * (q[0] * q[0] + q[1] * q[1])
		);
	}
	static clone() {
		let q = this.xyzw;
		return new glQuat(q[0], q[1], q[2], q[3]);
	}
	static vecMult(inpQ, inpV) {
		let q = inpQ.xyzw,
			v = inpV.xyz,
			uv = [q[1] * v[2] - q[2] * v[1], q[2] * v[0] - q[0] * v[2], q[0] * v[1] - q[1] * v[0]],
			uuv = [q[1] * uv[2] - q[2] * uv[1], q[2] * uv[0] - q[0] * uv[2], q[0] * uv[1] - q[1] * uv[0]];

		return new glVec3(v[0] + 2 * q[3] * uv[0] + 2 * uuv[0], v[1] + 2 * q[3] * uv[1] + 2 * uuv[1], v[2] + 2 * q[3] * uv[2] + 2 * uuv[2]);
	}
	static slerp(inpQ, inpQQ, t, isShortestPath = false) {
		let q = inpQ.xyzw || inpQ,
			qq = inpQQ.xyzw || inpQQ,
			qqS,
			c = q[0] * qq[0] + q[1] * qq[1] + q[2] * qq[2] + q[3] * qq[3];

		// Do we need to invert rotation?
		if (c < 0 && isShortestPath) {
			c = -c;
			qqS = [-qq[0], -qq[1], -qq[2], -qq[3]];
		} else {
			qqS = [qq[0], qq[1], qq[2], qq[3]];
		}

		let s = 1 - c * c;

		if (s <= $glMath.GlEpsilon) {
			s = 1 - t;
			let out = new glQuat(
				s * q[0] + t * qqS[0], s * q[1] + t * qqS[1], s * q[2] + t * qqS[2], s * q[3] + t * qqS[3]
			);
			out.normalize();
			return out;
		}

		s = Math.sqrt(s);
		let a = Math.atan2(s, c),
			c0 = Math.sin((1 - t) * a) / s,
			c1 = Math.sin(t * a) / s;

		return new glQuat(
			c0 * q[0] + c1 * qqS[0], c0 * q[1] + c1 * qqS[1], c0 * q[2] + c1 * qqS[2], c0 * q[3] + c1 * qqS[3]
		);
	}
	static fromUnitVectors(inpV1, inpV2, inpV3) {
		let v1 = inpV1.xyz || inpV1,
			v2 = inpV2.xyz || inpV2,
			v3 = inpV3.xyz || inpV2,
			sv;

		if (v1[0] + v2[1] + v3[2] > 0) {
			sv = 0.5 / Math.sqrt(1 + v1[0] + v2[1] + v3[2]);
			return new glQuat(
				(v2[2] - v3[1]) * sv,
				(v3[0] - v1[2]) * sv,
				(v1[1] - v2[0]) * sv,
				0.25 / sv
			);
		} else if (v1[0] > v2[1] && v1[0] > v3[2]) {
			sv = 0.5 / Math.sqrt(1.0 + v1[0] - v2[1] - v3[2]);
			return new glQuat(
				0.25 / sv,
				(v2[0] + v1[1]) * sv,
				(v3[0] + v1[2]) * sv,
				(v2[2] - v3[1]) * sv
			);
		} else if (v2[1] > v3[2]) {
			sv = 0.5 / Math.sqrt(1.0 + v2[1] - v1[0] - v3[2]);
			return new glQuat(
				(v2[0] + v1[1]) * sv,
				0.25 / sv,
				(v3[1] + v2[2]) * sv,
				(v3[0] - v1[2]) * sv
			);
		} else {
			sv = 0.5 / Math.sqrt(1.0 + v3[2] - v1[0] - v2[1]);
			return new glQuat(
				(v3[0] + v1[2]) * sv,
				(v3[1] + v2[2]) * sv,
				0.25 / sv,
				(v1[1] - v2[0]) * sv
			);
		}
	}
}