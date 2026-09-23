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

    vec3 colorLight = vec3(143.0, 166.0, 172.0) / 255.0;
    vec3 colorDark = vec3(128.0, 159.0, 178.0) / 255.0;

    vec2 screenUV = gl_FragCoord.xy / u_resolution;
    vec4 mask = texture(u_terrainMask, screenUV);

    if(mask.g > 0.3 && mask.g < 0.35) {
        outColor = vec4(1.0);
        return;
    }

    if(mask.g > 0.6 && mask.g < 0.65) {
        outColor = vec4(1.0);
        return;
    }

    float variation = (random(v_tilePosition) + 1.0) * 0.5;
    vec3 color = mix(colorLight, colorDark, variation);

    vec4 texture = texture(u_terrainSplat, v_textureCoordinates);
    outColor = vec4(color, texture.a);
}