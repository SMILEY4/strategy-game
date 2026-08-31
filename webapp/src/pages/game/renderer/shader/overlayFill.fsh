#version 300 es
precision mediump float;

in vec4 v_color;
flat in uint v_style;

out vec4 outColor;

void main() {
    outColor = v_color;
}