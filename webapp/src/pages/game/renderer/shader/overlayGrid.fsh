#version 300 es
precision mediump float;

uniform vec2 u_pointerWorldPosition;
uniform vec4 u_color;
uniform float u_thickness;


in vec2 v_worldPosition;
in float v_center;

out vec4 outColor;

void main() {

    float maxDistance = 4.0;
    float distance = distance(v_worldPosition, u_pointerWorldPosition);
    if(distance > maxDistance) {
        discard;
    }
    if(v_center > u_thickness) {
        discard;
    }

    float alpha = 1.0 - (distance / maxDistance);
    outColor = vec4(u_color.rgb, clamp(alpha, 0.0, 1.0) * u_color.a);
}