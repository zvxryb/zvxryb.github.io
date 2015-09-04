---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

uniform float viewAngle;
uniform float roughness;
uniform float metalness;
uniform float albedo_reflectance;

varying vec2 vTexCoord;

const float pi = 3.14159265;

{% include_relative diffuse-oren-nayar.glsl %}
{% include_relative specular-ggx.glsl %}
{% include_relative paraboloid-project.glsl %}
{% include_relative rgbe8-unsigned.glsl %}

const vec3 n = vec3(0.0, 0.0, 1.0);

void main(void) {
	vec2 xy = 2.0 * vTexCoord - 1.0;
	vec3 l = paraboloid_unproject(xy);
	if (l.z < 0.0)
		discard;
	
	vec3 v = vec3(sin(viewAngle), 0.0, cos(viewAngle));
	vec3 h = normalize(l + v);
	
	float R0 = mix(0.03, albedo_reflectance, metalness);
	float R  = mix(pow(1.0 - dot(v, h), 5.0), 1.0, R0);
	float albedo   = mix(albedo_reflectance, 0.0, metalness);
	float diffuse  = albedo * diffuse_orenNayar(roughness, n, l, v);
	float specular = specular_cookTorrance_GGX(roughness, n, l, v);
	float f = l.z * mix(diffuse, specular, R);
	gl_FragColor = toRGBE(vec3(f));
}
