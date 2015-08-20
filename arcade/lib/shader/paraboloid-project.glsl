{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
vec2 paraboloid_project(vec3 v) {
	vec3 n = normalize(v + vec3(0.0, 0.0, 1.0));
	return n.xy / n.z;
}

vec3 paraboloid_unproject(vec2 xy) {
	float z = (1.0 - dot(xy, xy)) / 2.0;
	return normalize(vec3(xy, z));
}
