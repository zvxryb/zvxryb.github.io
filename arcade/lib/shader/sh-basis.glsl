{% comment %}
	copyright 2015 by mike lodato (zvxryb@gmail.com)
	this work is subject to the terms of the MIT license
{% endcomment%}
// real-valued spherical harmonics borrowed from Wikipedia

const float sh_project_band0 = 1.0/2.0 * sqrt(1.0/pi);

void sh_project_band1(vec3 n, out float Y1[3]) {
	Y1[0] = sqrt(3.0/4.0/pi) * n.y;
	Y1[1] = sqrt(3.0/4.0/pi) * n.z;
	Y1[2] = sqrt(3.0/4.0/pi) * n.x;
}

void sh_project_band2(vec3 n, out float Y2[5]) {
	vec3 n2 = n * n;
	
	Y2[0] = 1.0/2.0 * sqrt(15.0/pi) * n.x * n.y;
	Y2[1] = 1.0/2.0 * sqrt(15.0/pi) * n.y * n.z;
	Y2[2] = 1.0/4.0 * sqrt( 5.0/pi) * (2.0*n2.z - n2.x - n2.y);
	Y2[3] = 1.0/2.0 * sqrt(15.0/pi) * n.z * n.x;
	Y2[4] = 1.0/4.0 * sqrt(15.0/pi) * (n2.x - n2.y);
}

{{ include.type }} sh_lookup({{ include.type }} x[9], vec3 n) {
	float Y0 = sh_project_band0;
	float Y1[3];
	float Y2[5];
	sh_project_band1(n, Y1);
	sh_project_band2(n, Y2);
	
	{{ include.type }} value = {{include.type}}(0.0);
	value += x[0] * Y0;
	value += x[1] * Y1[0];
	value += x[2] * Y1[1];
	value += x[3] * Y1[2];
	value += x[4] * Y2[0];
	value += x[5] * Y2[1];
	value += x[6] * Y2[2];
	value += x[7] * Y2[3];
	value += x[8] * Y2[4];
	
	return value;
}
