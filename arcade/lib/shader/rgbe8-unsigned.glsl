{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
vec4 toRGBE(vec3 c) {
	vec3 c_abs = abs(c);
	float x = max(c_abs.r, max(c_abs.g, c_abs.b));
	float y = ceil(log2(x));
	return x <= 0.0 ? vec4(0) : vec4(c / exp2(y), (y + 128.0) / 255.0);
}

vec3 fromRGBE(vec4 rgbe) {
	float v = exp2(255.0 * rgbe.a - 128.0);
	return v * rgbe.rgb;
}
