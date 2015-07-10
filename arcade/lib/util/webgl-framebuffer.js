/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function Framebuffer(state, width, height, attachments) {
		var gl  = state.gl;
		var fbo = gl.createFramebuffer();
		state.withFramebuffer(fbo, function() {
			if ('depth' in attachments)
				attachments.depth.attach(gl.DEPTH_ATTACHMENT);
			if ('stencil' in attachments)
				attachments.stencil.attach(gl.STENCIL_ATTACHMENT);
			if ('depthStencil' in attachments)
				attachments.depthStencil.attach(gl.DEPTH_STENCIL_ATTACHMENT);
			if ('color' in attachments) {
				if (attachments.color instanceof Array)
					attachments.color.forEach(function(c, i) {
						c.attach(gl.COLOR_ATTACHMENT0_WEBGL + i);
					});
				else
					attachments.color.attach(gl.COLOR_ATTACHMENT0);
			}
			if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
				throw 'framebuffer is incomplete';
		});
		this.state  = state;
		this.width  = width;
		this.height = height;
		this.fbo    = fbo;
	}
	
	Framebuffer.prototype.use = function (callback) {
		var state = this.state;
		var w = this.width;
		var h = this.height;
		return state.withFramebuffer(this.fbo, function () {
			state.withViewport(0, 0, w, h, callback);
		});
	};
	
	return Framebuffer;
});

