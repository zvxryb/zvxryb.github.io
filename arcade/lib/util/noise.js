/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define(['arcade/util/hash'], function (Hash) {
	function gradient(i, j, k, seed) {
		var h = new Hash(seed);
		h.word(i).word(j).word(k);
		for (;;) {
			var x = h.word(0).digest();
			var y = h.word(0).digest();
			var z = h.word(0).digest();
			
			x /= 0x7FFFFFFF;
			y /= 0x7FFFFFFF;
			z /= 0x7FFFFFFF;
			
			if (x*x + y*y + z*z <= 1)
				return [x, y, z];
		}
	}
	
	function gradientData(hash, min, max, i) {
		if (i >= min.length || i >= max.length) {
			var n = min.length;
			var result = new Array(n);
			for (var j = 0; j < n; ++j)
				result[j] = hash.word(0).digest() / 0x7FFFFFFF;
			return result;
		}
		
		var j0 = min[i];
		var j1 = max[i];
		
		var result = new Array(j1 - j0);
		for (var j = j0; j < j1; ++j) {
			var h = hash.clone().word(j);
			result[j - j0] = gradientData(h, min, max, i+1);
		}
		return result;
	}
	
	function NoiseVolume(seed, min, max) {
		this.min = min;
		this.max = max;
		this.data = gradientData(new Hash(seed), min, max, 0);
	}
	
	NoiseVolume.prototype.gradient = function (index) {
		var n = index.length;
		var data = this.data;
		for (var i = 0; i < n; ++i)
			data = data[index[i]-this.min[i]];
		return data;
	}
	
	NoiseVolume.prototype.dotGradient = function (x0, x) {
		var g = this.gradient(x0);
		var n = g.length;
		
		var result = 0;
		for (var i = 0; i < n; ++i)
			result += g[i] * (x[i] - x0[i]);
		
		return result;
	}
	
	function interpolate(x0, x1, t) {
		var t2 = t  * t;
		var t3 = t2 * t;
		var t4 = t3 * t;
		var t5 = t4 * t;
		var u = 6 * t5 - 15 * t4 + 10 * t3;
		return u * x1 + (1 - u) * x0;
	}
	
	NoiseVolume.prototype.sample = function (x0, x1, x, i) {
		var j = i.length;
		if (j >= x.length)
			return this.dotGradient(i, x);
		
		var i0 = i.slice();
		var i1 = i.slice();
		i0.push(x0[j]);
		i1.push(x1[j]);
		var f0 = this.sample(x0, x1, x, i0);
		var f1 = this.sample(x0, x1, x, i1);
		
		var t = (x[j] - x0[j]) / (x1[j] - x0[j]);
		
		return interpolate(f0, f1, t);
	}
	
	NoiseVolume.prototype.value = function (x) {
		var n = x.length;
		var x0 = new Array(n);
		var x1 = new Array(n);
		for (var i = 0; i < n; ++i) {
			x0[i] = Math.floor(x[i]);
			x1[i] = x0[i] + 1;
		}
		
		return this.sample(x0, x1, x, []);
	}
	
	return NoiseVolume;
});
