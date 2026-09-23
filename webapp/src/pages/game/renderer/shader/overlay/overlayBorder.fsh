#version 300 es
precision mediump float;

in vec3 v_corner;
in vec4 v_color;
flat in uint v_style;
in float v_thickness;

uniform sampler2D u_paintLine;
uniform int u_side;

out vec4 outColor;

#include "../utils/noise.glsl"


void main() {

    float dist = v_corner.z;
    if(dist > v_thickness) {
        discard;
    }

    float alpha = v_corner.x;
    float dashCount = 5.0;
    if(v_style == 1u && step(fract(alpha * dashCount), 0.5) < 0.5) {
        discard;
    }

    vec2 uv = vec2(v_corner.x, v_corner.z / v_thickness);
    vec4 texture = texture(u_paintLine, uv);

    float sideAlpha = 1.0;
    if(u_side == 2) {
        sideAlpha = 0.3;
    }

    outColor = vec4(v_color.rgb, v_color.a * (1.0 - texture.r) * sideAlpha);
}

