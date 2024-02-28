#version 300 es
precision mediump float;

uniform sampler2D u_texture;

in vec2 v_textureCoordinates;

out vec4 outColor;

void main() {
    vec4 texture = texture(u_texture, v_textureCoordinates);
    outColor = vec4(vec3(0.15, 0.15, 0.15), texture.a);
}
