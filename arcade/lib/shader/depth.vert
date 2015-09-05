/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

uniform mat4 modelView;
uniform mat4 projection;

attribute vec3 position;

varying float vDepth;

void main(void) {
	vec4 coord = modelView * vec4(position, 1.0);
	vDepth = -coord.z;
	gl_Position = projection * coord;
}
