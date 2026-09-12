#version 300 es
precision mediump float;

flat in vec2 v_tilePosition;
flat in uint v_visibility;
in vec2 v_textureCoordinates;

uniform sampler2D u_baseTerrain;

out vec4 outColor;

#include "utils/wireframe-fsh.glsl"

void main() {

    // shape mask
    vec4 texture = texture(u_baseTerrain, v_textureCoordinates);


    vec3 idColor = vec3(0.0);
    if (v_visibility == 0u) { // not discovered
        idColor = vec3(1.0, 0.0, 0.0);
    } else if (v_visibility == 1u) { // discovered, not visible
        idColor = vec3(0.0, 1.0, 0.0);
    } else if (v_visibility == 2u) { // visible
        idColor = vec3(0.0, 0.0, 1.0);
    }

    // final color
    outColor = vec4(idColor, texture.a);
}