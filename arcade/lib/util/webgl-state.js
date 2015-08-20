/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function State(gl) {
		this.gl = gl;
		this.arrayBuffer = null;
		this.elementArrayBuffer = null;
		this.program = null;
		this.renderbuffer = null;
		this.framebuffer = null;
		this.viewport = gl.getParameter(gl.VIEWPORT);
		this.scissor  = gl.getParameter(gl.SCISSOR_BOX);
		this.capabilities = {}
		
		this.activeTexture = 0;
		var n = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
		this.textureImageUnits = new Array(n);
		for (var i = 0; i < n; ++i)
			this.textureImageUnits[i] = null;
	}
	
	State.prototype.withCapability = function () {
		function setCapability(gl, cap, enable) {
			return enable ? gl.enable(cap) : gl.disable(cap);
		}
		return function (cap, enable, callback) {
			var gl = this.gl;
			
			var key = 'cap' + cap.toString();
			var original = (function () {
				if (this.capabilities.hasOwnProperty(key))
					return this.capabilities[key];
				return gl.isEnabled(cap);
			}).call(this);
			
			setCapability(gl, cap, enable);
			this.capabilities[key] = enable;
			
			var result;
			try {
				result = callback();
			} finally {
				setCapability(gl, cap, original);
				this.capabilities[key] = original;
			}
			
			return result;
		}
	}();
	
	State.prototype.withBuffer = function (target, buf, callback) {
		var gl = this.gl;
		
		var key;
		switch (target) {
			case gl.ARRAY_BUFFER:
				key = 'arrayBuffer';
				break;
			case gl.ELEMENT_ARRAY_BUFFER:
				key = 'elementArrayBuffer';
				break;
			default:
				throw 'invalid target';
		}
		
		var original = this[key];
		
		gl.bindBuffer(target, buf);
		this[key] = buf;
		
		var result;
		try {
			result = callback();
		} finally {
			gl.bindBuffer(target, original);
			this[key] = original;
		}
		
		return result;
	};
	
	State.prototype.withAttributes = function(buf, attributes, callback) {
		var gl = this.gl;
		
		var indices = [];
		buf.use(function() {
			attributes.forEach(function (attribute) {
				(function (index, size, type, normalized, stride, offset) {
					gl.enableVertexAttribArray(index);
					gl.vertexAttribPointer(index, size, type, normalized,
						stride, offset);
					indices.push(index);
				}).apply(null, attribute);
			});
		});
		
		var result;
		try {
			result = callback();
		} finally {
			indices.forEach(function (index) {
				gl.disableVertexAttribArray(index);
			});
		}
		
		return result;
	};
	
	State.prototype.withProgram = function (program, callback) {
		var gl = this.gl
		var original = this.program;
		
		gl.useProgram(program);
		this.program = program;
		
		var result;
		try {
			result = callback();
		} finally {
			gl.useProgram(original);
			this.program = original;
		}
		
		return result;
	};
	
	State.prototype.withTexture = function (index, target, texture, callback) {
		var gl = this.gl;
		if (index < 0 || index >= this.textureImageUnits.length)
			throw 'invalid texture unit index';
		var original = [this.activeTexture, this.textureImageUnits[index]];
		
		gl.activeTexture(gl.TEXTURE0 + index);
		gl.bindTexture(target, texture);
		this.textureImageUnits[index] = texture;
		
		var result;
		try {
			result = callback();
		} finally {
			(function (index, texture) {
				gl.bindTexture(target, texture);
				gl.activeTexture(gl.TEXTURE0 + index);
			}).apply(null, original);
		}
		
		return result;
	};
	
	State.prototype.withRenderbuffer = function (renderbuffer, callback) {
		var gl = this.gl;
		var original = this.renderbuffer;
		
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		this.renderbuffer = renderbuffer;
		
		var result;
		try {
			result = callback();
		} finally {
			gl.bindRenderbuffer(gl.RENDERBUFFER, original);
			this.renderbuffer = original;
		}
		
		return result;
	};
	
	State.prototype.withFramebuffer = function (framebuffer, callback) {
		var gl = this.gl;
		var original = this.framebuffer;
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		this.framebuffer = framebuffer;
		
		var result;
		try {
			result = callback();
		} finally {
			gl.bindFramebuffer(gl.FRAMEBUFFER, original);
			this.framebuffer = original;
		}
		
		return result;
	};
	
	State.prototype.withViewport = function (x, y, w, h, callback) {
		var gl = this.gl;
		var original = this.viewport;
		
		gl.viewport(x, y, w, h);
		this.viewport = [x, y, w, h];
		
		var result;
		try {
			result = callback();
		} finally {
			(function (x, y, w, h) {
				gl.viewport(x, y, w, h);
			}).apply(null, original);
			this.viewport = original;
		}
		
		return result;
	};
	
	State.prototype.withScissor = function (x, y, w, h, callback) {
		var gl = this.gl;
		var original = this.scissor;
		
		gl.scissor(x, y, w, h);
		this.scissor = [x, y, w, h];
		
		var result;
		try {
			result = callback();
		} finally {
			(function (x, y, w, h) {
				gl.scissor(x, y, w, h);
			}).apply(null, original);
			this.scissor = original;
		}
		
		return result;
	};
	
	return State;
});

