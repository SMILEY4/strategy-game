#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
flat in vec2 v_tilePosition;

uniform vec2 u_resolution;
uniform sampler2D u_terrainSplat;
uniform sampler2D u_terrainMask;

out vec4 outColor;

#include "./../utils/random.glsl"

void main() {

    vec3 colorLight = vec3(103.0, 140.0, 52.0) / 255.0;
    vec3 colorDark = vec3(90.0, 127.0, 39.0) / 255.0;

    vec2 screenUV = gl_FragCoord.xy / u_resolution;
    vec4 mask = texture(u_terrainMask, screenUV);

    if(mask.b > 0.05 && mask.b < 0.15) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    if (mask.b > 0.15) {
        discard;
    }

    float variation = random(v_tilePosition);
    vec3 color = mix(colorLight, colorDark, variation);

    vec4 texture = texture(u_terrainSplat, v_textureCoordinates);
    outColor = vec4(color, texture.a);
}