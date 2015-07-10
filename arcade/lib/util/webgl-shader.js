/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function Shader(state, type, source, attributes, uniforms) {
		var gl = state.gl;
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			throw 'failed to compile shader: ' + gl.getShaderInfoLog(shader);
		this.shader     = shader;
		this.attributes = attributes;
		this.uniforms   = uniforms;
	}
	
	return Shader;
});

