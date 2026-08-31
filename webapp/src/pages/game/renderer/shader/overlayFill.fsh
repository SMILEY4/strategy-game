#version 300 es
precision mediump float;

in vec4 v_color;
flat in uint v_style;
in vec3 v_vertexPosition;


out vec4 outColor;

void main() {

    float alpha = v_vertexPosition.b;
    float dashCount = 7.0;
    if(v_style == 1u && step(fract(alpha * dashCount), 0.5) < 0.5) {
        discard;
    }

    outColor = v_color;
}