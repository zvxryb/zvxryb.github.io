/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

uniform vec2 scale;
uniform vec2 offset;

attribute vec3 position;

varying vec2 vTexCoord;

void main(void) {
	vTexCoord = 0.5 * position.xy + 0.5;
	gl_Position = vec4(scale * position.xy + offset, 0.0, 1.0);
}

