/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

varying vec2 vTexCoord;

uniform float     exposure;
uniform sampler2D color;

vec3 tonemap(vec3 x) {
	return x/(1.0 + x);
}

vec3 sRGB(vec3 c) {
	const float x = 0.0031308;
	vec3 c0 = 12.92 * c;
	vec3 c1 = 1.055 * pow(c, vec3(1.0/2.4)) - 0.055;
	return vec3(c.r <= x ? c0.r : c1.r,
	            c.g <= x ? c0.g : c1.g,
	            c.b <= x ? c0.b : c1.b);
}

vec3 fromRGBE(vec4 rgbe) {
	float v = exp2(255.0 * rgbe.a - 128.0);
	return v * rgbe.rgb;
}

void main(void) {
	vec4 c = texture2D(color, vTexCoord);
	
	if (all(greaterThan(c.rgb, vec3(0.999))) && c.a < 0.001)
		discard;
	
	gl_FragColor = vec4(sRGB(tonemap(exposure * fromRGBE(c))), 1.0);
}

