/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define ([
	'math',
	'arcade/util/mesh',
	'arcade/util/webgl-drawable',
	'arcade/util/webgl-framebuffer',
	'arcade/util/webgl-program',
	'arcade/util/webgl-shader',
	'arcade/util/webgl-texture',
	'lib/text!arcade/shader/blit.vert',
	'lib/text!arcade/shader/atmosphere.frag'
], function (
	math,
	Mesh,
	Drawable,
	Framebuffer,
	Program,
	Shader,
	Texture,
	vertSrc,
	fragSrc
) {
	var lambda = {
		r: 680e-9,
		g: 532e-9,
		b: 475e-9
	};
	
	function Sky(state, size) {
		var gl = state.gl;
		
		var values = {
			r_earth: 6371e3,
			h_sky: 15e3,
			E_sun: [250, 235, 240],
			dir_sun: [0, 0, 1],
			beta_R: [
				1e-5 * Math.pow(lambda.g, 4) / Math.pow(lambda.r, 4),
				1e-5,
				1e-5 * Math.pow(lambda.g, 4) / Math.pow(lambda.b, 4)
			],
			beta_M: 1e-5,
			g: 0.9,
			scale:  [1, 1],
			offset: [0, 0]
		};
		
		var vert = new Shader(state, gl.VERTEX_SHADER,   vertSrc);
		var frag = new Shader(state, gl.FRAGMENT_SHADER, fragSrc);
		var program = new Program(state, vert, frag);
		var texture= Texture.create(state, gl.CLAMP_TO_EDGE, false, false,
			gl.RGBA, size, gl.RGBA, gl.UNSIGNED_BYTE, null);
		var framebuffer = new Framebuffer(state, size, size,
			{ color: texture });
		var mesh = Mesh.square();
		var drawable = new Drawable(state, mesh);
		program.use(function (attributes, setUniforms) {
			setUniforms(values);
		});
		
		this.state   = state;
		this.program = program;
		this.texture = texture;
		this.framebuffer = framebuffer;
		this.drawable = drawable;
		this.values = values;
	}
	
	Sky.prototype.setValues = function (values) {
		var changed = {};
		for (var key in values) {
			if (!values.hasOwnProperty(key))
				continue;
			var value = values[key];
			this.values[key] = value;
			changed[key] = value;
		}
		this.program.use(function (attributes, setUniforms) {
			setUniforms(changed);
		});
	}
	
	Sky.prototype.directIrradiance = function () {
		var r_earth = this.values.r_earth;
		var h_sky   = this.values.h_sky;
		var beta_M  = this.values.beta_M;
		var beta_R  = this.values.beta_R;
		var E_sun   = this.values.E_sun;
		var dir_sun = this.values.dir_sun;
		
		var offset = [0, 0, -r_earth];
		var t = math.dot(dir_sun, offset);
		var occluded = (t >= 0 && math.norm(offset - t * dir_sun) < r_earth);
		if (occluded)
			return [0, 0, 0];
		
		var r_sky = r_earth + h_sky;
		var d = t + math.sqrt(t*t - math.dot(offset, offset) + r_sky*r_sky);
		
		return math.dotMultiply(E_sun, math.exp(
			math.dotMultiply(-d, math.add(beta_M, beta_R))));
	}
	
	Sky.prototype.draw = function () {
		var state = this.state;
		var gl = state.gl;
		
		var program  = this.program;
		var drawable = this.drawable;
		this.framebuffer.use(function () {
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			program.use(function (attributes, setUniforms) {
				drawable.draw(attributes);
			});
		});
	};
	
	Sky.prototype.use = function (index, callback) {
		this.texture.use(index, callback);
	};
	
	return Sky;
});
