---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

uniform mat3 invViewRot;
uniform sampler2D color;
uniform vec3 dir_sun;
uniform vec3 E_sun;

varying vec3 vEyeRay_start;
varying vec2 vEyeRay_dxy_dz;

{% include_relative rgbe8-unsigned.glsl %}
{% include_relative paraboloid-project.glsl %}

const float theta_sun = 9.35e-3;
const float Omega_sun = 6.87e-5;

void main(void) {
	vec3 eye   = normalize(-vec3(vEyeRay_dxy_dz, 1.0));
	vec3 world = invViewRot * eye;
	vec2 xy = paraboloid_project(world);
	vec3 c = vec3(0.0);
	if (world.z >= -0.01) {
		c += fromRGBE(texture2D(color, 0.49 * xy + 0.5));
		float theta = acos(dot(dir_sun, world));
		c += (1.0 - step(theta_sun, theta)) * E_sun / Omega_sun;
	}
	
	gl_FragColor = toRGBE(c);
}
