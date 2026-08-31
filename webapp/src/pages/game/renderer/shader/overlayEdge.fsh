#version 300 es
precision mediump float;

in vec3 v_corner;

out vec4 outColor;

void main() {
    outColor = vec4(v_corner.rgb, 1.0);
}