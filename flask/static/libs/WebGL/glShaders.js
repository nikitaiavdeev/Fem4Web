// Vertex shader program
const vsModelSource = `#version 300 es
	in vec4 aPosition;
	in vec4 aColor;
	in vec3 aNormal;
	in vec3 aBarycentric;
	in float aStage; 

	// Projection Matrix
	uniform highp mat4 uPVMatrix;
	uniform highp mat3 uInvMatrix;
	
	// Show points;
	uniform float uPointSize;
	
	//Output
	out vec4 vColor;
	out vec3 vNormal;
	out vec3 vBarycentric;
	out float vStage;

	void main() {
		gl_PointSize = uPointSize;
		gl_Position = uPVMatrix * aPosition;
		if (gl_Position.w != 1.0 && gl_Position.w > 0.001){
			gl_Position /= gl_Position.w;
		}
		vNormal = uInvMatrix * aNormal;
		vBarycentric = aBarycentric;
		vStage = aStage;
		
		vColor = aColor;
	}
`;

// Fragment shader program
const fsModelSource = `#version 300 es
	// fragment shaders don't have a default precision so we need
	// to pick one. mediump is a good default
	precision mediump float;
	
	in vec4 vColor;
	in vec3 vNormal;
	in vec3 vBarycentric;
	in float vStage; 

	//colors
	uniform vec3 uColor;
	uniform vec4 uStrokeColor;
	uniform vec3 uLight;
	uniform float uShrink;
	uniform float uEdgeThick;
	uniform float uAlpha;

	//boolean params
	uniform bool uShowEdges;
	uniform bool uShowLight;
	uniform bool uIsUniformColor;
	uniform bool uShowPoints;
	
	//final fragment color
	out vec4 oColor;
	
	float edgeFactor (vec3 barycentric, float lineWidth) {
		vec3 dist = fwidth(barycentric);
		vec3 smoothed = smoothstep(dist * ((lineWidth * 0.5) - 0.5), dist * ((lineWidth * 0.5) + 0.5), barycentric);
		return 1.0 - min(min(smoothed.x, smoothed.y), smoothed.z);
	}

	void main() {
		float light, edge;
		vec4 inColor, inStrokeColor;
		float d = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
		
		if( !uShowPoints && vStage > 0.899 && vStage < 0.901  ){ //hidden nodes
			discard;
		}
		
		if ( uShrink > 0.0 && d < uShrink || vStage < 0.401 ){ //hidden elements
			discard;
		}
		
		if (vStage > 0.799 && vStage < 0.801 ){ // Selection shell
			inColor.rgb = vec3(0.97, 0.83, 0.6);
			inStrokeColor = vec4(1.0, 0.65, 0.2, 1.0);
		} else if (vStage > 0.699 && vStage < 0.701 ){ // Selection bar
			inColor.rgb = vec3(0.95, 0.55, 0.15);
		} else if (vStage > 0.599 && vStage < 0.601){ // Selection node
			inColor.rgb = vec3(1.0, 0.5, 0.1);
		} else {
			if ( uIsUniformColor == true ){
				inColor.rgb = uColor;
			} else {
				inColor.rgb = vColor.rgb;
			}
			inStrokeColor = uStrokeColor;
		}
		
		inColor.a = uAlpha;
		
		if ( uShowEdges == true ){
			//compute the anti-aliased stroke edge
			edge = edgeFactor(vBarycentric - vec3(uShrink), uEdgeThick);
			oColor = mix(inColor, inStrokeColor, edge);
		} else {
			oColor = inColor;
		}
		
		if ( oColor.a == 0.0 ){
			discard;
		}
		
		if ( uShowLight == true ) {
			if( !gl_FrontFacing ){
				light = 0.3 + 0.7*abs(dot(vNormal, uLight));
			} else {
				light = 0.5 + 0.5*abs(dot(vNormal, uLight));
			}
			oColor.rgb *= light;
		}
	}
`;

// Vertex shader program
const vsSelectSource = `#version 300 es
	in vec4 aPosition;
	in vec4 aColor;
	in vec3 aBarycentric;
	in float aStage; 

	// Projection Matrix
	uniform highp mat4 uPVMatrix;
	uniform float uPointSize;
	
	//Output
	out vec4 vColor;
	out vec3 vBarycentric;
	out vec4 vPosition;
	out float vStage; 

	void main() {
		gl_PointSize = uPointSize;
		gl_Position = uPVMatrix * aPosition;
		vBarycentric = aBarycentric;
		vStage = aStage;
		vColor = aColor;
	}
`;

// Fragment shader program
const fsSelectSource = `#version 300 es
	// fragment shaders don't have a default precision so we need
	// to pick one. mediump is a good default
	precision mediump float;
	
	in vec4 vColor;
	in vec3 vBarycentric;
	in float vStage; 

	//colors
	uniform float uShrink;
	uniform float uWidth;
	uniform float uHeight;
	
	//final fragment color
	out vec4 oColor;

	void main() {
		if ( vStage < 0.4 ){
			discard;
		}
		float d = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
		oColor = vColor;

		if(gl_FragCoord.x == uWidth + 0.5 && gl_FragCoord.y == uHeight + 0.5){
			float depth = floor(gl_FragCoord.z * 4294967296.0);
			float r = floor(depth / 16777216.0);
			depth -= r * 16777216.0;
			float g = floor(depth / 65536.0);
			depth -= g * 65536.0;
			float b = floor(depth / 256.0);
			depth -= b * 256.0;
			float a = depth;

			oColor = vec4(r / 255.0, g / 255.0, b / 255.0, a / 255.0);
		}

		if ( uShrink > 0.0 && d < uShrink ){
			discard;
		}
	}
`;

// Vertex shader program
const vsHoverSource = `#version 300 es
	in vec4 aPosition;
	in vec3 aBarycentric;

	// Projection Matrix
	uniform highp mat4 uPVMatrix;
	uniform float uPointSize;
	
	//Selection
	
	//Output
	out vec4 vColor;
	out vec3 vBarycentric;

	void main() {
		vec4 loc;
		gl_PointSize = uPointSize;
		loc = uPVMatrix * aPosition;
		if(loc.w > 0.01){ //normolize perspective
			gl_Position = loc / loc.w;
		} else {
			gl_Position = loc;
		}
		vBarycentric = aBarycentric;
	}
`;

// Fragment shader program
const fsHoverSource = `#version 300 es
	// fragment shaders don't have a default precision so we need
	// to pick one. mediump is a good default
	precision mediump float;

	in vec3 vBarycentric;

	//colors
	uniform float uShrink;
	uniform vec4 uColor;
	
	//final fragment color
	out vec4 oColor;

	void main() {
		float d = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
		
		oColor = uColor;
		
		if ( uShrink > 0.0 && d < uShrink ){
			discard;
		}
	}
`;

// Vertex shader program
const vsAxisSource = `#version 300 es
	in vec4 aPosition;
	in vec3 aNormal;

	// Projection Matrix
	uniform highp mat4 uRotMatrix;
	uniform highp mat4 uPVMatrix;
	uniform highp mat3 uInvMatrix;
	uniform float uSize;
	uniform highp vec4 uOrigin;
	
	//Output
	out vec3 vNormal;

	void main() {
		vec4 loc;
		if( uSize == 1.0 ){
			gl_Position = uRotMatrix * aPosition;
		} else {
			loc = vec4( aPosition.xyz / uSize, 0.0);
			gl_Position = uPVMatrix * loc + uPVMatrix * uOrigin;
		}
		vNormal = uInvMatrix * aNormal;
	}
`;

// Fragment shader program
const fsAxisSource = `#version 300 es
	precision mediump float;
	
	in vec3 vNormal;

	//colors
	uniform vec3 uColor;
	uniform vec3 uLight;
	
	//final fragment color
	out vec4 oColor;
	
	void main() {
		float light = 0.5 + 0.5*dot(vNormal, uLight);
		oColor.rgb = uColor.rgb * light;
		oColor.a = 1.0;
	}
`;