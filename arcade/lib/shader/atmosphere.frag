---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

uniform float r_earth; // Earth's radius, m
uniform float h_sky;   // height of Earth's atmosphere, m
uniform vec3  E_sun;   // solar irradiance, W/m^2
uniform vec3  dir_sun; // sunlight direction
uniform vec3  beta_R;  // Rayleigh scattering coefficient, m^-1
uniform float beta_M;  // Mie scattering coefficient, m^-1
uniform float g;       // phase eccentricity

varying vec2 vTexCoord;

{% include_relative paraboloid-unproject.glsl %}

bool occlude(vec3 orig, vec3 dir) {
	vec3 center = vec3(0.0, 0.0, -r_earth);
	vec3 offset = center - orig;
	float t = dot(dir, offset);
	return t >= 0.0 && length(offset - t * dir) < r_earth;
}

float trace (vec3 orig, vec3 dir) {
	float r_sky = r_earth + h_sky;
	vec3 center = vec3(0.0, 0.0, -r_earth);
	vec3 offset = center - orig;
	float t = dot(dir, offset);
	return t + sqrt(t*t - dot(offset, offset) + r_sky*r_sky);
}

vec4 toRGBE(vec3 c) {
	vec3 c_abs = abs(c);
	float x = max(c_abs.r, max(c_abs.g, c_abs.b));
	float y = ceil(log2(x));
	return x <= 0.0 ? vec4(0) : vec4(c / exp2(y), (y + 128.0) / 255.0);
}

void main(void) {
	vec2 xy = 2.0 * vTexCoord - 1.0;
	vec3 dir_eye = paraboloid_unproject(xy);
	if (dir_eye.z < 0.0)
		discard;
	
	float dist_eye = trace(vec3(0, 0, 0), dir_eye);
	
	// phase function
	const float pi = 3.14159265;
	float cos_theta = dot(dir_eye, dir_sun);
	float Phi_R = 3.0 / (16.0 * pi) * (1.0 + cos_theta * cos_theta);
	float Phi_M = 1.0 / (4.0 * pi) * pow(1.0 - g, 2.0) / pow(1.0 + g * g - 2.0 * g * cos_theta, 1.5);
	
	const int steps = 10;
	float dt   = dist_eye / float(steps);
	vec3  F_ex = exp(-(beta_R + beta_M) * dt);
	
	vec3 color = vec3(0, 0, 0);
	for (int i = 0; i < steps; ++i) {
		float t = dist_eye * (1.0 - (float(i) + 0.5) / float(steps));
		vec3 orig = t * dir_eye;
		
		float sunDist = trace(orig, dir_sun);
		vec3 L_in = E_sun * (beta_R * Phi_R + beta_M * Phi_M) * exp(-(beta_R + beta_M) * sunDist) * dt;
		
		color *= F_ex;
		if (!occlude(orig, dir_sun))
			color += L_in;
	}
	
	gl_FragColor = toRGBE(color);
}

