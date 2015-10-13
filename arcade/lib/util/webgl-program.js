/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'arcade/util/webgl-matrix',
	'arcade/util/webgl-shader'
], function (
	Matrix,
	Shader
) {
	function Program(state, vert, frag) {
		var gl = state.gl;
		var program = gl.createProgram();
		gl.attachShader(program, vert.shader);
		gl.attachShader(program, frag.shader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS))
			throw 'failed to link program: ' + gl.getProgramInfoLog(program);
		
		function getActiveInfo(n, getInfo, getLocation) {
			var result = {}
			for (var i = 0; i < n; ++i) {
				var info = getInfo.call(gl, program, i);
				var name = info.name.replace(/\[0\]$/, '');
				result[name] = {
					name: name,
					size: info.size,
					type: info.type,
					location: getLocation.call(gl, program, name)
				};
			}
			return result;
		}
		
		var attributes = getActiveInfo(
			gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES),
			gl.getActiveAttrib, gl.getAttribLocation);
		var uniforms = getActiveInfo(
			gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS),
			gl.getActiveUniform, gl.getUniformLocation);
		
		this.state = state;
		this.attributes = attributes;
		this.uniforms = uniforms;
		this.program = program;
	}
	
	Program.prototype.use = function (callback) {
		var state = this.state;
		var gl = state.gl;
		
		var attributes = [];
		for (var key in this.attributes) {
			if (!this.attributes.hasOwnProperty(key))
				continue;
			var info = this.attributes[key];
			attributes.push([info.name, info.location]);
		}
		var uniforms = this.uniforms;
		
		function setUniform(info, value) {
			if (value instanceof Matrix)
				return value.use(state, info.location);
			
			if (value instanceof Array
			 && value.length > 0
			 && value[0] instanceof Matrix)
			{
				var n = value[0].size()[0];
				var data = new Array(n*n*value.length);
				value.forEach(function (matrix, i) {
					var size = matrix.size();
					if (size[0] != n || size[1] != n)
						throw 'matrix size error';
					var matrixData = matrix.flatten();
					for (var j = 0; j < n*n; ++j)
						data[n*n*i + j] = matrixData[j];
				});
				return Matrix.use(state, info.location, n, data);
			}
			
			var f = function () {
				switch (info.type) {
					case gl.FLOAT:
						return info.size > 1
							? gl.uniform1fv
							: gl.uniform1f;
					case gl.SAMPLER_2D:
						return info.size > 1
							? gl.uniform1iv
							: gl.uniform1i;
					case gl.FLOAT_VEC2: return gl.uniform2fv;
					case gl.FLOAT_VEC3: return gl.uniform3fv;
					case gl.FLOAT_VEC4: return gl.uniform4fv;
					default: throw 'unsupported uniform type';
				}
				return null;
			}();
			f.call(gl, info.location, value);
		}
		function setUniforms(values) {
			for (var key in values) {
				if (!values.hasOwnProperty(key))
					continue;
				var value = values[key];
				var info = uniforms[key];
				setUniform(info, value);
			}
		}
		return state.withProgram(this.program, function () {
			return callback(attributes, setUniforms);
		});
	};
	
	return Program;
});

