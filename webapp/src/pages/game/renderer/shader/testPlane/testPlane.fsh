#version 300 es
precision mediump float;

out vec4 outColor;

uniform vec2 u_resolution;
uniform sampler2D u_mask;
uniform int u_pass;

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 mask = texture(u_mask, uv).rgb;

    if(u_pass == 1) {
        float opacity = (1.0-mask.b)*0.5;
        outColor = vec4(0.0, 0.0, 0.0, opacity);
    }
    if(u_pass == 2) {
        float opacity = 1.0-clamp(mask.g+mask.b, 0.0, 1.0);
        outColor = vec4(0.0, 0.0, 0.0, opacity);
    }
}