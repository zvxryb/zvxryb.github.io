---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

uniform vec3      viewCoord;
uniform float     texelSize;
uniform sampler2D brdf[2];
uniform float     brdfScale;
uniform vec3      env[9];
uniform vec3      albedo_reflectance;
uniform float     metalness;
uniform float     roughness;
uniform vec3      dir_sun;
uniform vec3      E_sun;
uniform float     direct_scale;
uniform float     sky_scale;
uniform sampler2D shadowMap;
uniform mat4      shadowView;
uniform mat4      shadowProj;
varying vec3 vCoord;
varying vec3 vNormal;

const float pi = 3.14159265;

{% include_relative rgbe8-unsigned.glsl %}
{% include_relative float-rgba8.glsl %}
{% include_relative shadowmap.glsl %}
{% include_relative diffuse-oren-nayar.glsl %}
{% include_relative specular-ggx.glsl %}
{% include_relative sh-basis.glsl type='vec3' %}
@evaluate(arcade/shader/sh-rotation)

void sample_brdf(float viewAngle, float roughness,
	float u0, float u1, float v0, float v1, out float x[9])
{
	vec2 minUV = vec2(u0, v0);
	vec2 maxUV = vec2(u1, v1);
	vec2 texCoord = mix(minUV, maxUV, vec2(
		clamp(2.0 * viewAngle / pi,    0.0, 1.0),
		clamp((roughness - 0.1) / 0.9, 0.0, 1.0)
	));
	vec2 a = brdfScale * (2.0 * texture2D(brdf[0], texCoord).ra - 1.0);
	vec4 b = brdfScale * (2.0 * texture2D(brdf[1], texCoord)    - 1.0);
	x[0] = a.x;
	x[1] = 0.0;
	x[2] = a.y;
	x[3] = b.x;
	x[4] = 0.0;
	x[5] = 0.0;
	x[6] = b.y;
	x[7] = b.z;
	x[8] = b.w;
}

void main() {
	vec3 n = normalize(vNormal);
	vec3 v = normalize(viewCoord - vCoord);
	vec3 t_y = normalize(cross(  n, v));
	vec3 t_x = normalize(cross(t_y, n));
	mat3 R = mat3(t_x, t_y, n);
	
	float viewAngle = acos(dot(n, v));
	
	float halfTexel = texelSize/2.0;
	
	float u0 = 0.0 + halfTexel;
	float u1 = 0.5 - halfTexel;
	float u2 = 0.5 + halfTexel;
	float u3 = 1.0 - halfTexel;
	
	float v0 = 0.0 + halfTexel;
	float v1 = 0.5 - halfTexel;
	float v2 = 0.5 + halfTexel;
	float v3 = 1.0 - halfTexel;
	
	float dielectric0[9];
	float dielectric1[9];
	float metal0[9];
	float metal1[9];
	sample_brdf(viewAngle, roughness, u0, u1, v0, v1, dielectric0);
	sample_brdf(viewAngle, roughness, u2, u3, v0, v1, dielectric1);
	sample_brdf(viewAngle, roughness, u0, u1, v2, v3, metal0);
	sample_brdf(viewAngle, roughness, u2, u3, v2, v3, metal1);
	
	vec3 f[9];
	for (int i = 0; i < 9; ++i) {
		vec3 dielectric = mix(vec3(dielectric0[i]), vec3(dielectric1[i]),
			albedo_reflectance);
		vec3 metal = mix(vec3(metal0[i]), vec3(metal1[i]), albedo_reflectance);
		f[i] = mix(dielectric, metal, metalness);
	}
	sh_rotate(R, f);
	
	vec3 sky = vec3(0.0);
	for (int i = 0; i < 9; ++i) {
		sky += env[i] * f[i];
	}
	
	vec3 h = normalize(v + dir_sun);
	vec3 F0 = mix(vec3(0.03), albedo_reflectance, metalness);
	vec3 F = mix(vec3(pow(1.0 - dot(v, h), 5.0)), vec3(1.0), F0);
	vec3 albedo = mix(albedo_reflectance, vec3(0.0), metalness);
	vec3 diffuse  = albedo * diffuse_orenNayar(roughness, n, dir_sun, v);
	vec3 specular = vec3(specular_cookTorrance_GGX(roughness, n, dir_sun, v));
	vec3 direct = E_sun * max(dot(n, dir_sun), 0.0) * mix(diffuse, specular, F);
	
	float shadow = sampleShadow(shadowMap, shadowView, shadowProj, vCoord + 0.05 * n);
	
	vec3 c = sky * sky_scale + shadow * direct * direct_scale;
	
	gl_FragColor = toRGBE(c);
}
