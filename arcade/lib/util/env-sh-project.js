/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'math',
	'arcade/util/mesh',
	'arcade/util/webgl-drawable',
	'arcade/util/webgl-framebuffer',
	'arcade/util/webgl-program',
	'arcade/util/webgl-shader',
	'arcade/util/webgl-texture',
	'arcade/util/util',
	'lib/text!arcade/shader/blit.vert',
	'lib/text!arcade/shader/sh-env-project.frag',
	'lib/text!arcade/shader/total4x-rgbe-signed.frag'
], function (
	math,
	Mesh,
	Drawable,
	Framebuffer,
	Program,
	Shader,
	Texture,
	util,
	vertSrc,
	productFragSrc,
	totalFragSrc
) {
	function EnvProjector(state, size) {
		var gl = state.gl;
		
		var vert = new Shader(state, gl.VERTEX_SHADER, vertSrc);
		
		var productFrag = new Shader(state, gl.FRAGMENT_SHADER, productFragSrc);
		var productProgram = new Program(state, vert, productFrag);
		productProgram.use(function (attributes, setUniforms) {
			setUniforms({
				scale:  [1, 1],
				offset: [0, 0],
				texelSize: [1/size, 1/size]
			});
		});
		
		var totalFrag = new Shader(state, gl.FRAGMENT_SHADER, totalFragSrc);
		var totalProgram = new Program(state, vert, totalFrag);
		totalProgram.use(function (attributes, setUniforms) {
			setUniforms({
				scale:  [1, 1],
				offset: [0, 0]
			});
		});
		
		var levels = [];
		for (var levelSize = size; levelSize > 4; levelSize >>= 2)
		{
			var texture = Texture.create(state, gl.CLAMP_TO_EDGE, false, false,
				gl.RGBA, levelSize, gl.RGBA, gl.UNSIGNED_BYTE, null);
			var framebuffer = new Framebuffer(state, levelSize, levelSize,
				{ color: texture });
			levels.push({
				size:        levelSize,
				texture:     texture,
				framebuffer: framebuffer
			});
		}
		
		var mesh = Mesh.square();
		var drawable = new Drawable(state, mesh);
		
		this.state          = state;
		this.productProgram = productProgram;
		this.totalProgram   = totalProgram;
		this.levels         = levels;
		this.drawable       = drawable;
	}
	
	EnvProjector.prototype.project = function (envMap) {
		var state          = this.state;
		var productProgram = this.productProgram;
		var totalProgram   = this.totalProgram;
		var levels         = this.levels;
		var drawable       = this.drawable;
		
		var gl = state.gl;
		var imageUnit = 0;
		
		return util.range(9).map(function (i) {
			var harmonics = util.range(9).map(function(j) {
				return j == i ? 1 : 0;
			});
			levels[0].framebuffer.use(function () {
				productProgram.use(function (attributes, setUniforms) {
					setUniforms({
						color: imageUnit,
						harmonics: harmonics
					});
					envMap.use(imageUnit, function () {
						drawable.draw(attributes);
					});
				});
			});
			for (var j = 1; j < levels.length; ++j) {
				var level0 = levels[j-1];
				var level1 = levels[j];
				level1.framebuffer.use(function () {
					totalProgram.use(function (attributes, setUniforms) {
						setUniforms({
							texelSize: [1/level1.size, 1/level1.size],
							color: imageUnit
						});
						level0.texture.use(imageUnit, function () {
							drawable.draw(attributes);
						});
					});
				});
			}
			var level = levels[levels.length-1];
			var size = level.size;
			var pixels = new Uint8Array(size * size * 4);
			level.framebuffer.use(function() {
				gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			});
			var total = [0, 0, 0];
			for (var j = 0; j < pixels.length; j += 4) {
				var r = pixels[j+0] / 255;
				var g = pixels[j+1] / 255;
				var b = pixels[j+2] / 255;
				var e = pixels[j+3];
				var x = math.pow(2, e - 128);
				total[0] += x * (2 * r - 1);
				total[1] += x * (2 * g - 1);
				total[2] += x * (2 * b - 1);
			}
			return total;
		});
	};
	
	return EnvProjector;
});

