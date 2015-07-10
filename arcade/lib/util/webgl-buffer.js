/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function VertexBuffer(state, data) {
		var gl = state.gl;
		
		this.state = state;
		this.count = data.length;
		this.buf   = gl.createBuffer();
		state.withBuffer(gl.ARRAY_BUFFER, this.buf, function () {
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		});
	}
	
	VertexBuffer.prototype.use = function (callback) {
		var state = this.state;
		var gl    = state.gl;
		return state.withBuffer(gl.ARRAY_BUFFER, this.buf, callback);
	};
	
	function IndexBuffer(state, data) {
		var gl = state.gl;
		
		this.state = state;
		this.count = data.length;
		this.buf   = gl.createBuffer();
		state.withBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buf, function() {
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
		});
	}
	
	IndexBuffer.prototype.use = function (callback) {
		var state = this.state;
		var gl    = state.gl;
		return state.withBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buf, callback);
	}
	
	return {
		VertexBuffer: VertexBuffer,
		IndexBuffer:  IndexBuffer
	}
});
