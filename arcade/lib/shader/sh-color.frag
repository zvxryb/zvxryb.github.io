---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

uniform float harmonics[9];
varying vec3  vNormal;

const float pi = 3.14159265;

{% include_relative srgb-encode.glsl %}

{% include_relative sh-basis.glsl type='float' %}

void main() {
	vec3 n = normalize(vNormal);
	float value = sh_lookup(harmonics, n);
	float x = abs(value);
	vec3 c = value > 0.0
		? vec3(0.0, x * vec2(0.2, 1.0))
		: vec3(x * vec2(1.0, 0.2), 0.0);
	
	gl_FragColor = vec4(sRGB(c), 1.0);
}
