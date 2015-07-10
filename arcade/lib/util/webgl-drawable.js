/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define(['arcade/util/webgl-buffer'], function (buffer) {
	function Drawable(state, mesh) {
		this.state  = state;
		this.format = mesh.format;
		this.stride = mesh.stride;
		
		this.vertices  = new buffer.VertexBuffer(state, mesh.vertices );
		this.triangles = new buffer.IndexBuffer (state, mesh.triangles);
	}
	
	Drawable.prototype.draw = function (locations) {
		var state      = this.state;
		var gl         = state.gl;
		var format     = this.format;
		var stride     = this.stride;
		var vertices   = this.vertices;
		var triangles  = this.triangles;
		var attributes = locations.map(function (attribute0) {
			var result;
			(function (key0, index) {
				var offset = 0;
				var size0;
				var found = format.some(function (attribute1) {
					return (function (key1, size1) {
						if (key0 === key1) {
							size0 = size1
							return true;
						}
						offset += size1;
						return false;
					}).apply(null, attribute1);
				});
				if (!found)
					throw 'missing attribute ' + key0;
				result = [index, size0, gl.FLOAT, false, 4 * stride, 4 * offset];
			}).apply(null, attribute0);
			return result;
		});
		state.withAttributes(vertices, attributes, function () {
			triangles.use(function() {
				gl.drawElements(gl.TRIANGLES, triangles.count, gl.UNSIGNED_SHORT, 0);
			});
		});
	}
	
	return Drawable;
});

