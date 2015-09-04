/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

uniform mat4 invProj;

attribute vec2 position;

varying vec3 vEyeRay_start;
varying vec2 vEyeRay_dxy_dz;

void main(void) {
	vec4 ndc0 = vec4(position, -1.0, 1.0);
	vec4 ndc1 = vec4(position,  1.0, 1.0);
	vec4 eye0 = invProj * ndc0;
	vec4 eye1 = invProj * ndc1;
	eye0 /= eye0.w;
	eye1 /= eye1.w;
	vec3 eye_diff = eye1.xyz - eye0.xyz;
	vEyeRay_start  = eye0.xyz;
	vEyeRay_dxy_dz = eye_diff.xy / eye_diff.z;
	gl_Position = vec4(position, 1.0, 1.0);
}

