let gl3D = {};

gl3D.glMath = (function(){
	let obj = {};
	obj.PI = Math.PI;
	let PI180 = obj.PI/180, PI180_rev = 180/obj.PI;
	
	obj.Log10E = Math.LOG10E || 0.4342945;
	obj.Log2E = Math.LOG2E || 1.442695;
	obj.PiOver2 = obj.PI*0.5;
	obj.PiOver4 = obj.PI*0.25;
	obj.TwoPi = obj.PI*2;
	obj.PiOver360 = obj.PI/360;
	obj.PiOver180 = PI180;
	obj.GlEpsilon = 1e-03;
	obj.GlPrecision = 1e-06;
	
	obj.Rad2Deg = function(d){
		return d * PI180_rev;
	};
	obj.Deg2Rad = function(d){
		return d * PI180;
	};

	return obj;
})();

//------------gl3D.glVec3------------

gl3D.glVec3 = function(x, y, z){
	this.elements = [x, y, z];
	return this;
};

gl3D.glVec3.prototype = {
	constructor:gl3D.glVec3,
	identity:function(){
		this.elements = [0,0,0];
	},
	clone:function(){
		let v = this.elements;
		return new this.constructor(v[0],v[1],v[2]);
	},
	copy:function(inpV){
		let v = inpV.elements;
		this.elements = [v[0],v[1],v[2]];
		return this;
	},
	length:function(){
		let v = this.elements;
		return Math.hypot(v[0], v[1], v[2]);
	},
	add:function(inpV){
		let v = this.elements,
			vv = inpV.elements;
		v[0]+=vv[0];v[1]+=vv[1];v[2]+=vv[2];
		return this;
	},
	sub:function(inpV){
		let v = this.elements,
			vv = inpV.elements;
		v[0]-=vv[0];v[1]-=vv[1];v[2]-=vv[2];
		return this;
	},
	normalize:function(){
		let v = this.elements,
			invL = 1/Math.hypot(v[0], v[1], v[2]);
		v[0]*=invL;v[1]*=invL;v[2]*=invL;
		return this; 
	},
	dot:function(inpV){
		let v = this.elements,
			vv = inpV.elements;
		return v[0]*vv[0] + v[1]*vv[1] + v[2]*vv[2];
	},
	lerp:function(inpV, t){
		let v = this.elements,
			vv = inpV.elements;
		this.elements = [
			(1-t)*v[0] + t*vv[0], (1-t)*v[1] + t*vv[1], (1-t)*v[2] + t*vv[2]
			];
		return this;
	},
	cross:function(inpV){
		let v = this.elements,
			vv = inpV.elements;

		this.elements = [v[1]*vv[2] - v[2]*vv[1], v[2]*vv[0] - v[0]*vv[2], v[0]*vv[1] - v[1]*vv[0]];

		return this;
	},
	scaleAndAdd:function(inpV, s){
		let v = this.elements,
			vv = inpV.elements;
		v[0]+=s*vv[0];v[1]+=s*vv[1];v[2]+=s*vv[2];
		return this;
	},
	scale:function(s){
		let v = this.elements;
		this.elements = [s*v[0], s*v[1], s*v[2]];
		return this;
	},
	getNormal(p1, p2, p3){
		let v = [p2[0]-p1[0], p2[1]-p1[1], p2[2]-p1[2]],
			vv = [p3[0]-p1[0], p3[1]-p1[1], p3[2]-p1[2]];

		this.elements = [v[1]*vv[2] - v[2]*vv[1], v[2]*vv[0] - v[0]*vv[2], v[0]*vv[1] - v[1]*vv[0]];
		this.normalize();
		return this;
	}
};

gl3D.glVec3.create = function(){
	return new $glVec3(0,0,0);
};
gl3D.glVec3.cross = function(inpV, inpVV){
	let v = inpV.elements,
		vv = inpVV.elements;
	
	return new $glVec3(v[1]*vv[2] - v[2]*vv[1], v[2]*vv[0] - v[0]*vv[2], v[0]*vv[1] - v[1]*vv[0]);
};
gl3D.glVec3.sub = function(inpV, inpVV){
	let v = inpV.elements,
		vv = inpVV.elements;
	
	return new $glVec3(v[0]-vv[0], v[1]-vv[1], v[2]-vv[2]);
};
gl3D.glVec3.add = function(inpV, inpVV){
	let v = inpV.elements,
		vv = inpVV.elements;
	
	return new $glVec3(v[0]+vv[0], v[1]+vv[1], v[2]+vv[2]);
};
gl3D.glVec3.scaleAndAdd = function(inpV, inpVV, s){
	let v = inpV.elements,
		vv = inpVV.elements;
	
	return new $glVec3(v[0]+s*vv[0], v[1]+s*vv[1], v[2]+s*vv[2]);
};
gl3D.glVec3.lerp = function(inpV, inpVV, t){
	let v = inpV.elements,
		vv = inpVV.elements,
		s = (1 - t);

	return new $glVec3(s*v[0] + t*vv[0], s*v[1] + t*vv[1], s*v[2] + t*vv[2]);
};

//------------gl3D.glMat3------------

gl3D.glMat3 = function(a00,a03,a06,
					a01,a04,a07,
					a02,a05,a08){
	this.elements = [
		a00,a01,a02,
		a03,a04,a05,
		a06,a07,a08
	];

	return this;
};

gl3D.glMat3.prototype = {
	constructor:gl3D.glMat3,
	identity:function(){
		this.elements = [1,0,0,
						0,1,0,
						0,0,1];
	},
	fromQuaternion(inpQ){
		let q = inpQ.elements;
		this.elements = [
			1-2*(q[1]*q[1]+q[2]*q[2]),   2*(q[1]*q[0]-q[2]*q[3]),   2*(q[2]*q[0]+q[1]*q[3]),
			  2*(q[1]*q[0]+q[2]*q[3]), 1-2*(q[0]*q[0]+q[2]*q[2]),   2*(q[2]*q[1]-q[0]*q[3]),
			  2*(q[2]*q[0]-q[1]*q[3]),   2*(q[2]*q[1]+q[0]*q[3]), 1-2*(q[0]*q[0]+q[1]*q[1])
			  ];
		return this;
	},
	fromQuaternionNorm:function(inpQ){
		//Create inversed transposed matrix for Normals
		let q = inpQ.elements;
		let m = [1-2*(q[1]*q[1]+q[2]*q[2]),   2*(q[1]*q[0]-q[2]*q[3]),   2*(q[2]*q[0]+q[1]*q[3]),
				   2*(q[1]*q[0]+q[2]*q[3]), 1-2*(q[0]*q[0]+q[2]*q[2]),   2*(q[2]*q[1]-q[0]*q[3]),
				   2*(q[2]*q[0]-q[1]*q[3]),   2*(q[2]*q[1]+q[0]*q[3]), 1-2*(q[0]*q[0]+q[1]*q[1])],
			n = [m[4]*m[8] - m[5]*m[7],
				 m[3]*m[8] - m[5]*m[6],
				 m[3]*m[7] - m[4]*m[6]];

		this.elements = [ 	n[0], 
							-n[1], 
							n[2],
							
							-(m[1]*m[8] - m[2]*m[7]),
							(m[0]*m[8] - m[2]*m[6]),
							-(m[0]*m[7] - m[1]*m[6]),
		
							(m[1]*m[5] - m[2]*m[4]),
							-(m[0]*m[5] - m[2]*m[3]),
							(m[0]*m[4] - m[1]*m[3])
							];
		return this;	
	}
};

gl3D.glMat3.create = function(){
	return new gl3D.glMat3( 1,0,0,
							0,1,0,
							0,0,1);
};

//------------gl3D.glMat4------------

gl3D.glMat4 = function( a00,a04,a08,a12,
						a01,a05,a09,a13,
						a02,a06,a10,a14,
						a03,a07,a11,a15){
	this.elements =  [
		a00,a01,a02,a03,
		a04,a05,a06,a07,
		a08,a09,a10,a11,
		a12,a13,a14,a15
	];
	return this;
};

gl3D.glMat4.prototype = {
	constructor:gl3D.glMat4,
	
	identity:function(){
		this.elements = [1,0,0,0,
						0,1,0,0,
						0,0,1,0,
						0,0,0,1];
	},
	createPerspective:function(fovy, a, n, f){
		let fv = 1 / Math.tan(fovy/2),
			nf = 1 / (n - f);
		
		this.elements = [
			fv/a,	0 , 0 		, 0 ,
			0	,	fv, 0 		, 0 ,
			0	,	0 , (n+f)*nf, n*f*nf*2,
			0	, 	0 , -1 		, 0
			]
		return this;
	},
	createOrtho:function(l,r,b,t,n,f){
		let rl = 1/(r - l),
			tb = 1/(t - b),
			fn = 1/(f - n);

		this.elements = [
			2*rl,       0,          0,          0,
			0,          2*tb,       0,          0,
			0,          0,          -2*fn,      0,
			-(l+r)*rl,  -(t+b)*tb,  -(f+n)*fn,  1
			];
			
		return this;
	},
	fromQuaternion(inpQ){
		let q = inpQ.elements;
		this.elements = [
			1-2*(q[1]*q[1]+q[2]*q[2]),   2*(q[1]*q[0]-q[2]*q[3]),   2*(q[2]*q[0]+q[1]*q[3]), 0,
			  2*(q[1]*q[0]+q[2]*q[3]), 1-2*(q[0]*q[0]+q[2]*q[2]),   2*(q[2]*q[1]-q[0]*q[3]), 0,
			  2*(q[2]*q[0]-q[1]*q[3]),   2*(q[2]*q[1]+q[0]*q[3]), 1-2*(q[0]*q[0]+q[1]*q[1]), 0,
			  0                      ,   0                      ,   0                      , 1
			  ];
		return this;
    },
	fromQuaternionVC(inpQ, size){
		let q = inpQ.elements;
		this.elements = [
			(1-2*(q[1]*q[1]+q[2]*q[2]))/size,    2*(q[1]*q[0]-q[2]*q[3])/size ,     -2*(q[2]*q[0]+q[1]*q[3])/1000 , 0,
			   2*(q[1]*q[0]+q[2]*q[3])/size , (1-2*(q[0]*q[0]+q[2]*q[2]))/size,     -2*(q[2]*q[1]-q[0]*q[3])/1000 , 0,
			   2*(q[2]*q[0]-q[1]*q[3])/size ,    2*(q[2]*q[1]+q[0]*q[3])/size ,  -(1-2*(q[0]*q[0]+q[1]*q[1]))/1000, 0,
			   0                            ,   0                             ,      -2*size/40                 , 1
			  ];
		return this;
    },
	translate:function(inpV){
		let m = this.elements,
			v = inpV.elements;

		m[12] = m[0]*v[0] + m[4]*v[1] + m[8]*v[2] + m[12];
		m[13] = m[1]*v[0] + m[5]*v[1] + m[9]*v[2] + m[13];
		m[14] = m[2]*v[0] + m[6]*v[1] + m[10]*v[2] + m[14];
		m[15] = m[3]*v[0] + m[7]*v[1] + m[11]*v[2] + m[15];

		return this;
	}	
};

gl3D.glMat4.create = function(){
	return new gl3D.glMat4(1,0,0,0,
					0,1,0,0,
					0,0,1,0,
					0,0,0,1);
};

gl3D.glMat4.createLookAt = function(eye, target, up){
	let f = $glVec3.sub(eye, target).normalize(),
		r = $glVec3.cross(up, f).normalize(), 
		u = $glVec3.cross(f, r),
		
		fv = f.elements, 
		rv = r.elements, 
		uv = u.elements;

	return new $glMat4(
		rv[0],	uv[0],	fv[0],	-r.dot(eye),
		rv[1],	uv[1],	fv[1],	-u.dot(eye),
		rv[2],	uv[2],	fv[2],	-f.dot(eye),
		0,		0,		0,		1 
	);
};

gl3D.glMat4.createView = function(zoom, center, inpQ){
	let q = inpQ.elements,
		rv = [(1-2*(q[1]*q[1]+q[2]*q[2]))*zoom,     2*(q[1]*q[0]+q[2]*q[3])*zoom,     2*(q[2]*q[0]-q[1]*q[3])*zoom], 
		uv = [    2*(q[1]*q[0]-q[2]*q[3])*zoom, (1-2*(q[0]*q[0]+q[2]*q[2]))*zoom,     2*(q[2]*q[1]+q[0]*q[3])*zoom], 
		fv = [    2*(q[2]*q[0]+q[1]*q[3])*zoom,     2*(q[2]*q[1]-q[0]*q[3])*zoom, (1-2*(q[0]*q[0]+q[1]*q[1]))*zoom], 
		cv = center.elements;

	return new $glMat4(
		rv[0],	rv[1],	rv[2],	-(rv[0]*cv[0] + rv[1]*cv[1] + rv[2]*cv[2]),
		uv[0],	uv[1],	uv[2],	-(uv[0]*cv[0] + uv[1]*cv[1] + uv[2]*cv[2]),
		fv[0],	fv[1],	fv[2],	-(fv[0]*cv[0] + fv[1]*cv[1] + fv[2]*cv[2]),
		0,		0,		0,		1 
	);
}

gl3D.glMat4.LookAtQuat = function(q, eye){
	let rv = q.xAxis().elements, 
		uv = q.yAxis().elements, 
		fv = q.zAxis().elements, 
		ev = eye.elements;

	return new $glMat4(
		rv[0],	rv[1],	rv[2],	-(rv[0]*ev[0] + rv[1]*ev[1] + rv[2]*ev[2]),
		uv[0],	uv[1],	uv[2],	-(uv[0]*ev[0] + uv[1]*ev[1] + uv[2]*ev[2]),
		fv[0],	fv[1],	fv[2],	-(fv[0]*ev[0] + fv[1]*ev[1] + fv[2]*ev[2]),
		0,		0,		0,		1 
	);
};

gl3D.glMat4.multiply = function(inpM, inpMM){
    let m = inpM.elements,
        mm = inpMM.elements;
		
	return new $glMat4(
		m[0]*mm[0] + m[4]*mm[1] + m[8]*mm[2] + m[12]*mm[3],
		m[0]*mm[4] + m[4]*mm[5] + m[8]*mm[6] + m[12]*mm[7],
		m[0]*mm[8] + m[4]*mm[9] + m[8]*mm[10] + m[12]*mm[11],
		m[0]*mm[12] + m[4]*mm[13] + m[8]*mm[14] + m[12]*mm[15],
		
		m[1]*mm[0] + m[5]*mm[1] + m[9]*mm[2] + m[13]*mm[3],
		m[1]*mm[4] + m[5]*mm[5] + m[9]*mm[6] + m[13]*mm[7],
		m[1]*mm[8] + m[5]*mm[9] + m[9]*mm[10] + m[13]*mm[11],
		m[1]*mm[12] + m[5]*mm[13] + m[9]*mm[14] + m[13]*mm[15],
		
		m[2]*mm[0] + m[6]*mm[1] + m[10]*mm[2] + m[14]*mm[3],
		m[2]*mm[4] + m[6]*mm[5] + m[10]*mm[6] + m[14]*mm[7],
		m[2]*mm[8] + m[6]*mm[9] + m[10]*mm[10] + m[14]*mm[11],
		m[2]*mm[12] + m[6]*mm[13] + m[10]*mm[14] + m[14]*mm[15],
		
		
		m[3]*mm[0] + m[7]*mm[1] + m[11]*mm[2] + m[15]*mm[3],
		m[3]*mm[4] + m[7]*mm[5] + m[11]*mm[6] + m[15]*mm[7],
		m[3]*mm[8] + m[7]*mm[9] + m[11]*mm[10] + m[15]*mm[11],
		m[3]*mm[12] + m[7]*mm[13] + m[11]*mm[14] + m[15]*mm[15]
	);
};

//------------gl3D.glQuat------------

gl3D.glQuat = function(x, y, z, w){
	this.elements =  [x, y, z, w];
	return this;
};

gl3D.glQuat.prototype = {
	constructor:gl3D.glQuat,
	identity:function(){
		this.elements = [1, 0, 0, 0];
	},
	clone:function(){
		let q = this.elements;
		return new this.constructor(q[0],q[1],q[2],q[3]);
	},
	copy:function(inpQ){
		let q = inpQ.elements;
		this.elements = [q[0],q[1],q[2],q[3]];
		return this;
	},
	fromAngleAxis:function(inpV, a){
		let v = inpV.elements,
			s = Math.sin(a/2),
			c = Math.cos(a/2);
		this.elements = [s*v[0], s*v[1], s*v[2], c];
		return this;
	},
	fromEuler:function(v){
		let c1 = Math.cos( v[0] / 2 ), //roll (x)
			c2 = Math.cos( v[1] / 2 ), //pitch (y)
			c3 = Math.cos( v[2] / 2 ), //yaw (z)

			s1 = Math.sin( v[0] / 2 ),
			s2 = Math.sin( v[1] / 2 ),
			s3 = Math.sin( v[2] / 2 );
		
		this.elements = [
			c3 * c2 * s1 - s3 * s2 * c1,
			s3 * c2 * s1 + c3 * s2 * c1,
			s3 * c2 * c1 - c3 * s2 * s1,
			c3 * c2 * c1 + s3 * s2 * s1
		];
		
		return this;
	},
	from3UnitVectors:function(inpV1, inpV2, inpV3){
		let v1 = inpV1.elements, v2 = inpV2.elements, v3 = inpV3.elements,
			sv;
		if ( v1[0] + v2[1] + v3[2] > 0 ) {
			sv = 0.5 / Math.sqrt( 1 + v1[0] + v2[1] + v3[2] );
			this.elements = [
				( v2[2] - v3[1] ) * sv,
				( v3[0] - v1[2] ) * sv,
				( v1[1] - v2[0] ) * sv,
				0.25 / sv
				];
		} else if ( v1[0] > v2[1] && v1[0] > v3[2] ) {
			sv =0.5 / Math.sqrt( 1.0 + v1[0] - v2[1] - v3[2] );
			this.elements = [
				0.25 / sv,
				( v2[0] + v1[1] ) * sv,
				( v3[0] + v1[2] ) * sv,
				( v2[2] - v3[1] ) * sv
				];
		} else if ( v2[1] > v3[2] ) {
			sv = 0.5 / Math.sqrt( 1.0 + v2[1] - v1[0] - v3[2] );			
			this.elements = [
				( v2[0] + v1[1] ) * sv,
				0.25 / sv,
				( v3[1] + v2[2] ) * sv,
				( v3[0] - v1[2] ) * sv
				];
		} else {
			sv = 0.5 / Math.sqrt( 1.0 + v3[2] - v1[0] - v2[1] );			
			this.elements = [
				( v3[0] + v1[2] ) * sv,
				( v3[1] + v2[2] ) * sv,
				0.25 / sv,
				( v1[1] - v2[0] ) * sv
				];
		}
		
		return this;
	},
	from2AngleAxis:function(inpV1, a1, inpV2, a2){
		let inpV3 = $glVec3.cross(inpV1, inpV2),
			v1 = inpV1.elements, v2 = inpV2.elements, v3 = inpV3.elements,
			s1 = Math.sin(a1/2), c1 = Math.cos(a1/2),
			s2 = Math.sin(a2/2), c2 = Math.cos(a2/2);
		
		//calc Quaternion from unit axis
		let qv = $glQuat.create().from3UnitVectors(inpV1, inpV2, inpV3).elements;
		
		//calc Quaternion rotation aroun unit axis
		let qr = [
			s1*v1[0] * c2 + c1 * s2*v2[0] + s1*v1[1] * s2*v2[2] - s1*v1[2] * s2*v2[1],
			s1*v1[1] * c2 + c1 * s2*v2[1] + s1*v1[2] * s2*v2[0] - s1*v1[0] * s2*v2[2],
			s1*v1[2] * c2 + c1 * s2*v2[2] + s1*v1[0] * s2*v2[1] - s1*v1[1] * s2*v2[0],
			c1 * c2 - s1*v1[0] * s2*v2[0] - s1*v1[1] * s2*v2[1] - s1*v1[2] * s2*v2[2]
		];
		
		//multiply them
		this.elements = [
			qr[0] * qv[3] + qr[3] * qv[0] + qr[1] * qv[2] - qr[2] * qv[1],
			qr[1] * qv[3] + qr[3] * qv[1] + qr[2] * qv[0] - qr[0] * qv[2],
			qr[2] * qv[3] + qr[3] * qv[2] + qr[0] * qv[1] - qr[1] * qv[0],
			qr[3] * qv[3] - qr[0] * qv[0] - qr[1] * qv[1] - qr[2] * qv[2]
		];
		
		return this;
	},
	toRotMatrix:function(){
		let q = this.elements;
		
        return new $glMat3( 
			1-2*(q[1]*q[1]+q[2]*q[2]),   2*(q[1]*q[0]-q[2]*q[3]),   2*(q[2]*q[0]+q[1]*q[3]),
			  2*(q[1]*q[0]+q[2]*q[3]), 1-2*(q[0]*q[0]+q[2]*q[2]),   2*(q[2]*q[1]-q[0]*q[3]),
			  2*(q[2]*q[0]-q[1]*q[3]),   2*(q[2]*q[1]+q[0]*q[3]), 1-2*(q[0]*q[0]+q[1]*q[1])
		);
    },
	multiply:function(inpQ){
		let q = this.elements, qq = inpQ.elements;
		this.elements = [
			q[0] * qq[3] + q[3] * qq[0] + q[1] * qq[2] - q[2] * qq[1],
			q[1] * qq[3] + q[3] * qq[1] + q[2] * qq[0] - q[0] * qq[2],
			q[2] * qq[3] + q[3] * qq[2] + q[0] * qq[1] - q[1] * qq[0],
			q[3] * qq[3] - q[0] * qq[0] - q[1] * qq[1] - q[2] * qq[2]
		];
		return this;
	},
	dot:function(inpQ){
		let q = this.elements,
			qq = inpQ.elements;
		return q[0]*qq[0]+q[1]*qq[1]+q[2]*qq[2]+q[3]*qq[3];
	},
	normalize:function(){
		let q = this.elements,
			norm = 1 / Math.hypot(q[0], q[1], q[2], q[3]);
		this.elements=[
			q[0] * norm, q[1] * norm, q[2] * norm, q[3] * norm
		]
		return this;
	},
	slerp:function(inpQ, t, isShortestPath = false){
		let q = this.elements,
			qq = inpQ.elements,
			qqS,
			c = q[0]*qq[0]+q[1]*qq[1]+q[2]*qq[2]+q[3]*qq[3];
		
		// Do we need to invert rotation?
		if (c < 0 && isShortestPath){
			c = -c;
			qqS = [-qq[0], -qq[1], -qq[2], -qq[3]];
		} else {
			qqS = [qq[0], qq[1], qq[2], qq[3]];
		}
		
		let s = 1 - c*c
		if( s <= $glMath.GlEpsilon) {
			s = 1 - t;
			this.elements = [
				s * q[0] + t * qqS[0], s * q[1] + t * qqS[1], s * q[2] + t * qqS[2], s * q[3] + t * qqS[3]
				];
			this.normalize();
			return this;
		}
		
		// Standard case (slerp)
		s = Math.sqrt( s ); 
		let a = Math.atan2(s, c),
			c0 = Math.sin((1 - t) * a) / s,
			c1 = Math.sin(t * a) / s;
		
		this.elements = [
			c0*q[0] + c1*qqS[0], c0*q[1] + c1*qqS[1], c0*q[2] + c1*qqS[2], c0*q[3] + c1*qqS[3]
			];
		return this;
    },
	xAxis:function(){
        let q = this.elements;
		
		return new $glVec3(
				1-2*(q[1]*q[1]+q[2]*q[2]), 2*(q[1]*q[0]+q[2]*q[3]), 2*(q[2]*q[0]-q[1]*q[3])
			);
    },
	yAxis:function(){
		let q = this.elements;

        return new $glVec3(
				2*(q[1]*q[0] - q[2]*q[3]), 1-2*(q[0]*q[0]+q[2]*q[2]), 2*(q[2]*q[1]+q[0]*q[3])
			);
	},
    zAxis:function(){
		let q = this.elements;
		return new $glVec3(
				2*(q[2]*q[0]+q[1]*q[3]), 2*(q[2]*q[1]-q[0]*q[3]), 1-2*(q[0]*q[0]+q[1]*q[1])
			);
    }
	
};

gl3D.glQuat.create = function(){
	return new gl3D.glQuat(0, 0, 0, 1);
};
gl3D.glQuat.vecMult = function(inpQ, inpV){
	let q = inpQ.elements,
		v = inpV.elements,
		uv = [q[1]*v[2] - q[2]*v[1], q[2]*v[0] - q[0]*v[2], q[0]*v[1] - q[1]*v[0]],
		uuv = [q[1]*uv[2] - q[2]*uv[1], q[2]*uv[0] - q[0]*uv[2], q[0]*uv[1] - q[1]*uv[0]];
	return new $glVec3(
			v[0]+2*q[3]*uv[0]+2*uuv[0], v[1]+2*q[3]*uv[1]+2*uuv[1], v[2]+2*q[3]*uv[2]+2*uuv[2]
		);
};
gl3D.glQuat.slerp = function(inpQ, inpQQ, t, isShortestPath = false){
	let q = inpQ.elements,
		qq = inpQQ.elements,
		qqS,
		c = q[0]*qq[0]+q[1]*qq[1]+q[2]*qq[2]+q[3]*qq[3];
	
	// Do we need to invert rotation?
	if (c < 0 && isShortestPath){
		c = -c;
		qqS = [-qq[0], -qq[1], -qq[2], -qq[3]];
	} else {
		qqS = [qq[0], qq[1], qq[2], qq[3]];
	}
	
	let s = 1 - c*c
	
	if( s <= $glMath.GlEpsilon) {
		s = 1 - t;
		let out = new $glQuat(
			s * q[0] + t * qqS[0], s * q[1] + t * qqS[1], s * q[2] + t * qqS[2], s * q[3] + t * qqS[3]
			);
		out.normalize();
		return out;
	}
	
	s = Math.sqrt( s ); 
	let a = Math.atan2(s, c),
		c0 = Math.sin((1 - t) * a) / s,
		c1 = Math.sin(t * a) / s;
	
	return new $glQuat(
		c0*q[0] + c1*qqS[0], c0*q[1] + c1*qqS[1], c0*q[2] + c1*qqS[2], c0*q[3] + c1*qqS[3]
		);
};

$glMath = gl3D.glMath;
$glVec3 = gl3D.glVec3;
$glMat3 = gl3D.glMat3;
$glMat4 = gl3D.glMat4;
$glQuat = gl3D.glQuat;