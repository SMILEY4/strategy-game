#version 300 es
precision mediump float;

flat in vec2 v_tilePosition;
in vec2 v_textureCoordinates;

uniform sampler2D u_baseTerrain;

out vec4 outColor;

void main() {

    // shape mask
    vec4 texture = texture(u_baseTerrain, v_textureCoordinates);

    // final color
    outColor = vec4(vec3(112.0/255.0, 112.0/255.0, 86.0/255.0), texture.a);
}