#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
flat in uint v_visibility;

uniform sampler2D u_terrainSplat;

out vec4 outColor;

void main() {

    vec4 texture = texture(u_terrainSplat, v_textureCoordinates);

    vec3 idColor = vec3(0.0);
    if (v_visibility == 0u) { // not discovered
        idColor = vec3(1.0, 0.0, 0.0);
    } else if (v_visibility == 1u) { // discovered, not visible
        idColor = vec3(0.0, 1.0, 0.0);
    } else if (v_visibility == 2u) { // visible
        idColor = vec3(0.0, 0.0, 1.0);
    }

    outColor = vec4(idColor, texture.a);
}