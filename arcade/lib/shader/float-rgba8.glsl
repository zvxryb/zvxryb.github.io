{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
float encodeByte(inout float x) {
	float y = 255.0 * x;
	x = fract(y);
	return floor(y) / 255.0;
}

void decodeByte(inout float x, float y) {
	x /= 255.0;
	x += y;
}

vec4 encodeFloat(float x) {
	float e = ceil(log2(abs(x)));
	
	float y = 0.5 * x / exp2(e) + 0.5;
	
	float m0 = encodeByte(y);
	float m1 = encodeByte(y);
	float m2 = encodeByte(y);
	
	return vec4(m0, m1, m2, (e + 128.0) / 255.0);
}

float decodeFloat(vec4 c) {
	float x = 0.0;
	decodeByte(x, c.b);
	decodeByte(x, c.g);
	decodeByte(x, c.r);
	
	x = (2.0 * x - 1.0) * exp2(255.0 * c.a - 128.0);
	
	return x;
}
