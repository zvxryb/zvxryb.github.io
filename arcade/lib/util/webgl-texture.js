/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function Texture(state, width, height, texture) {
		this.state   = state;
		this.width   = width;
		this.height  = height;
		this.texture = texture;
	}
	
	Texture.create = function(state, wrap, interpolate, mipmap, internalFormat, size, format, type, data) {
		var gl = state.gl;
		
		var wrapS, wrapT;
		if (wrap instanceof Array) {
			(function (s, t) {
				wrapS = s;
				wrapT = t;
			}).apply(null, wrap);
		} else {
			wrapS = wrap;
			wrapT = wrap;
		}
		
		var filterMin, filterMag;
		if (interpolate) {
			filterMin = mipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
			filterMag = gl.LINEAR;
		} else {
			filterMin = mipmap ? gl.NEAREST_MIPMAP_NEAREST : gl.NEAREST;
			filterMag = gl.NEAREST;
		}
		
		var width, height;
		if (size instanceof Array) {
			(function (w, h) {
				width  = w;
				height = h;
			}).apply(null, size);
		} else {
			width  = size;
			height = size;
		}
		
		var gl = state.gl;
		var texture = gl.createTexture();
		state.withTexture(0, gl.TEXTURE_2D, texture, function () {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMin);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMag);
			gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, data);
			if (mipmap && data)
				gl.generateMipmap(gl.TEXTURE_2D);
		});
		
		return new Texture(state, width, height, texture);
	}
	
	Texture.prototype.use = function (index, callback) {
		var state = this.state;
		var gl    = state.gl;
		return state.withTexture(index, gl.TEXTURE_2D, this.texture, callback);
	};
	
	Texture.prototype.attach = function (attachment) {
		var state = this.state;
		var gl    = state.gl;
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, this.texture, 0);
	};
	
	return Texture;
});

