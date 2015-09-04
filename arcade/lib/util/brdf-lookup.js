/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'arcade/util/mesh',
	'arcade/util/env-sh-project',
	'arcade/util/webgl-drawable',
	'arcade/util/webgl-framebuffer',
	'arcade/util/webgl-program',
	'arcade/util/webgl-shader',
	'arcade/util/webgl-texture',
	'lib/text!arcade/shader/blit.vert',
	'lib/text!arcade/shader/brdf-lookup.frag'
], function (
	Mesh,
	Projector,
	Drawable,
	Framebuffer,
	Program,
	Shader,
	Texture,
	vertSrc,
	fragSrc
) {
	function Generator(state, lookupSize, brdfSize) {
		var gl = state.gl;
		
		var vert = new Shader(state, gl.VERTEX_SHADER,   vertSrc);
		var frag = new Shader(state, gl.FRAGMENT_SHADER, fragSrc);
		var prog = new Program(state, vert, frag);
		prog.use(function (attributes, setUniforms) {
			setUniforms({
				scale:  [1, 1],
				offset: [0, 0]
			});
		});
		
		var mesh = Mesh.square();
		var drawable = new Drawable(state, mesh);
		
		var texture = Texture.create(state, gl.CLAMP_TO_EDGE, false, false,
			gl.RGBA, brdfSize, gl.RGBA, gl.UNSIGNED_BYTE, null);
		var framebuffer = new Framebuffer(state, brdfSize, brdfSize, { color: texture });
		var projector = new Projector(state, brdfSize);
		
		this.state           = state;
		this.lookupSize      = lookupSize;
		this.lookupIndex     = 0;
		this.lookupData      = [];
		this.brdfTexture     = texture;
		this.brdfFramebuffer = framebuffer;
		this.brdfProjector   = projector;
		this.brdfProgram     = prog;
		this.drawable        = drawable;
	}
	
	Generator.prototype.step = function (onUpdate) {
		var state       = this.state;
		var program     = this.brdfProgram;
		var texture     = this.brdfTexture;
		var framebuffer = this.brdfFramebuffer;
		var projector   = this.brdfProjector;
		var drawable    = this.drawable;
		var data0       = this.lookupData0;
		var data1       = this.lookupData1;
		
		var gl = state.gl;
		
		var n = this.lookupSize;
		var m = Math.floor(n / 2);
		var x = Math.floor(this.lookupIndex % n);
		var y = Math.floor(this.lookupIndex / n);
		var u = (x % m) / m;
		var v = (y % m) / m;
		
		framebuffer.use(function () {
			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			program.use(function (attributes, setUniforms) {
				setUniforms({
					viewAngle: u * Math.PI / 2,
					albedo_reflectance: x >= m ? 1 : 0,
					roughness: 0.1 + 0.9 * v,
					metalness: y >= m ? 1 : 0
				});
				drawable.draw(attributes);
			});
		});
		var harmonics = projector.project(texture).map(
			function (x) { return x[0]; });
		this.lookupData.push(harmonics);
		
		this.lookupIndex += 1;
		if (onUpdate)
			onUpdate(this.lookupIndex / (n * n));
		if (this.lookupIndex >= (n * n)) {
			var maxValue = this.lookupData.reduce(function (maxValue, values) {
				return values.reduce(function (maxValue, value) {
					if (Math.abs(value) > maxValue)
						return Math.abs(value);
					return maxValue;
				}, maxValue);
			}, 0);
			this.lookupData = this.lookupData.map(function (values) {
				return values.map(function (x) {
					return 255 * (x / maxValue + 1) / 2;
				});
			});
			var data0 = new Uint8Array(2 * n * n);
			var data1 = new Uint8Array(4 * n * n);
			this.lookupData.forEach(function (x, i) {
				data0.set([x[0], x[2]],             i * 2);
				data1.set([x[3], x[6], x[7], x[8]], i * 4);
			});
			
			var result = [maxValue];
			Array.prototype.push.apply(result, [
				{ data: data0, format: gl.LUMINANCE_ALPHA },
				{ data: data1, format: gl.RGBA            }
			].map(function (info) {
				return Texture.create(state, gl.CLAMP_TO_EDGE, true, false,
					info.format, n, info.format, gl.UNSIGNED_BYTE, info.data);
			}));
			return result;
		}
		return null;
	};
	
	function generate(state, lookupSize, onUpdate, onComplete) {
		var generator = new Generator(state, lookupSize, 128);
		if (onUpdate)
			onUpdate(0);
		function step() {
			var result = generator.step(onUpdate);
			if (!result)
				window.requestAnimationFrame(step);
			else {
				generator = null;
				onComplete.apply(null, result);
			}
		}
		step();
	}
	
	return generate;
});
