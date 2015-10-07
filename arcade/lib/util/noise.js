/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define(['arcade/util/hash'], function (hash) {
	function gradient(x, y, z, seed) {
		var w = seed;
		for (;;) {
			var x = w = hash([x, y, z], w ^ seed);
			var y = w = hash([x, y, z], w ^ seed);
			var z = w = hash([x, y, z], w ^ seed);
			
			x /= 0x7FFFFFFF;
			y /= 0x7FFFFFFF;
			z /= 0x7FFFFFFF;
			
			if (x*x + y*y + z*z <= 1)
				return [x, y, z];
		}
	}
	
	function dotGradient(x0, y0, z0, x, y, z, seed) {
		var dx = x - x0;
		var dy = y - y0;
		var dz = z - z0;
		var g = gradient(x0, y0, z0, seed);
		return g[0] * dx + g[1] * dy + g[2] * dz;
	}
	
	function interpolate(x0, x1, t) {
		var u = t <= 0.5
			?  2 * t * t
			: -2 * t * t + 4 * t - 1;
		return u * x1 + (1 - u) * x0;
	}
	
	function noise3(x, y, z, seed) {
		var x0 = Math.floor(x);
		var y0 = Math.floor(y);
		var z0 = Math.floor(z);
		
		var x1 = x0 + 1;
		var y1 = y0 + 1;
		var z1 = z0 + 1;
		
		var u = (x - x0) / (x1 - x0);
		var v = (y - y0) / (y1 - y0);
		var w = (z - z0) / (z1 - z0);
		
		var f000 = dotGradient(x0, y0, z0, x, y, z, seed);
		var f001 = dotGradient(x0, y0, z1, x, y, z, seed);
		var f010 = dotGradient(x0, y1, z0, x, y, z, seed);
		var f011 = dotGradient(x0, y1, z1, x, y, z, seed);
		var f100 = dotGradient(x1, y0, z0, x, y, z, seed);
		var f101 = dotGradient(x1, y0, z1, x, y, z, seed);
		var f110 = dotGradient(x1, y1, z0, x, y, z, seed);
		var f111 = dotGradient(x1, y1, z1, x, y, z, seed);
		
		var f00 = interpolate(f000, f001, w);
		var f01 = interpolate(f010, f011, w);
		var f10 = interpolate(f100, f101, w);
		var f11 = interpolate(f110, f111, w);
		
		var f0 = interpolate(f00, f01, v);
		var f1 = interpolate(f10, f11, v);
		
		return interpolate(f0, f1, u);
	}
	
	return {
		noise3: noise3
	};
});
