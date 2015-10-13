/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'math',
	'arcade/util/depthmap',
	'arcade/util/util',
	'arcade/util/webgl-matrix'
], function (
	math,
	DepthMap,
	util,
	Matrix
) {
	function Shadows(state, size, n) {
		this.size = size;
		this.shadows = util.range(n).map(function () {
			return new DepthMap(state, size);
		});
	}
	
	Shadows.prototype.use = function (indices, callback) {
		function use(shadows, indices, callback, i) {
			if (i >= shadows.length)
				return callback();
			shadows[i].use(indices[i], function () {
				use(shadows, indices, callback, i+1);
			});
		}
		use(this.shadows, indices, callback, 0);
	};
	
	Shadows.prototype.draw = function (invViewProj, viewDir, depth, objects) {
		var v_frustum = util.range(8).map(function (i) {
			var v_ndc = [
				i & 4 ? 1 : -1,
				i & 2 ? 1 : -1,
				i & 1 ? 1 : -1,
				1
			];
			
			var v_world = invViewProj.mul(v_ndc);
			v_world = math.dotDivide(v_world, v_world[3]);
			
			return v_world;
		});
		
		var n = this.shadows.length;
		var shadowView = new Array(n);
		var shadowProj = new Array(n);
		var shadowBias = new Array(n);
		this.shadows.forEach(function (shadow, i) {
			var depthView = DepthMap.createViewMatrix(viewDir).resize(4);
			
			var u_near =  i    / n;
			var u_far  = (i+1) / n;
			var base = 10;
			u_near = (Math.pow(base, u_near) - 1)/(base - 1);
			u_far  = (Math.pow(base, u_far ) - 1)/(base - 1);
			
			var v = new Array(8);
			for (var j = 0; j < 4; ++j) {
				var v0 = v_frustum[2*j  ];
				var v1 = v_frustum[2*j+1];
				
				var v_near = math.add(math.multiply(  u_near, v1),
				                      math.multiply(1-u_near, v0));
				var v_far  = math.add(math.multiply(  u_far , v1),
				                      math.multiply(1-u_far , v0));
				
				v[2*j  ] = depthView.mul(v_near);
				v[2*j+1] = depthView.mul(v_far );
			}
			
			var bbox = {
				x: { min: null, max: null },
				y: { min: null, max: null },
				z: { min: null, max: null }
			}
			for (var j = 0; j < 8; ++j) {
				(function (x, y, z) {
					if (!bbox.x.min || x < bbox.x.min) bbox.x.min = x;
					if (!bbox.x.max || x > bbox.x.max) bbox.x.max = x;
					if (!bbox.y.min || y < bbox.y.min) bbox.y.min = y;
					if (!bbox.y.max || y > bbox.y.max) bbox.y.max = y;
					if (!bbox.z.min || z < bbox.z.min) bbox.z.min = z;
					if (!bbox.z.max || z > bbox.z.max) bbox.z.max = z;
				}).apply(this, v[j]);
			}
			
			var dx = bbox.x.max - bbox.x.min;
			var dy = bbox.y.max - bbox.y.min;
			
			var x = (bbox.x.min + bbox.x.max)/2;
			var y = (bbox.y.min + bbox.y.max)/2;
			var z = bbox.z.min + depth/2;
			
			var center = depthView.inv().mul([x, y, z, 1]);
			
			depthView = depthView.mul(Matrix.translation(
				-center[0],
				-center[1],
				-center[2]));
			
			var depthProj = Matrix.ortho(dx, dy, depth);
			
			shadow.draw(depthView, depthProj, objects);
			shadowView[i] = depthView;
			shadowProj[i] = depthProj;
			shadowBias[i] = 1.1 * Math.max(dx/this.size, dy/this.size);
		}, this);
		return {
			view: shadowView,
			proj: shadowProj,
			bias: shadowBias
		};
	};
	
	return Shadows;
});
