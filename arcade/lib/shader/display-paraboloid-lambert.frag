---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

uniform float exposure;
uniform sampler2D color;
varying vec2 vTexCoord;

const float pi = 3.14159265;

{% include_relative rgbe8-unsigned.glsl %}

{% include_relative paraboloid-project.glsl %}

{% include_relative lambert-project.glsl %}

{% include_relative srgb-encode.glsl %}

vec3 tonemap(vec3 x) {
	return x/(1.0 + x);
}

void main() {
	vec2 xy0 = 2.0 * vTexCoord - 1.0;
	vec3 v = lambert_unproject(xy0);
	vec3 c = vec3(0.0);
	if (v.z >= 0.0)
	{
		vec2 xy1 = paraboloid_project(v);
		vec4 rgbe = texture2D(color, 0.5 * xy1 + 0.5);
		c = fromRGBE(rgbe);
	}
	
	float a = 1.0 - smoothstep(0.99, 1.0, length(xy0));
	gl_FragColor = vec4(sRGB(tonemap(exposure * c)), a);
}
