/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define(['math'], function (math) {
	function Matrix(data) {
		this.data = data;
	}
	
	Matrix.identity = function (size) {
		var data = []
		for (var i = 0; i < size; ++i) {
			var row = [];
			for (var j = 0; j < size; ++j)
				row.push(i === j ? 1 : 0);
			data.push(row);
		}
		return new Matrix(data);
	};
	
	Matrix.ortho = function (w, h, d) {
		var data = [
			[2/w,   0,    0, 0],
			[  0, 2/h,    0, 0],
			[  0,   0, -2/d, 0],
			[  0,   0,    0, 1]
		];
		return new Matrix(data);
	};
	
	Matrix.rotY = function (t) {
		var c = Math.cos(t);
		var s = Math.sin(t);
		var data = [
			[ c,  0,  s],
			[ 0,  1,  0],
			[-s,  0,  c]
		];
		return new Matrix(data);
	};
	
	Matrix.prototype.resize = function (size) {
		var data = [];
		(function (w, h) {
			for (var i = 0; i < size; ++i) {
				var row = [];
				for (var j = 0; j < size; ++j) {
					if (i < h && j < w)
						row.push(this.data[i][j]);
					else 
						row.push(i === j ? 1 : 0);
				}
				data.push(row);
			}
		}).apply(this, math.size(this.data));
		return new Matrix(data);
	}
	
	Matrix.prototype.mul = function (other) {
		return new Matrix(math.multiply(this.data, other.data));
	}
	
	Matrix.prototype.inv = function () {
		return new Matrix(math.inv(this.data));
	}
	
	Matrix.prototype.use = function (state, location) {
		var gl = state.gl;
		(function (w, h) {
			if (w !== h)
				throw 'non-square matrix';
			var uniformMatrix;
			switch (w) {
				case 2:
					uniformMatrix = gl.uniformMatrix2fv;
					break;
				case 3:
					uniformMatrix = gl.uniformMatrix3fv;
					break;
				case 4:
					uniformMatrix = gl.uniformMatrix4fv;
					break;
				default:
					throw 'invalid size';
			};
			uniformMatrix.call(gl, location, false, math.flatten(math.transpose(this.data)));
		}).apply(this, math.size(this.data));
	};
	
	return Matrix;
});

