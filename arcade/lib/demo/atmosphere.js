/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'arcade/util/demo-init',
	'arcade/util/env-sky',
	'arcade/util/html-ui',
	'arcade/util/mesh',
	'arcade/util/webgl-shader',
	'arcade/util/webgl-program',
	'arcade/util/webgl-drawable',
	'lib/text!arcade/shader/blit.vert',
	'lib/text!arcade/shader/display-hdr-rgbe.frag'
], function (
	init,
	Sky,
	ui,
	Mesh,
	Shader,
	Program,
	Drawable,
	vertSrc,
	fragSrc
) {
	function addInput(list, label, symbol, unit, callback) {
		var input;
		ui.addElement(list, 'li', function () {
			ui.addElement(this, 'i', function () {
				this.style.display = 'inline-block';
				this.style.width   = '6em';
				ui.addFormattedText(this, symbol);
			});
			ui.addElement(this, 'i', function () {
				this.style.display = 'inline-block';
				this.style.width   = '4em';
				if (unit)
					ui.addFormattedText(this, '('+unit+')');
			});
			ui.addElement(this, 'span', function () {
				this.style.display = 'inline-block';
				this.style.width   = '20em';
				ui.addText(this, label);
			});
			input = ui.addElement(this, 'input', function () {
				this.style.width = '6em'
				this.type = 'number';
				callback.call(this);
			});
		});
		return input;
	}
	
	var lambda = {
		r: 680e-9,
		g: 532e-9,
		b: 475e-9
	};
	function createUI(div, values) {
		var list = ui.addElement(div, 'ul', null);
		addInput(list, 'Earth\'s radius', 'r_{earth}', 'm', function () {
				this.min   = 0.0;
				this.step  = 1e3;
				this.value = values.r_earth;
				this.addEventListener('change', function (event) {
					values.r_earth = event.target.value;
				});
			});
		addInput(list, 'Sky height', 'h_{sky}', 'm', function () {
				this.min   = 0.0;
				this.step  = 1e3;
				this.value = values.h_sky;
				this.addEventListener('change', function (event) {
					values.h_sky = event.target.value;
				});
			});
		addInput(list, 'Solar irradiance, red', 'E_{sun,'+(lambda.r * 1e9)+'nm}',
			'Wm^{-2}', function () {
				this.step  = 5;
				this.value = values.E_sun.r;
				this.addEventListener('change', function (event) {
					values.E_sun.r = event.target.value;
				});
			});
		addInput(list, 'Solar irradiance, green', 'E_{sun,'+(lambda.g * 1e9)+'nm}',
			'Wm^{-2}', function () {
				this.step  = 5;
				this.value = values.E_sun.g;
				this.addEventListener('change', function (event) {
					values.E_sun.g = event.target.value;
				});
			});
		addInput(list, 'Solar irradiance, blue', 'E_{sun,'+(lambda.b * 1e9)+'nm}',
			'Wm^{-2}', function () {
				this.step  = 5;
				this.value = values.E_sun.b;
				this.addEventListener('change', function (event) {
					values.E_sun.b = event.target.value;
				});
			});
		var beta_R = {};
		beta_R.r = addInput(list, 'Rayleigh scattering coefficient, red',
			'\u03b2_{R,'+(lambda.r * 1e9)+'nm}', 'm^{-1}', function () {
				this.disabled = true;
				this.value    = values.beta_R.r;
			});
		beta_R.g = addInput(list, 'Rayleigh scattering coefficient, green',
			'\u03b2_{R,'+(lambda.g * 1e9)+'nm}', 'm^{-1}', function () {
				this.min   = 0;
				this.step  = 1e-6;
				this.value = values.beta_R.g;
				this.addEventListener('change', function (event) {
					var g = event.target.value;
					var r = g * Math.pow(lambda.g, 4) / Math.pow(lambda.r, 4);
					var b = g * Math.pow(lambda.g, 4) / Math.pow(lambda.b, 4);
					beta_R.r.value = r;
					beta_R.b.value = b;
					values.beta_R = { r: r, g: g, b: b };
				});
			});
		beta_R.b = addInput(list, 'Rayleigh scattering coefficient, blue',
			'\u03b2_{R,'+(lambda.b * 1e9)+'nm}', 'm^{-1}', function () {
				this.disabled = true;
				this.value    = values.beta_R.b;
			});
		addInput(list, 'Mie scattering coefficient', '\u03b2_{M}', 'm^{-1}',
			function () {
				this.min   = 0;
				this.step  = 1e-6;
				this.value = values.beta_M;
				this.addEventListener('change', function (event) {
					values.beta_M = event.target.value;
				});
			});
		addInput(list, 'Mie phase eccentricity', 'g', null,
			function () {
				this.min   = -1.0;
				this.max   =  1.0;
				this.step  = 0.01;
				this.value = values.g;
				this.addEventListener('change', function (event) {
					values.g = event.target.value;
				});
			});
	}
	
	return function (id) {
		var demo = init(id);
		if (!demo)
			return;
		var state = demo.state;
		var gl    = state.gl;
		var w     = demo.width;
		var h     = demo.height;
		
		var values = {
			r_earth: 6371e3,
			h_sky: 10e3,
			E_sun: {
				r: 250.0,
				g: 235.0,
				b: 200.0
			},
			beta_R: {
				r: 1e-5 * Math.pow(lambda.g, 4) / Math.pow(lambda.r, 4),
				g: 1e-5,
				b: 1e-5 * Math.pow(lambda.g, 4) / Math.pow(lambda.b, 4)
			},
			beta_M: 1e-5,
			g: 0.9
		};
		var widgets = createUI(demo.div, values);
		
		var sky = new Sky(state, 512);
		
		var vert = new Shader(state, gl.VERTEX_SHADER, vertSrc, ['position'],
			['scale', 'offset']);
		var frag = new Shader(state, gl.FRAGMENT_SHADER, fragSrc, [],
			['exposure', 'color']);
		var prog = new Program(state, vert, frag);
		
		var mesh = Mesh.square();
		var drawable = new Drawable(state, mesh);
		
		var f = 0.1;
		function draw(time) {
			var theta  = 1.4 * Math.PI * ((f * time/1000) % 1) - 0.7 * Math.PI;
			var sunDir = [Math.sin(theta), 0, Math.cos(theta)];
			sky.draw({
				r_earth: values.r_earth,
				h_sky: values.h_sky,
				E_sun: [
					values.E_sun.r,
					values.E_sun.g,
					values.E_sun.b
				],
				dir_sun: sunDir,
				beta_R: [
					values.beta_R.r,
					values.beta_R.g,
					values.beta_R.b
				],
				beta_M: values.beta_M,
				g: values.g,
				scale:  [1.0, 1.0],
				offset: [0.0, 0.0]
			});
			
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			prog.use(function(attributes, setUniforms) {
				setUniforms({
					exposure: 0.2,
					color: 0,
					scale:  [h/w, 1.0],
					offset: [0.0, 0.0]
				});
				sky.use(0, function () {
					drawable.draw(attributes);
				});
			});
			
			window.requestAnimationFrame(draw);
		}
		
		draw(0);
	}
});

