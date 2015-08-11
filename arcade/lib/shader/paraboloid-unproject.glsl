{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
vec3 paraboloid_unproject(vec2 xy) {
	float z = (1.0 - dot(xy, xy)) / 2.0;
	return normalize(vec3(xy, z));
}
