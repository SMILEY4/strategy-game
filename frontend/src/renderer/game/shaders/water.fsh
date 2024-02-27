#version 300 es
precision mediump float;

uniform sampler2D u_texture;

in vec2 v_textureCoordinates;
flat in int v_borderMask;

out vec4 outColor;

void main() {
    vec4 texture = texture(u_texture, v_textureCoordinates);
    outColor = vec4(vec3(0.2, 0.2, 0.8), texture.a);
}
