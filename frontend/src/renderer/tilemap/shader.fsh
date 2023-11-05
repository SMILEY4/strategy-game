#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

out vec4 outColor;

void main() {
    outColor = vec4(v_textureCoordinates.xy, 1.0, 1.0);
}
