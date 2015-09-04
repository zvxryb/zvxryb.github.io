/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'math',
	'arcade/util/util'
], function (
	math,
	util
) {
	var lines = [];
	lines.push('void sh_rotate_band1(mat3 M, inout vec3 x[3]) {');
	Array.prototype.push.apply(lines,
		['r', 'g', 'b'].map(function (color) {
			return '\tvec3 '+color+' = M * vec3('+[2, 0, 1].map(function (i) {
				return 'x['+i+'].'+color;
			}).join(', ')+');';
		})
	);
	Array.prototype.push.apply(lines,
		['y', 'z', 'x'].map(function (axis, i) {
			return '\tx['+i+'] = vec3('+['r', 'g', 'b'].map(function (color) {
				return color+'.'+axis
			}).join(', ')+');';
		})
	);
	lines.push('}');
	lines.push('');
	
	var pi = Math.PI;
	var epsilon = 0.0001;
	function project_band2(x, y, z) {
		var x2 = x * x;
		var y2 = y * y;
		var z2 = z * z;
		return [
			1/2 * math.sqrt(15/pi) * x * y,
			1/2 * math.sqrt(15/pi) * y * z,
			1/4 * math.sqrt( 5/pi) * (2*z2 - x2 - y2),
			1/2 * math.sqrt(15/pi) * z * x,
			1/4 * math.sqrt(15/pi) * (x2 - y2)
		]
	}
	var c = 1/math.sqrt(2);
	var n = [
		[1,0,0],
		[0,0,1],
		[c,c,0],
		[c,0,c],
		[0,c,c]
	]
	var A = math.transpose(n.map(function (v) {
		return project_band2.apply(null, v);
	}));
	var invA = math.inv(A);
	
	lines.push('void sh_rotate_band2(mat3 M, inout vec3 x[5]) {');
	Array.prototype.push.apply(lines,
		n.map(function (n, i) {
			return '\tconst vec3 n'+i+' = vec3('+n.join(', ')+');';
		})
	);
	lines.push('');
	
	Array.prototype.push.apply(lines,
		invA.map(function (row, i) {
			var line = row.reduce(function (line, cell, j) {
				if (math.abs(cell) < epsilon)
					return line;
				var part = 'float('+cell+')*x['+j+']';
				if (!line)
					return part
				return line + ' + ' + part;
			}, null);
			if (!line)
				line = '0.0';
			return '\tvec3 sh'+i+' = '+line+';';
		})
	);
	lines.push('');
	
	Array.prototype.push.apply(lines,
		util.range(5).map(function (i) {
			return '\tfloat r'+i+'[5]; sh_project_band2(M*n'+i+', r'+i+');';
		})
	);
	lines.push('');
	
	Array.prototype.push.apply(lines,
		util.range(5).map(function (i) {
			var line = util.range(5).map(function (j) {
				//return 'r'+i+'['+j+']*sh'+j;
				return 'r'+j+'['+i+']*sh'+j;
			}).join(' + ');
			return '\tx['+i+'] = '+line+';';
		})
	);
	lines.push('}');
	lines.push('');
	
	lines.push('void sh_rotate(mat3 M, inout vec3 x[9]) {');
	lines.push('\tvec3 x1[3];');
	Array.prototype.push.apply(lines,
		util.range(3).map(function (i) {
			return '\tx1['+i+'] = x['+(i+1)+'];';
		})
	);
	lines.push('\tsh_rotate_band1(M, x1);');
	lines.push('');
	lines.push('\tvec3 x2[5];');
	Array.prototype.push.apply(lines,
		util.range(5).map(function (i) {
			return '\tx2['+i+'] = x['+(i+4)+'];';
		})
	);
	lines.push('\tsh_rotate_band2(M, x2);');
	lines.push('');
	Array.prototype.push.apply(lines,
		util.range(3).map(function (i) {
			return '\tx['+(i+1)+'] = x1['+i+'];';
		})
	);
	Array.prototype.push.apply(lines,
		util.range(5).map(function (i) {
			return '\tx['+(i+4)+'] = x2['+i+'];';
		})
	);
	lines.push('}');
	
	return lines.join('\n');
});
