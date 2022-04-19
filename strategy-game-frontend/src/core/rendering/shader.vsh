#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_position;
in float in_tiledata;

flat out float v_tiledata;

void main() {
    v_tiledata = in_tiledata;
    vec3 pos = u_viewProjection * vec3(in_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
