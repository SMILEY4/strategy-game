#version 300 es
precision mediump float;

uniform sampler2D u_texture;

in vec2 v_textureCoordinates;
in float v_depth;
flat in int v_borderMask;
in vec3 v_cornerData;
flat in int v_directionData;

out vec4 outColor;

#include border

void main() {
    vec4 texture = texture(u_texture, v_textureCoordinates);
    float depth = border_gradient(v_cornerData, v_directionData, v_borderMask);
    outColor = vec4(v_depth, depth, 1.0, texture.a);
}
