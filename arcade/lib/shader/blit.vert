/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

uniform vec2 scale;
uniform vec2 offset;

attribute vec2 position;

varying vec2 vTexCoord;

void main(void) {
	vTexCoord = 0.5 * position + 0.5;
	gl_Position = vec4(scale * position + offset, 0.0, 1.0);
}

