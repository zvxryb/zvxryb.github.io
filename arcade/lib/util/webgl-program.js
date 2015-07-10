/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define(['arcade/util/util', 'arcade/util/webgl-shader'], function (util, Shader) {
	function Program(state, vert, frag) {
		var gl = state.gl;
		var program = gl.createProgram();
		gl.attachShader(program, vert.shader);
		gl.attachShader(program, frag.shader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS))
			throw 'failed to link program: ' + gl.getProgramInfoLog(program);
		
		this.state = state;
		this.attributes = util.unique(vert.attributes.concat(frag.attributes)).map(
			function (key) { return [key, gl.getAttribLocation(program, key)]; });
		this.uniforms = util.unique(vert.uniforms.concat(frag.uniforms)).map(
			function (key) { return [key, gl.getUniformLocation(program, key)]; });
		this.program = program;
	}
	
	Program.prototype.use = function (callback) {
		var attributes = this.attributes;
		var uniforms   = this.uniforms;
		return this.state.withProgram(this.program, function () {
			return callback(attributes, uniforms);
		});
	};
	
	return Program;
});

