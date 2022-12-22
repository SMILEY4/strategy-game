#version 300 es
#line 2
precision mediump float;

in vec2 v_texcoords;
in vec3 v_color;
out vec4 outColor;

void main() {
    outColor = vec4(v_color, 1.0);
}
