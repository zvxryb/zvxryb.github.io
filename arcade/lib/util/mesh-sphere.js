/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define(['math', 'arcade/util/mesh', 'arcade/util/mesh-subdivide'],
function (math, Mesh, subdivide) {
	var z = 1 / Math.sqrt(5);
	var r = 2 / Math.sqrt(5);
	var vertices = [
		[ 0,  0, -1],
		[ 0,  0,  1]
	];
	for (var i = 0; i < 10; ++i) {
		var t = 2 * Math.PI * i / 10;
		var x = r * Math.cos(t);
		var y = r * Math.sin(t);
		vertices.push([x, y, i % 2 > 0 ? z : -z]);
	}
	
	var triangles = [];
	for (var i = 0; i < 10; ++i) {
		var a = i % 2;
		var b = 2 + i;
		var c = 2 + (i + 1) % 10;
		var d = 2 + (i + 2) % 10;
		triangles.push(a === 1 ? [a, b, d] : [a, d, b]);
		triangles.push(a === 1 ? [b, c, d] : [b, d, c]);
	}
	
	function sphere(detail) {
		if (detail <= 0) {
			var mesh = new Mesh([['position', 3]]);
			
			vertices.forEach(function (vertex) {
				mesh.addVertex({
					position: math.divide(vertex, math.norm(vertex))
				});
			});
			
			triangles.forEach(function (triangle) {
				Mesh.prototype.addTriangle.apply(mesh, triangle);
			});
			
			return mesh;
		};
		return subdivide(sphere(detail-1), function (a, b) {
			var c = math.add(a.position, b.position);
			c = math.divide(c, math.norm(c));
			return { position: c };
		});
	}
	
	return sphere;
});

