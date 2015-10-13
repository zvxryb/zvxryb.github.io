{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
float sampleShadow(sampler2D shadow, mat4 view, mat4 proj, vec3 coord) {
	vec4 eye  = view * vec4(coord, 1.0);
	vec4 clip = proj * eye;
	vec3 ndc  = clip.xyz / clip.w;
	
	if (abs(ndc.x) > 1.0 || abs(ndc.y) > 1.0 || abs(ndc.z) > 1.0)
		return -1.0;
	
	vec2 uv = 0.5 * ndc.xy + 0.5;
	
	float x = -eye.z;
	float y = decodeFloat(texture2D(shadow, uv));
	
	return x <= y ? 1.0 : 0.0;
}
