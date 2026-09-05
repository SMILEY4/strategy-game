#version 300 es
precision mediump float;

in vec3 v_corner;
in vec4 v_color;
flat in uint v_style;

out vec4 outColor;

void main() {

    float dist = v_corner.z;
    if(dist > 0.1) {
        discard;
    }

    float alpha = v_corner.x;
    float dashCount = 5.0;
    if(v_style == 1u && step(fract(alpha * dashCount), 0.5) < 0.5) {
        discard;
    }

    outColor = v_color;
}