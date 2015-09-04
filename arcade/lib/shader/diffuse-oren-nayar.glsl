{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
// oren-nayar diffuse
float diffuse_orenNayar(float roughness, vec3 n, vec3 l, vec3 v) {
	float sigma = 1.0/sqrt(2.0)*atan(roughness);
	float sigma2 = sigma * sigma;
	
	float A = 1.0 - 0.5 * sigma2 / (sigma2 + 0.33);
	float B = 0.45 * sigma2 / (sigma2 + 0.09);
	
	float NdotL = dot(n, l);
	float NdotV = dot(n, v);
	float cosPhi   = dot(normalize(l - NdotL*n), normalize(v - NdotV*n));
	float cosAlpha = min(NdotL, NdotV);
	float cosBeta  = max(NdotL, NdotV);
	float sinAlpha = sqrt(1.0 - cosAlpha * cosAlpha);
	float tanBeta  = sqrt(1.0 - cosBeta  * cosBeta ) / cosBeta;
	return (A + B * max(0.0, cosPhi) * sinAlpha * tanBeta) / pi;
}
