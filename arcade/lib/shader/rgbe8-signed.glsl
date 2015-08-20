{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
vec4 toRGBE_signed(vec3 c) {
	vec3 c_abs = abs(c);
	float x = max(c_abs.r, max(c_abs.g, c_abs.b));
	float y = ceil(log2(x));
	return vec4(0.5 * c / exp2(y) + 0.5, (y + 128.0) / 255.0);
}

vec3 fromRGBE_signed(vec4 rgbe) {
	float v = exp2(255.0 * rgbe.a - 128.0);
	return v * (2.0 * rgbe.rgb - 1.0);
}
