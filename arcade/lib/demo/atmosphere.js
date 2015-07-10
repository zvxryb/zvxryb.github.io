/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'arcade/util/demo-init',
	'arcade/util/mesh',
	'arcade/util/webgl-shader',
	'arcade/util/webgl-program',
	'arcade/util/webgl-texture',
	'arcade/util/webgl-framebuffer',
	'arcade/util/webgl-drawable',
	'lib/text!arcade/shader/blit.vert',
	'lib/text!arcade/shader/atmosphere.frag',
	'lib/text!arcade/shader/display.frag'
], function (init, Mesh, Shader, Program, Texture, Framebuffer, Drawable, vertSrc, skyFragSrc, toneFragSrc) {
	function addText(node, value) {
		var text = document.createTextNode(value);
		node.appendChild(text);
		return text;
	}
	
	function addFormattedText(node, text) {
		var lastToken = null;
		text.split(/(_|\^)\{(.+?)\}/).forEach(function (token) {
			switch (lastToken) {
				case '^':
					addElement(node, 'sup', function () {
						addText(this, token);
					});
					break;
				case '_':
					addElement(node, 'sub', function () {
						addText(this, token);
					});
					break;
				default:
					if (token !== '^' && token !== '_')
						addText(node, token);
					break;
			}
			lastToken = token;
		});
	}
	
	function addElement(node, elementName, callback) {
		var element = document.createElement(elementName);
		if (callback)
			callback.call(element);
		node.appendChild(element);
		return element;
	}
	
	function addInput(list, label, symbol, unit, callback) {
		var input;
		addElement(list, 'li', function () {
			addElement(this, 'i', function () {
				this.style.display = 'inline-block';
				this.style.width   = '6em';
				addFormattedText(this, symbol);
			});
			addElement(this, 'i', function () {
				this.style.display = 'inline-block';
				this.style.width   = '4em';
				if (unit)
					addFormattedText(this, '('+unit+')');
			});
			addElement(this, 'span', function () {
				this.style.display = 'inline-block';
				this.style.width   = '20em';
				addText(this, label);
			});
			input = addElement(this, 'input', function () {
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
		var list = addElement(div, 'ul', null);
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
		
		var vert     = new Shader(state, gl.VERTEX_SHADER, vertSrc, ['position'],
			['scale', 'offset']);
		var skyFrag  = new Shader(state, gl.FRAGMENT_SHADER, skyFragSrc, [],
			['r_earth', 'h_sky', 'E_sun', 'dir_sun', 'beta_R', 'beta_M', 'g']);
		var toneFrag = new Shader(state, gl.FRAGMENT_SHADER, toneFragSrc, [],
			['exposure']);
		var skyProg  = new Program(state, vert, skyFrag );
		var toneProg = new Program(state, vert, toneFrag);
		
		var texture = Texture.create(state, gl.CLAMP_TO_EDGE, false, false,
			gl.RGBA, 512, gl.RGBA, gl.UNSIGNED_BYTE, null);
		var framebuffer = new Framebuffer(state, 512, 512, {color: texture});
		
		var mesh = Mesh.square();
		var drawable = new Drawable(state, mesh);
		
		var f = 0.1;
		function draw(time) {
			framebuffer.use(function () {
				gl.clearColor(1, 1, 1, 0);
				gl.clear(gl.COLOR_BUFFER_BIT);
			
				var theta  = 1.4 * Math.PI * ((f * time/1000) % 1) - 0.7 * Math.PI;
				var sunDir = [Math.sin(theta), 0, Math.cos(theta)];
				skyProg.use(function(attributes, uniforms) {
					uniforms.forEach(function (uniform) {
						(function (key, location) {
							switch (key) {
								case 'r_earth':
									gl.uniform1f(location, values.r_earth);
									break;
								case 'h_sky':
									gl.uniform1f(location, values.h_sky);
									break;
								case 'E_sun':
									gl.uniform3f(location,
										values.E_sun.r,
										values.E_sun.g,
										values.E_sun.b);
									break;
								case 'dir_sun':
									gl.uniform3fv(location, sunDir);
									break;
								case 'beta_R':
									gl.uniform3f(location,
										values.beta_R.r,
										values.beta_R.g,
										values.beta_R.b);
									break;
								case 'beta_M':
									gl.uniform1f(location, values.beta_M);
									break;
								case 'g':
									gl.uniform1f(location, values.g);
									break;
								case 'scale':
									gl.uniform2fv(location, [1.0, 1.0]);
									break;
								case 'offset':
									gl.uniform2fv(location, [0.0, 0.0]);
									break;
								default:
									throw 'unknown uniform';
							}
						}).apply(null, uniform);
					});
					drawable.draw(attributes);
				});
			});
			
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			toneProg.use(function(attributes, uniforms) {
				uniforms.forEach(function (uniform) {
					(function (key, location) {
						switch (key) {
							case 'exposure':
								gl.uniform1f(location, 0.2);
								break;
							case 'color':
								gl.uniform1i(location, 0);
								break;
							case 'scale':
								gl.uniform2fv(location, [h/w, 1.0]);
								break;
							case 'offset':
								gl.uniform2fv(location, [0.0, 0.0]);
								break;
							default:
								throw 'unknown uniform';
						}
					}).apply(null, uniform);
				});
				texture.use(0, function () {
					drawable.draw(attributes);
				});
			});
			
			window.requestAnimationFrame(draw);
		}
		
		draw(0);
	}
});

