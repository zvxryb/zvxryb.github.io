/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define(['arcade/util/mesh'], function (Mesh) {
	return function(mesh, lerp) {
		var newMesh = new Mesh(mesh.format);
		newMesh.vertices = mesh.vertices.slice();
		
		var lookup  = {};
		
		function key(i, j) {
			if (i < j)
				return i.toString() + ':' + j.toString();
			return j.toString() + ':' + i.toString();
		}
		
		function get(i, j) {
			var k = key(i, j);
			var idx;
			if (lookup.hasOwnProperty(k))
				idx = lookup[k];
			if (idx === undefined) {
				var a = mesh.getVertex(i)
				var b = mesh.getVertex(j);
				var ab = lerp(a, b);
				idx = newMesh.vertexCount();
				newMesh.addVertex(ab);
				lookup[k] = idx;
			}
			return idx;
		}
		
		mesh.eachTriangle(function (tri) {
			var i = tri[0], j = tri[1], k = tri[2];
			var ij = get(i, j);
			var jk = get(j, k);
			var ki = get(k, i);
			newMesh.addTriangle(i,  ij, ki);
			newMesh.addTriangle(ij, j,  jk);
			newMesh.addTriangle(ki, jk, k );
			newMesh.addTriangle(ij, jk, ki);
		});
		
		return newMesh;
	};
});

