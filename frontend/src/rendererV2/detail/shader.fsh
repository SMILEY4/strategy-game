#version 300 es
precision mediump float;

uniform sampler2D u_tileset;

in vec2 v_textureCoordinates;

out vec4 outColor;

void main() {
    vec4 texture = texture(u_tileset, v_textureCoordinates);
    outColor = vec4(texture);
}
