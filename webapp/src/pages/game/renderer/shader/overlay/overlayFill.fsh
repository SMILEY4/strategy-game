#version 300 es
precision mediump float;

in vec4 v_color;
flat in uint v_style;
in vec3 v_vertexPosition;
in vec2 v_worldPos;

out vec4 outColor;

#include "../utils/noise.glsl"


void main() {

    float noise = (domainNoise2D(vec2(v_worldPos) * 0.8).x + 1.0) * 0.5;
    noise = noise * 0.5 + 0.5;

    float alpha = v_vertexPosition.b;
    float dashCount = 7.0;
    if(v_style == 1u && step(fract(alpha * dashCount), 0.5) < 0.5) {
        discard;
    }

    outColor = vec4(v_color.rgb, v_color.a * noise);
}