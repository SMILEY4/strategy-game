#version 300 es
precision mediump float;

in vec4 v_color;
flat in uint v_style;
in vec3 v_vertexPosition;
in vec2 v_worldPos;

out vec4 outColor;

uniform float u_noiseScale;
uniform float u_noiseStrength;
uniform float u_dashCount;

#include "../utils/noise.glsl"


void main() {

    float noise = (domainNoise2D(vec2(v_worldPos) * u_noiseScale).x + 1.0) * 0.5;
    noise = noise * u_noiseStrength + (1.0 - u_noiseStrength);

    float alpha = v_vertexPosition.b;
    if(v_style == 1u && step(fract(alpha * u_dashCount), 0.5) < 0.5) {
        discard;
    }

    outColor = vec4(v_color.rgb, v_color.a * noise);
}
