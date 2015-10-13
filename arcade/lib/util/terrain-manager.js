/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'math',
	'arcade/util/util',
	'arcade/util/webgl-drawable'
], function (
	math,
	util,
	Drawable
) {
	function Terrain(state, threads, size, detail, range) {
		var workers = util.range(threads).map(function (i) {
			var worker = {
				ready:  true,
				worker: new Worker('/arcade/lib/workers/terrain-worker.js')
			};
			var terrain = this;
			worker.worker.addEventListener('message', function (e) {
				worker.ready = true;
				terrain.next();
				
				var key  = e.data.key;
				var mesh = e.data.mesh;
				
				var drawable = null;
				if (mesh)
					drawable = new Drawable(state, mesh);
				var cell = terrain.cells.get(key);
				if (cell)
					cell.drawable = drawable;
			});
			return worker;
		}, this);
		this.queue   = [];
		this.size    = size;
		this.detail  = detail;
		this.range   = range;
		this.workers = workers;
		this.cells   = new Map();
	}
	
	Terrain.prototype.next = function () {
		this.workers.forEach(function (worker) {
			if (!worker.ready)
				return;
			var request = this.queue.pop();
			if (request) {
				this.cells.set(request.key, {
					i: request.i,
					j: request.j,
					k: request.k,
					drawable: null
				});
				worker.worker.postMessage(request);
				worker.ready = false;
			}
		}, this);
	}
	
	Terrain.prototype.update = function (x, y, z) {
		var i0 = Math.round(x / this.size) - this.range;
		var j0 = Math.round(y / this.size) - this.range;
		var k0 = Math.round(z / this.size) - this.range;
		var i1 = Math.round(x / this.size) + this.range;
		var j1 = Math.round(y / this.size) + this.range;
		var k1 = Math.round(z / this.size) + this.range;
		
		this.cells.forEach(function (cell, key, map) {
			if (cell.i < i0 - 1 || cell.i > i1 + 1
			 || cell.j < j0 - 1 || cell.j > j1 + 1
			 || cell.k < k0 - 1 || cell.k > k1 + 1)
				map.delete(key);
		});
		
		this.queue = [];
		for (var i = i0; i <= i1; ++i)
		for (var j = j0; j <= j1; ++j)
		for (var k = k0; k <= k1; ++k)
		{
			var key = i + ':' + j + ':' + k;
			if (this.cells.has(key))
				continue;
			
			var dx = x - i * this.size;
			var dy = y - j * this.size;
			var dz = z - k * this.size;
			var r2 = dx * dx + dy * dy + dz * dz;
			
			var c = [this.size * i, this.size * j, this.size * k];
			
			this.queue.push({
				key: key,
				i: i,
				j: j,
				k: k,
				priority: r2,
				n: this.detail,
				min: math.add(c, -this.size/2),
				max: math.add(c,  this.size/2)
			});
		}
		
		this.queue.sort(function (a, b) {
			return a.priority < b.priority ?  1
			     : a.priority > b.priority ? -1
			     : 0
		});
		
		this.next();
	}
	
	Terrain.prototype.draw = function (attributes) {
		this.cells.forEach(function (cell) {
			if (cell.drawable)
				cell.drawable.draw(attributes);
		});
	}
	
	return Terrain;
});
