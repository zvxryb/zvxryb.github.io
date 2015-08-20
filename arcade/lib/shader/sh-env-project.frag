---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

varying vec2      vTexCoord;
uniform vec2      texelSize;
uniform sampler2D color;
uniform float     harmonics[9];

const float pi = 3.14159265;

{% include_relative paraboloid-project.glsl %}
{% include_relative rgbe8-signed.glsl %}
{% include_relative rgbe8-unsigned.glsl %}
{% include_relative sh-basis.glsl type='float' %}

void main(void) {
	vec4 rgbe = texture2D(color, vTexCoord);
	vec3 L = fromRGBE(rgbe);
	
	vec2 xy  = 2.0 * vTexCoord - 1.0;
	vec2 xy0 = 2.0 * (vTexCoord - 0.5 * texelSize) - 1.0;
	vec2 xy1 = 2.0 * (vTexCoord + 0.5 * texelSize) - 1.0;
	
	vec3 v   = paraboloid_unproject(xy);
	vec3 v_x = paraboloid_unproject(vec2(xy1.x, xy.y))
	         - paraboloid_unproject(vec2(xy0.x, xy.y));
	vec3 v_y = paraboloid_unproject(vec2(xy.x, xy1.y))
	         - paraboloid_unproject(vec2(xy.x, xy0.y));
	
	float Y = sh_lookup(harmonics, v);
	float solid_angle = length(cross(v_x, v_y));
	
	vec3 c = L * Y * solid_angle;
	
	gl_FragColor = toRGBE_signed(v.z < 0.0 ? vec3(0.0) : c);
}

