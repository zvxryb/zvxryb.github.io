/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

importScripts(
	'/lib/require.js',
	'/lib/require-config.js'
);

var process = null;
var request = null;

require([
	'math',
	'arcade/util/mesh-isosurface',
	'arcade/util/noise'
], function (
	math,
	isosurface,
	NoiseVolume
) {
	process = function () {
		var dx = math.dotDivide(math.subtract(request.max, request.min), request.n);
		var i0 = math.floor(math.dotDivide(math.subtract(request.min, dx),  16));
		var i2 = math.floor(math.dotDivide(math.subtract(request.min, dx),  64));
		var i4 = math.floor(math.dotDivide(math.subtract(request.min, dx), 256));
		var i1 = math.add(math.ceil(math.dotDivide(math.add(request.max, dx),  16)), 1);
		var i3 = math.add(math.ceil(math.dotDivide(math.add(request.max, dx),  64)), 1);
		var i5 = math.add(math.ceil(math.dotDivide(math.add(request.max, dx), 256)), 1);
		var noise0 = new NoiseVolume(1, i0, i1);
		var noise1 = new NoiseVolume(2, i2, i3);
		var noise2 = new NoiseVolume(3, i4, i5);
		var mesh = isosurface(function (x) {
				return x[2]
					+   8 * noise0.value([x[0]/ 16, x[1]/ 16, x[2]/ 16])
					+  32 * noise1.value([x[0]/ 64, x[1]/ 64, x[2]/ 64])
					+ 128 * noise2.value([x[0]/256, x[1]/256, x[2]/256]);
			}, null, request.n, request.min, request.max);
		self.postMessage({
			key:  request.key,
			mesh: mesh
		});
		request = null;
	}
	if (request)
		process();
});

self.addEventListener('message', function (e) {
	request = e.data;
	if (process)
		process();
});
