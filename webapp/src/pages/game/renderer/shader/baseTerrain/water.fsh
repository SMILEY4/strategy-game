#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
flat in vec2 v_tilePosition;

uniform vec2 u_resolution;
uniform sampler2D u_terrainSplat;
uniform sampler2D u_terrainMask;
uniform vec4 u_waterLightColor;
uniform vec4 u_waterDarkColor;
uniform float u_edgeThreshold;
uniform float u_edgeSoftness;

out vec4 outColor;

#include "./../utils/random.glsl"

void main() {

    vec2 screenUV = gl_FragCoord.xy / u_resolution;
    vec4 mask = texture(u_terrainMask, screenUV);

    float firstEdge = u_edgeThreshold + 0.15;
    float secondEdge = u_edgeThreshold + 0.45;
    if(mask.g > firstEdge && mask.g < firstEdge + u_edgeSoftness) {
        outColor = vec4(1.0);
        return;
    }

    if(mask.g > secondEdge && mask.g < secondEdge + u_edgeSoftness) {
        outColor = vec4(1.0);
        return;
    }

    float variation = (random(v_tilePosition) + 1.0) * 0.5;
    vec3 color = mix(u_waterLightColor.rgb, u_waterDarkColor.rgb, variation);

    vec4 texture = texture(u_terrainSplat, v_textureCoordinates);
    outColor = vec4(color, texture.a);
}
