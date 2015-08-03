{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
vec3 sRGB(vec3 c) {
	const float x = 0.0031308;
	vec3 c0 = 12.92 * c;
	vec3 c1 = 1.055 * pow(c, vec3(1.0/2.4)) - 0.055;
	return vec3(c.r <= x ? c0.r : c1.r,
	            c.g <= x ? c0.g : c1.g,
	            c.b <= x ? c0.b : c1.b);
}
