/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'math',
	'arcade/util/webgl-framebuffer',
	'arcade/util/webgl-matrix',
	'arcade/util/webgl-program',
	'arcade/util/webgl-renderbuffer',
	'arcade/util/webgl-shader',
	'arcade/util/webgl-texture',
	'lib/glsl_include!arcade/shader/depth.vert',
	'lib/glsl_include!arcade/shader/depth.frag'
], function (
	math,
	Framebuffer,
	Matrix,
	Program,
	Renderbuffer,
	Shader,
	Texture,
	vertSrc,
	fragSrc
) {
	function DepthMap(state, size) {
		var gl = state.gl;
		
		var vert = new Shader(state, gl.VERTEX_SHADER,   vertSrc);
		var frag = new Shader(state, gl.FRAGMENT_SHADER, fragSrc);
		var prog = new Program(state, vert, frag);
		
		var texture = Texture.create(state, gl.CLAMP_TO_EDGE, false, false,
			gl.RGBA, size, gl.RGBA, gl.UNSIGNED_BYTE, null);
		var depth = Renderbuffer.create(state, gl.DEPTH_COMPONENT16, size, size);
		var framebuffer = new Framebuffer(state, size, size, {
			color: texture,
			depth: depth
		});
		
		this.state       = state;
		this.program     = prog;
		this.texture     = texture;
		this.framebuffer = framebuffer;
	}
	
	DepthMap.createViewMatrix = function (v) {
		var z = v;
		var x = math.cross([0, 0, 1], z);
		if (math.norm(x) < 0.001)
			x = math.cross([0, 1, 0], z);
		var y = math.cross(z, x);
		
		x = math.divide(x, math.norm(x));
		y = math.divide(y, math.norm(y));
		z = math.divide(z, math.norm(z));
		
		var view = new Matrix([
			[x[0], x[1], x[2]],
			[y[0], y[1], y[2]],
			[z[0], z[1], z[2]]
		]);
		return view;
	}
	
	DepthMap.prototype.use = function (index, callback) {
		this.texture.use(index, callback);
	};
	
	DepthMap.prototype.draw = function (view, projection, objects) {
		var state = this.state;
		var prog  = this.program;
		var gl = state.gl;
		
		this.framebuffer.use(function () {
			gl.clearColor(1, 1, 1, 1);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
			
			prog.use(function (attributes, setUniforms) {
				setUniforms({ projection: projection });
				
				state.withCapability(gl.CULL_FACE, false, function () {
					state.withCapability(gl.DEPTH_TEST, true, function () {
						gl.depthFunc(gl.LESS);
						
						objects.forEach(function (object) {
							var modelView = view.mul(object.values.model);
							setUniforms({ modelView: modelView });
							
							object.drawable.draw(attributes);
						});
					});
				});
			});
		});
	};
	
	DepthMap.prototype.drawOrtho = function (c, v, w, h, d, objects) {
		var view = DepthMap.createViewMatrix(v).resize(4);
		view = view.mul(Matrix.translation(-c[0], -c[1], -c[2]));
		var projection = Matrix.ortho(w, h, d);
		
		this.draw(view, projection);
		
		return {
			view:       view,
			projection: projection
		};
	};
	
	return DepthMap;
});
