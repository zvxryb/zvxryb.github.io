/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define ([
	'math',
	'arcade/util/demo-init',
	'arcade/util/env-sh-project',
	'arcade/util/env-sky',
	'arcade/util/mesh',
	'arcade/util/webgl-drawable',
	'arcade/util/webgl-program',
	'arcade/util/webgl-shader',
	'lib/text!arcade/shader/blit.vert',
	'lib/text!arcade/shader/display-paraboloid-lambert.frag',
	'lib/text!arcade/shader/display-sh-lambert.frag'
], function (
	math,
	init,
	EnvProjector,
	Sky,
	Mesh,
	Drawable,
	Program,
	Shader,
	vertSrc,
	fragSrc_paraboloid,
	fragSrc_harmonics
) {
	return function (id) {
		var demo = init(id);
		if (!demo)
			return;
		var canvas = demo.canvas;
		var state  = demo.state;
		var gl     = state.gl;
		var w      = demo.width;
		var h      = demo.height;
		
		var textureSize = 512;
		
		var sky = new Sky(state, textureSize);
		var env = new EnvProjector(state, textureSize);
		
		var vert = new Shader(state, gl.VERTEX_SHADER, vertSrc);
		
		var frag_paraboloid = new Shader(state, gl.FRAGMENT_SHADER, fragSrc_paraboloid);
		var frag_harmonics  = new Shader(state, gl.FRAGMENT_SHADER, fragSrc_harmonics );
		
		var prog_paraboloid = new Program(state, vert, frag_paraboloid);
		var prog_harmonics  = new Program(state, vert, frag_harmonics );
		
		[prog_paraboloid, prog_harmonics].forEach(function (prog) {
			prog.use(function (attributes, setUniforms) {
				setUniforms({
					exposure: 0.3,
					scale:  [h/w, 1],
					offset: [  0, 0]
				});
			});
		});
		
		var mesh = Mesh.square();
		var drawable = new Drawable(state, mesh);
		
		var f = 0.05;
		function draw(time) {
			var theta = Math.PI * (1.05 * ((f * time / 1000) % 1) - 0.525);
			var sunDir = [Math.sin(theta), 0, Math.cos(theta)];
			sky.setValues({ dir_sun: sunDir });
			sky.draw();
			var harmonics = math.flatten(env.project(sky));
			
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			state.withCapability(gl.SCISSOR_TEST, true, function () {
				state.withScissor(0, h/2, w, h/2, function () {
					prog_paraboloid.use(function (attributes, setUniforms) {
						var imageUnit = 0;
						setUniforms({ color: imageUnit });
						sky.use(imageUnit, function () {
							drawable.draw(attributes);
						});
					});
				})
				state.withScissor(0, 0, w, h/2, function () {
					prog_harmonics.use(function (attributes, setUniforms) {
						setUniforms({ harmonics: harmonics });
						drawable.draw(attributes);
					});
				});
			});
			
			window.requestAnimationFrame(draw);
		}
		
		draw(0);
	}
});
