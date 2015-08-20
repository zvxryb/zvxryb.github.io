---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

uniform float exposure;
uniform vec3 harmonics[9];
varying vec2 vTexCoord;

const float pi = 3.14159265;

{% include_relative sh-basis.glsl type='vec3' %}

{% include_relative lambert-project.glsl %}

{% include_relative srgb-encode.glsl %}

vec3 tonemap(vec3 x) {
	return x/(1.0 + x);
}

void main() {
	vec2 xy = 2.0 * vTexCoord - 1.0;
	vec3 c = vec3(0.0);
	if (dot(xy, xy) <= 1.0)
	{
		vec3 v = lambert_unproject(xy);
		c = sh_lookup(harmonics, v);
	}
	
	float a = 1.0 - smoothstep(0.99, 1.0, length(xy));
	gl_FragColor = vec4(sRGB(tonemap(exposure * c)), a);
}
