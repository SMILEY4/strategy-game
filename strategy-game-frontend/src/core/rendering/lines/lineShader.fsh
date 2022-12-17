#version 300 es
#line 2
precision mediump float;

uniform vec4 u_color;
out vec4 outColor;

void main() {
    outColor = vec4(u_color);
}
