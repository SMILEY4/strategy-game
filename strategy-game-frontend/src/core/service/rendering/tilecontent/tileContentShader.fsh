#version 300 es
precision mediump float;

uniform sampler2D u_texture;
in vec2 v_textureCoords;
in vec4 v_color;
out vec4 outColor;

void main() {
    outColor = texture(u_texture, v_textureCoords) * v_color;
}
