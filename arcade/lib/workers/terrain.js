/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

importScripts(
	'/lib/require.js',
	'/lib/require-config.js'
);

var queue = [];
var processQueue;

require([
	'math',
	'arcade/util/mesh-isosurface',
	'arcade/util/noise'
], function (
	math,
	isosurface,
	noise
) {
	function terrain(layers, x, y, z) {
		var result = z;
		for (var i = 0; i < layers.length; ++i) {
			var layer = layers[i];
			result += layer.scale * noise.noise3(
				x * layer.omega + layer.phi,
				y * layer.omega + layer.phi,
				z * layer.omega + layer.phi,
				layer.seed);
		}
		return result;
	}
	
	processQueue = function () {
		queue.sort(function (a, b) {
			return a.priority < b.priority ?  1
			     : a.priority > b.priority ? -1
			     : 0;
		});
		var request = queue.pop();
		var result = isosurface(function (x) {
				return terrain(request.layers, x[0], x[1], x[2]);
			}, null, request.n, request.min, request.max);
		self.postMessage(result);
	}
	processQueue();
});

self.addEventListener('message', function (e) {
	queue.push(e.data);
	if (processQueue)
		processQueue();
});
