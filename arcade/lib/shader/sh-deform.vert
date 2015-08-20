---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

uniform   mat4  mvp;
uniform   float deform;
uniform   float harmonics[9];
attribute vec3  position;
varying   vec3  vNormal;

const float pi = 3.14159265;

{% include_relative sh-basis.glsl type='float' %}

void main() {
	vec3 n = normalize(position);
	float scale = sh_lookup(harmonics, n);

	vNormal = n;
	gl_Position = mvp * vec4(mix(1.0, abs(scale), deform) * n, 1.0);
}
