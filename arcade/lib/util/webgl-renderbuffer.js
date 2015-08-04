/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function Renderbuffer(state, width, height, renderbuffer) {
		this.state  = state;
		this.width  = width;
		this.height = height;
		this.renderbuffer = renderbuffer;
	}
	
	Renderbuffer.create = function(state, internalFormat, width, height) {
		var gl = state.gl;
		
		var renderbuffer = gl.createRenderbuffer();
		state.withRenderbuffer(renderbuffer, function () {
			gl.renderbufferStorage(gl.RENDERBUFFER, internalFormat, width, height);
		});
		return new Renderbuffer(state, width, height, renderbuffer);
	};
	
	Renderbuffer.prototype.attach = function (attachment) {
		var state = this.state;
		var gl    = state.gl;
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachment, gl.RENDERBUFFER,
			this.renderbuffer);
	};
	
	return Renderbuffer;
});

