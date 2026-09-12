#version 300 es
precision mediump float;

flat in vec2 v_tilePosition;
in vec2 v_textureCoordinates;

out vec4 outColor;

void main() {
    outColor = vec4(vec3(1.0), 1.0);
}