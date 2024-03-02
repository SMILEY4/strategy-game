#version 300 es
precision mediump float;

uniform sampler2D u_texture;

in vec2 v_textureCoordinates;
in vec3 v_color;

out vec4 outColor;

void main() {
    vec4 texture = texture(u_texture, v_textureCoordinates);
    outColor = vec4(v_color, texture.a);
}
