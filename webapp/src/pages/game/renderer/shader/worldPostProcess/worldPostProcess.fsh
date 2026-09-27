#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform sampler2D u_worldColor;

out vec4 outColor;

void main() {
    outColor = texture(u_worldColor, v_textureCoordinates);
}