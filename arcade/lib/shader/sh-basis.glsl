{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
// real-valued spherical harmonics borrowed from Wikipedia
{{ include.type }} sh_lookup({{ include.type }} x[9], vec3 n) {
	vec3 n2 = n * n;
	
	{{ include.type }} value = {{include.type}}(0.0);
	value += x[0] * 1.0/2.0 * sqrt(1.0/pi);
	
	value += x[1] * sqrt(3.0/4.0/pi) * n.y;
	value += x[2] * sqrt(3.0/4.0/pi) * n.z;
	value += x[3] * sqrt(3.0/4.0/pi) * n.x;
	
	value += x[4] * 1.0/2.0 * sqrt(15.0/pi) * n.x * n.y;
	value += x[5] * 1.0/2.0 * sqrt(15.0/pi) * n.y * n.z;
	value += x[6] * 1.0/4.0 * sqrt( 5.0/pi) * (2.0*n2.z - n2.x - n2.y);
	value += x[7] * 1.0/2.0 * sqrt(15.0/pi) * n.z * n.x;
	value += x[8] * 1.0/4.0 * sqrt(15.0/pi) * (n2.x - n2.y);
	
	return value;
}
