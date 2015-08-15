/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'math',
	'arcade/util/demo-init',
	'arcade/util/html-ui',
	'arcade/util/mesh',
	'arcade/util/mesh-sphere',
	'arcade/util/webgl-matrix',
	'arcade/util/webgl-shader',
	'arcade/util/webgl-program',
	'arcade/util/webgl-drawable',
	'lib/text!arcade/shader/sh-deform.vert',
	'lib/text!arcade/shader/sh-color.frag',
], function (
	math,
	init,
	ui,
	Mesh,
	sphere,
	Matrix,
	Shader,
	Program,
	Drawable,
	vertSrc,
	fragSrc
) {
	function addInput(list, symbol, range, value, onChangeScale, onChangeValue) {
		var range;
		var number;
		function setRange(input, range) {
			if (range instanceof Array)
				(function (min, max, step) {
					input.min  = min;
					input.max  = max;
					input.step = step
				}).apply(null, range);
			else {
				input.min  = -range;
				input.max  =  range;
				input.step =  range / 1000;
			}
		};
		ui.addElement(list, 'li', function () {
			ui.addElement(this, 'i', function () {
				this.style.display = 'inline-block';
				this.style.width   = '4em';
				ui.addFormattedText(this, symbol);
			});
			range = ui.addElement(this, 'input', function () {
				this.style.width = '32em';
				this.type = 'range';
				setRange(this, range);
				this.value =  value;
				this.addEventListener('input', function (event) {
					var value = Number(event.target.value);
					number.value = value;
					onChangeValue(value);
				});
			});
			number = ui.addElement(this, 'input', function () {
				this.style.width = '6em';
				this.type = 'number';
				setRange(this, range);
				this.value =  value;
				this.addEventListener('change', function (event) {
					var value = Number(event.target.value);
					range.value = value;
					onChangeValue(value);
				});
			});
		});
		return {
			setScale: function (newScale) {
				setRange(range,  newScale);
				setRange(number, newScale);
				
				if (onChangeScale)
					onChangeScale(newScale);
			}
		};
	}
	
	function createUI(div, data) {
		var list = ui.addElement(div, 'ul', null);
		var inputs;
		
		addInput(list, 'deform', [0, 1, 0.01], data.deform, null,
			function (value) { data.deform = value; });
		
		addInput(list, 'scale', [0, 24, 1], math.log(data.scale, 2), null,
			function (value) {
				var scale = 1 << value;
				inputs.forEach(function (input) {
					input.setScale(scale);
				});
				data.scale = scale;
			}
		);
		
		inputs = [
			'Y_{0, 0}',
			'Y_{1,-1}',
			'Y_{1, 0}',
			'Y_{1, 1}',
			'Y_{2,-2}',
			'Y_{2,-1}',
			'Y_{2, 0}',
			'Y_{2, 1}',
			'Y_{2, 2}'
		].map(function (symbol, i) {
			return addInput(list, symbol, data.scale, data.values[i],
				function (scale) { data.values[i] /= scale / data.scale; },
				function (value) { data.values[i]  = value / data.scale; });
		});
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
		
		var data = {
			deform: 0.3,
			scale: 1,
			values: new Float32Array([
				      1,
				   0, 0, 0,
				0, 0, 0, 0, 0
			])
		};
		createUI(demo.div, data);
		
		var vert = new Shader(state, gl.VERTEX_SHADER,   vertSrc);
		var frag = new Shader(state, gl.FRAGMENT_SHADER, fragSrc);
		
		var prog = new Program(state, vert, frag);
		
		var sphereMesh = sphere(4);
		var sphereDrawable = new Drawable(state, sphereMesh);
		
		var view = Matrix.identity(4);
		var proj = Matrix.ortho(2 * w / h, 2, 10);
		
		mouse = null;
		canvas.addEventListener('mousedown', function (evt) {
			mouse = [evt.clientX, evt.clientY];
		});
		canvas.addEventListener('mouseup', function (evt) {
			mouse = null;
		});
		canvas.addEventListener('mousemove', function (evt) {
			if (!mouse)
				return;
			(function (x, y) {
				var dx = evt.clientX - x;
				var dy = y - evt.clientY;
				if (dx == 0 && dy == 0)
					return;
				var scale = 2 * Math.PI / 500;
				var v = math.cross([0, 0, 1], math.multiply(scale, [dx, dy, 0]));
				view = Matrix.rot(v).resize(4).mul(view);
			}).apply(null, mouse);
			mouse = [evt.clientX, evt.clientY];
		});
		
		function draw(time) {
			var mvp = proj.mul(view);
			
			state.withCapability(gl.CULL_FACE, true, function () {
				gl.clearColor(0, 0, 0, 1);
				gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
			
				state.withCapability(gl.DEPTH_TEST, true, function () {
					prog.use(function (attributes, setUniforms) {
						setUniforms({
							mvp: mvp,
							deform: data.deform,
							harmonics: data.values
						});
						sphereDrawable.draw(attributes);
					});
				});
			});
			
			window.requestAnimationFrame(draw);
		}
		
		draw(0);
	}
});

