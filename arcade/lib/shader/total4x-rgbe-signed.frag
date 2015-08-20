---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

varying vec2      vTexCoord;
uniform vec2      texelSize;
uniform sampler2D color;

{% include_relative rgbe8-signed.glsl %}

void main (void) {
	vec2 d_uv = texelSize / 4.0;
	vec2 uv0  = vTexCoord;
	
	vec3 c = vec3(0);
	
	c += fromRGBE_signed(texture2D(color, uv0 + vec2(-1.5, -1.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2(-0.5, -1.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2( 0.5, -1.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2( 1.5, -1.5) * d_uv));
	
	c += fromRGBE_signed(texture2D(color, uv0 + vec2(-1.5, -0.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2(-0.5, -0.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2( 0.5, -0.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2( 1.5, -0.5) * d_uv));
	
	c += fromRGBE_signed(texture2D(color, uv0 + vec2(-1.5,  0.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2(-0.5,  0.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2( 0.5,  0.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2( 1.5,  0.5) * d_uv));
	
	c += fromRGBE_signed(texture2D(color, uv0 + vec2(-1.5,  1.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2(-0.5,  1.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2( 0.5,  1.5) * d_uv));
	c += fromRGBE_signed(texture2D(color, uv0 + vec2( 1.5,  1.5) * d_uv));
	
	gl_FragColor = toRGBE_signed(c);
}

