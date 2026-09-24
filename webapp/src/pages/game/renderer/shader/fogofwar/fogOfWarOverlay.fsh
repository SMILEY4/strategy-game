#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform sampler2D u_mask;

out vec4 outColor;

float calculateFogAlpha(vec3 maskColor) {
    return 1.0 - clamp(maskColor.g * 0.5 + maskColor.b, 0.0, 1.0);
}

void main() {
    vec3 mask = texture(u_mask, v_textureCoordinates).rgb;
    float opacity = calculateFogAlpha(mask);


    outColor = vec4(vec3(0.0), opacity);
}