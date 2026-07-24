#version 300 es
precision mediump float;

flat in vec2 v_tilePosition;
in vec2 v_textureCoordinates;

uniform sampler2D u_shape;

out vec4 outColor;

void main() {
    vec4 texture = texture(u_shape, v_textureCoordinates);
    outColor = texture;
}