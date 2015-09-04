{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
// GGX distribution
float D(float alpha2, vec3 n, vec3 h) {
	float NdotH  = dot(n, h);
	float NdotH2 = NdotH  * NdotH;
	float NdotH4 = NdotH2 * NdotH2;
	float a = alpha2 + 1.0 / NdotH2 - 1.0;
	return alpha2 * step(0.0, NdotH) / (pi * NdotH4 * a * a);
}

float G1(float alpha2, vec3 n, vec3 v, vec3 h) {
	float VdotH  = dot(v, h);
	float NdotV  = dot(n, v);
	float NdotV2 = NdotV * NdotV;
	return step(0.0, VdotH/NdotV) * 2.0 /
		(1.0 + sqrt(1.0 + alpha2 * (1.0 / NdotV2 - 1.0)));
}

float G(float alpha2, vec3 n, vec3 l, vec3 v, vec3 h) {
	return G1(alpha2, n, l, h) * G1(alpha2, n, v, h);
}

// cook-torrance specular
float specular_cookTorrance_GGX(float roughness, vec3 n, vec3 l, vec3 v) {
	vec3 h = normalize(l + v);
	float alpha2 = roughness * roughness;
	float NdotL = dot(n, l);
	float NdotV = dot(n, v);
	return D(alpha2, n, h) * G(alpha2, n, l, v, h) / (4.0 * NdotL * NdotV);
}
