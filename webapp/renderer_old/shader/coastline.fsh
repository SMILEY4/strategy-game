#version 300 es
precision mediump float;

flat in vec2 v_tilePosition;
in vec2 v_textureCoordinates;

uniform sampler2D u_shape;

out vec4 outColor;

#include "utils/wireframe-fsh.glsl"

void main() {
    vec4 texture = texture(u_shape, v_textureCoordinates);
    outColor = texture;

//    if(computeWireframe() > 0.5) {
//        discard;
//    } else {
//        outColor = vec4(0.0, 0.0, 1.0, 1.0);
//    }
}