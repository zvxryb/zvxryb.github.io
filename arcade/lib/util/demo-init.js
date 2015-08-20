/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define(['arcade/util/webgl-state'], function (State) {
	return function (id) {
		var div = document.getElementById(id);
		div.style.display       = 'flex';
		div.style.flexDirection = 'column';
		div.style.flexWrap      = 'nowrap';
		div.style.alignItems    = 'stretch';
		
		var w = 640;
		var h = w * 9 / 16;
		var canvas = document.createElement('canvas');
		canvas.width  = w;
		canvas.height = h;
		canvas.style.margin    = '1em';
		canvas.style.alignSelf = 'center';
		
		var gl = null;
		var contextList = ['webgl', 'experimental-webgl'];
		for (var i = 0; i < contextList.length && !gl; ++i) {
			gl = canvas.getContext(contextList[i], {
				premultipliedAlpha: false
			});
		}
		if (!gl) {
			var text = document.createTextNode(
				'WebGL is unsupported by your browser or graphics hardware');
			
			var bold = document.createElement('div');
			bold.style.paddingTop    = '4em';
			bold.style.paddingBottom = '4em';
			bold.style.fontWeight    = 'bold';
			bold.style.textAlign     = 'center';
			bold.appendChild(text);
			
			div.appendChild(bold);
			return null;
		}
		
		div.appendChild(canvas);
		
		return {
			div:    div,
			canvas: canvas,
			width:  w,
			height: h,
			state: new State(gl)
		};
	};
});
