/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

uniform   mat4 model;
uniform   mat4 mvp;
attribute vec3 position;
attribute vec3 normal;
varying   vec3 vCoord;
varying   vec3 vNormal;

void main(void) {
	vec4 world = model * vec4(position, 1.0);
	
	vCoord  = world.xyz;
	vNormal = normal;
	
	gl_Position = mvp * vec4(position, 1.0);
}
