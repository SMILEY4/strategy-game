#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_position;
in float in_markerdata;

flat out float v_markerdata;

void main() {
    v_markerdata = in_markerdata;
    vec3 pos = u_viewProjection * vec3(in_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
