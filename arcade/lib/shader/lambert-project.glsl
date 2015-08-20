{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
vec3 lambert_unproject(vec2 xy) {
	xy *= 2.0;
	float a = dot(xy, xy);
	vec3 v = vec3(sqrt(1.0 - a / 4.0) * xy, a / 2.0 - 1.0);
	v.z = -v.z;
	return v;
}

