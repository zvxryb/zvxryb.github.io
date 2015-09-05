---
---
/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

precision highp float;

varying float vDepth;

{% include_relative float-rgba8.glsl %}

void main(void) {
	gl_FragColor = encodeFloat(vDepth);
}
