/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function Mesh(format) {
		this.stride = 0;
		this.format = [];
		for (var i = 0; i < format.length; ++i) {
			var attribute = format[i];
			(function (key, size) {
				this.format.push([key, size])
				this.stride += size;
			}).apply(this, attribute);
		}
		this.vertices  = [];
		this.triangles = [];
	}
	
	Mesh.square = function () {
		var mesh = new Mesh([['position', 2]]);
		
		mesh.addVertex({ position: [-1, -1] });
		mesh.addVertex({ position: [ 1, -1] });
		mesh.addVertex({ position: [ 1,  1] });
		mesh.addVertex({ position: [-1,  1] });
		
		mesh.addTriangle(0, 1, 2);
		mesh.addTriangle(2, 3, 0);
		
		return mesh;
	}
	
	Mesh.prototype.vertexCount = function () {
		return this.vertices.length / this.stride;
	}
	
	Mesh.prototype.getVertex = function (index) {
		var vertex = {};
		var data   = this.vertices.slice(this.stride * index, this.stride * (index + 1));
		this.format.forEach(function (attribute) {
			var offset = 0;
			(function (key, size) {
				vertex[key] = data.slice(offset, offset + size);
				offset += size;
			}).apply(null, attribute);
		});
		return vertex;
	}
	
	Mesh.prototype.addVertex = function (vertex) {
		var data = [];
		this.format.forEach(function (attribute) {
			(function (key, size) {
				if (!vertex.hasOwnProperty(key))
					throw 'missing attribute data';
				var attribData = vertex[key];
				if (attribData.length != size)
					throw 'invalid attribute data';
				Array.prototype.push.apply(data, attribData);
			}).apply(null, attribute);
		});
		Array.prototype.push.apply(this.vertices, data);
	}
	
	Mesh.prototype.triangleCount = function () {
		return this.triangles.length / 3;
	}
	
	Mesh.prototype.getTriangle = function (index) {
		return this.triangles.slice(3 * index, 3 * (index + 1));
	}
	
	Mesh.prototype.addTriangle = function (a, b, c) {
		this.triangles.push(a, b, c);
	}
	
	Mesh.prototype.eachTriangle = function (callback) {
		var n = this.triangleCount();
		for (var i = 0; i < n; ++i)
			callback(this.getTriangle(i));
	}
	
	return Mesh;
});

