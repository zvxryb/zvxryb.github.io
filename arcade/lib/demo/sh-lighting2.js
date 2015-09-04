/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'math',
	'arcade/util/brdf-lookup',
	'arcade/util/demo-init',
	'arcade/util/env-sh-project',
	'arcade/util/env-sky',
	'arcade/util/html-ui',
	'arcade/util/mesh',
	'arcade/util/mesh-sphere',
	'arcade/util/util',
	'arcade/util/webgl-drawable',
	'arcade/util/webgl-framebuffer',
	'arcade/util/webgl-matrix',
	'arcade/util/webgl-program',
	'arcade/util/webgl-renderbuffer',
	'arcade/util/webgl-shader',
	'arcade/util/webgl-texture',
	'lib/text!arcade/shader/blit.vert',
	'lib/text!arcade/shader/solid.frag',
	'lib/glsl_include!arcade/shader/display-hdr-rgbe.frag',
	'lib/glsl_include!arcade/shader/view.vert',
	'lib/glsl_include!arcade/shader/sky-paraboloid-rgbe.frag',
	'lib/glsl_include!arcade/shader/sh-lighting.vert',
	'lib/glsl_include!arcade/shader/sh-lighting.frag'
], function (
	math,
	genBRDF,
	init,
	Projector,
	Sky,
	ui,
	Mesh,
	sphere,
	util,
	Drawable,
	Framebuffer,
	Matrix,
	Program,
	Renderbuffer,
	Shader,
	Texture,
	vertSrc_blit,
	fragSrc_solid,
	fragSrc_display,
	vertSrc_sky,
	fragSrc_sky,
	vertSrc_lighting,
	fragSrc_lighting
) {
	function addInput(list, label, min, max, step, value, callback) {
		ui.addElement(list, 'li', function () {
			ui.addElement(this, 'i', function () {
				this.style.display = 'inline-block';
				this.style.width   = '12em';
				ui.addText(this, label);
			});
			ui.addElement(this, 'input', function () {
				this.style.width = '32em';
				this.type  = 'range';
				this.min   = min;
				this.max   = max;
				this.step  = step;
				this.value = value;
				this.addEventListener('input', function (event) {
					var value = Number(event.target.value);
					callback(value);
				});
			});
		});
		callback(value);
	}
	
	return function (id) {
		var demo = init(id);
		if (!demo)
			return;
		var canvas = demo.canvas;
		var state  = demo.state;
		var gl     = state.gl;
		var w      = demo.width;
		var h      = demo.height;
		
		var inputs = {};
		ui.addElement(demo.div, 'ul', function () {
			addInput(this, 'Sun angle, zenith', 0, math.PI / 2, 0.0001, 0.47 * math.PI,
				function (value) { inputs.sun_zenith = value; });
			addInput(this, 'Sun angle, azimuth', 0, 2 * math.PI, 0.0001, 0.25 * math.PI,
				function (value) { inputs.sun_azimuth = value; });
			addInput(this, 'Albedo/reflectance, red', 0, 1, 0.0001, 0.95,
				function (value) { inputs.albedo_r = value; });
			addInput(this, 'Albedo/reflectance, green', 0, 1, 0.0001, 0.95,
				function (value) { inputs.albedo_g = value; });
			addInput(this, 'Albedo/reflectance, blue', 0, 1, 0.0001, 0.95,
				function (value) { inputs.albedo_b = value; });
			addInput(this, 'Direct lighting', 0, 1, 0.0001, 1,
				function (value) { inputs.direct = value; });
			addInput(this, 'SH sky lighting', 0, 1, 0.0001, 1,
				function (value) { inputs.sky = value; });
		});
		
		var camera = {
			azimuth: -0.55 * Math.PI,
			zenith:   0.4  * Math.PI
		}
		mouse = null;
		canvas.addEventListener('mousedown', function (evt) {
			mouse = [evt.clientX, evt.clientY];
		});
		document.addEventListener('mouseup', function (evt) {
			if (!mouse)
				return;
			mouse = null;
			evt.preventDefault();
		});
		document.addEventListener('mousemove', function (evt) {
			if (!mouse)
				return;
			(function (x, y) {
				var dx = evt.clientX - x;
				var dy = y - evt.clientY;
				if (dx == 0 && dy == 0)
					return;
				camera.azimuth += 0.01 * dx;
				camera.zenith  += 0.01 * dy;
				camera.azimuth = camera.azimuth % (2 * Math.PI);
				if (camera.zenith <       0) camera.zenith = 0;
				if (camera.zenith > Math.PI) camera.zenith = Math.PI;
			}).apply(null, mouse);
			mouse = [evt.clientX, evt.clientY];
			evt.preventDefault();
		});
		
		var vert_blit = new Shader(state, gl.VERTEX_SHADER, vertSrc_blit);
		
		var frag_solid = new Shader(state, gl.FRAGMENT_SHADER, fragSrc_solid);
		var prog_solid = new Program(state, vert_blit, frag_solid);
		
		var frag_display = new Shader(state, gl.FRAGMENT_SHADER, fragSrc_display);
		var prog_display = new Program(state, vert_blit, frag_display);
		prog_display.use(function (attributes, setUniforms) {
			setUniforms({
				scale:  [1, 1],
				offset: [0, 0],
				color: 0,
				exposure: 0.05
			});
		});
		
		var vert_sky = new Shader(state, gl.VERTEX_SHADER,   vertSrc_sky);
		var frag_sky = new Shader(state, gl.FRAGMENT_SHADER, fragSrc_sky);
		var prog_sky = new Program(state, vert_sky, frag_sky);
		
		var vert_lighting = new Shader(state, gl.VERTEX_SHADER,   vertSrc_lighting);
		var frag_lighting = new Shader(state, gl.FRAGMENT_SHADER, fragSrc_lighting);
		var prog_lighting = new Program(state, vert_lighting, frag_lighting);
		
		var hdrFrameColor = Texture.create(state, gl.CLAMP_TO_EDGE, false,
			false, gl.RGBA, [w, h], gl.RGBA, gl.UNSIGNED_BYTE, null);
		var hdrFrameDepth = Renderbuffer.create(state, gl.DEPTH_COMPONENT16, w, h);
		var hdrFramebuffer = new Framebuffer(state, w, h, {
			color: hdrFrameColor,
			depth: hdrFrameDepth
		});
		
		var projection = Matrix.perspective(Math.PI/3, w/h, 0.1, 1000);
		var invProj = projection.inv();
		
		var squareMesh = Mesh.square();
		var squareDrawable = new Drawable(state, squareMesh);
		
		var sphereMesh = sphere(3);
		var sphereDrawable = new Drawable(state, sphereMesh);
		
		var scene = function () {
			var result = [];
			Array.prototype.push.apply(result, util.range(8).map(function (i) {
				var metalness = i < 4 ? 0 : 1;
				var roughness = 0.9 * ((i % 4) / 4) + 0.1;
				var x = 1.2 * (i < 4 ? -1 : 1);
				var y = 1.2 * 2 * (i % 4 - 1.5);
				var model = Matrix.translation(x, y, 0);
				
				var object = {}
				object.update = function () {
					object.values.albedo_reflectance = [
						inputs.albedo_r,
						inputs.albedo_g,
						inputs.albedo_b
					];
				};
				object.values = {
					model: model,
					metalness: metalness,
					roughness: roughness,
				};
				object.drawable = sphereDrawable;
				return object;
			}));
			var model = Matrix.translation(0, 0, -1).mul(
				Matrix.scale(1000, 1000, 1));
			result.push({
				values: {
					model: model,
					metalness: 0.0,
					roughness: 0.6,
					albedo_reflectance: [0.04, 0.04, 0.04]
				},
				drawable: squareDrawable
			});
			return result;
		}();
		
		var brdfSize = 32;
		genBRDF(state, brdfSize, function (percent) {
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
			state.withCapability(gl.DEPTH_TEST, true, function () {
				gl.depthFunc(gl.NOTEQUAL);
				prog_solid.use(function(attributes, setUniforms) {
					setUniforms({
						scale:  [percent * 0.8*h/w, 0.2],
						offset: [percent * 0.8*h/w-0.8*h/w, 0],
						color:  [0, 0, 0, 1]
					});
					squareDrawable.draw(attributes);
					setUniforms({
						scale:  [0.8*h/w, 0.2],
						offset: [0, 0],
						color:  [0, 0, 0, 0]
					});
					squareDrawable.draw(attributes);
					setUniforms({
						scale:  [0.82*h/w, 0.22],
						offset: [0, 0],
						color:  [0, 0, 0, 1]
					});
					squareDrawable.draw(attributes);
				});
			});
		}, function (brdfScale, lookup0, lookup1) {
			prog_lighting.use(function (attributes, setUniforms) {
				setUniforms({
					texelSize: 1/brdfSize,
					brdfScale: brdfScale,
					brdf: [0, 1]
				});
			});
			
			var skySize = 256;
			var sky = new Sky(state, skySize);
			var projector = new Projector(state, skySize);
			
			var f = 0.05;
			function draw(time) {
				var sunDir = [
					math.sin(inputs.sun_zenith) * math.cos(inputs.sun_azimuth),
					math.sin(inputs.sun_zenith) * math.sin(inputs.sun_azimuth),
					math.cos(inputs.sun_zenith)
				];
				sky.setValues({ dir_sun: sunDir });
				sky.draw();
				var env = math.flatten(projector.project(sky));
				
				var view;
				view = Matrix.rotation([0, 0, camera.azimuth]);
				view = Matrix.rotation([-camera.zenith, 0, 0]).mul(view);
				view = Matrix.translation(0, 0, -6).mul(view.resize(4));
				var invView = view.inv();
				var viewCoord = [
					invView.data[0][3],
					invView.data[1][3],
					invView.data[2][3]
				];
				
				hdrFramebuffer.use(function() {
					gl.clearColor(0, 0, 0, 0);
					gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
					state.withCapability(gl.CULL_FACE, true, function () {
						state.withCapability(gl.DEPTH_TEST, true, function () {
							gl.depthFunc(gl.LEQUAL);
							prog_lighting.use(function (attributes, setUniforms) {
								setUniforms({
									viewCoord: viewCoord,
									env: env,
									dir_sun: sky.values.dir_sun,
									E_sun: sky.directIrradiance(),
									direct_scale: inputs.direct,
									sky_scale: inputs.sky
								});
								lookup0.use(0, function () {
									lookup1.use(1, function () {
										scene.forEach(function (object) {
											if (object.update)
												object.update();
											setUniforms(object.values);
											setUniforms({
												mvp: projection.mul(view.mul(
													object.values.model))
											});
											object.drawable.draw(attributes);
										});
									});
								});
							});
							prog_sky.use(function (attributes, setUniforms) {
								setUniforms({
									invProj: invProj,
									invViewRot: invView.resize(3),
									color: 0,
									dir_sun: sky.values.dir_sun,
									E_sun: sky.directIrradiance()
								});
								sky.use(0, function() {
									squareDrawable.draw(attributes);
								});
							});
						});
					});
				});
				
				gl.clearColor(0, 0, 0, 0);
				gl.clear(gl.COLOR_BUFFER_BIT);
				prog_display.use(function (attributes, setUniforms) {
					hdrFrameColor.use(0, function () {
						squareDrawable.draw(attributes);
					});
				});
				
				window.requestAnimationFrame(draw);
			}
			draw(0);
		});
	}
});
