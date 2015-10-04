/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([
	'math',
	'jmat',
	'arcade/util/mesh',
	'arcade/util/util'
], function (
	math,
	Jmat,
	Mesh,
	util
) {
	return function (f, dfdx, n, min, max) {
		if (!dfdx) {
			dfdx = function (x) {
				var dx = 0.0001;
				var result = new Array(3);
				for (var i = 0; i < 3; ++i) {
					var x0 = x.slice();
					var x1 = x.slice();
					x0[i] -= dx/2;
					x1[i] += dx/2;
					result[i] = (f(x1) - f(x0)) / dx;
				}
				return result;
			}
		}
		
		function coord(i, j, k) {
			var u  = math.dotDivide([i, j, k], n);
			var dx = math.subtract(max, min);
			return math.add(math.dotMultiply(u, dx), min);
		}
		
		function fromJmat(jmat) {
			return jmat.e.map(function (row) {
				return row.map(function (value) {
					if (Math.abs(value.im) >= Number.EPSILON)
						throw 'value must be real';
					return value.re;
				});
			});
		}
		
		function normalize(x) {
			var norm = math.norm(x);
			return norm <= Number.EPSILON
				? [0.0, 0.0, 1.0]
				: math.dotDivide(x, norm);
		}
		
		var edges = new Array((n+2)*(n+2)*(n+2)*3);
		function edgeKey(i, j, k, axis) {
			return (((i+1)*(n+2) + (j+1))*(n+2) + (k+1)) * 3 + axis;
		}
		function getEdge(i, j, k, axis) {
			return edges[edgeKey(i, j, k, axis)];
		}
		function setEdge(i, j, k, axis, value) {
			edges[edgeKey(i, j, k, axis)] = value;
		}
		
		var vertices = new Map();
		var mesh     = new Mesh([['position', 3], ['normal', 3]]);
		for (var i = -1; i < n + 1; ++i)
		for (var j = -1; j < n + 1; ++j)
		for (var k = -1; k < n + 1; ++k)
		{
			var cellMin = coord(i  , j  , k  );
			var cellMax = coord(i+1, j+1, k+1);
			for (var axis = 0; axis < 3; ++axis) {
				var e0 = cellMin;
				var e1 = cellMin.slice();
				e1[axis] = cellMax[axis];
				
				var f0 = f(e0);
				var f1 = f(e1);
				if (f0 >= 0 && f1 >= 0 || f0 < 0 && f1 < 0)
					continue;
				
				var x0 = (f0 <= f1 ? e0 : e1)[axis];
				var x1 = (f0 <= f1 ? e1 : e0)[axis];
				for (var l = 0; l < 16; ++l) {
					var x = (x0 + x1) / 2;
					var v = cellMin.slice();
					v[axis] = x;
					if (f(v) <= 0)
						x0 = x;
					else
						x1 = x;
				}
				
				var v = cellMin.slice();
				v[axis] = (x0 + x1) / 2;
				var normal = normalize(dfdx(v));
				
				setEdge(i, j, k, axis, { x: v, n: normal, forward: f1 > f0 });
			}
		}
		
		for (var i = -1; i < n; ++i)
		for (var j = -1; j < n; ++j)
		for (var k = -1; k < n; ++k)
		{
			var c  = coord(i + 0.5, j + 0.5, k + 0.5);
			
			var A = [];
			var b = [];
			
			var i0 = i;
			var j0 = j;
			var k0 = k;
			var i1 = i0 + 1;
			var j1 = j0 + 1;
			var k1 = k0 + 1;
			var cellEdges = [
				[i0, j0, k0, 0],
				[i0, j0, k0, 1],
				[i0, j0, k0, 2],
				[i1, j0, k0, 1],
				[i1, j0, k0, 2],
				[i0, j1, k0, 0],
				[i0, j1, k0, 2],
				[i0, j0, k1, 0],
				[i0, j0, k1, 1],
				[i1, j1, k0, 2],
				[i1, j0, k1, 1],
				[i0, j1, k1, 0]
			];
			for (var edgeIndex = 0; edgeIndex < cellEdges.length; ++edgeIndex) {
				var edge = getEdge.apply(null, cellEdges[edgeIndex]);
				if (edge === undefined)
					continue;
				
				var u = math.subtract(edge.x, c);
				
				A.push(edge.n);
				b.push(math.dot(edge.n, u));
			}
			
			if (A.length < 3)
				continue;
			
			var svd = Jmat.svd(A);
			var U_T = math.transpose(fromJmat(svd.u));
			var V   = fromJmat(svd.v);
			var S_  = math.transpose(fromJmat(svd.s).map(function (row) {
				return row.map(function (value) {
					return math.abs(value) < 0.1
						? 0
						: 1 / value;
				});
			}));
			var u = math.multiply(V, math.multiply(S_, math.multiply(U_T, b)));
			var x = math.add(u, c);
			
			var normal = normalize(dfdx(x));
			
			var key   = i + ':' + j + ':' + k;
			var index = mesh.addVertex({ position: x, normal: normal });
			vertices.set(key, index);
		}
		
		for (var i = 0; i < n; ++i)
		for (var j = 0; j < n; ++j)
		for (var k = 0; k < n; ++k)
		{
			for (var axis = 0; axis < 3; ++axis) {
				var edge = getEdge(i, j, k, axis);
				if (edge === undefined)
					continue;
				
				var cells;
				switch (axis) {
					case 0:
						cells = [
							[i, j  , k  ],
							[i, j-1, k  ],
							[i, j-1, k-1],
							[i, j  , k-1]
						];
						break;
					case 1:
						cells = [
							[i  , j, k  ],
							[i  , j, k-1],
							[i-1, j, k-1],
							[i-1, j, k  ]
						];
						break;
					case 2:
						cells = [
							[i  , j  , k],
							[i-1, j  , k],
							[i-1, j-1, k],
							[i  , j-1, k]
						];
						break;
				}
				
				if (!edge.forward)
					cells.reverse();
				
				var v = cells.map(function (index) {
					var key   = index.join(':');
					var index = vertices.get(key);
					var data  = mesh.getVertex(index);
					return {
						i: index,
						x: data.position,
						n: data.normal
					};
				});
				
				function error(a, b) {
					return math.norm(math.subtract(a.x, b.x));
				}
				
				var e0 = error(v[0], v[2]);
				var e1 = error(v[1], v[3]);
				
				if (e0 <= e1)
				{
					mesh.addTriangle(v[0].i, v[1].i, v[2].i);
					mesh.addTriangle(v[2].i, v[3].i, v[0].i);
				} else {
					mesh.addTriangle(v[1].i, v[2].i, v[3].i);
					mesh.addTriangle(v[3].i, v[0].i, v[1].i);
				}
			}
		}
		
		return mesh;
	};
});
