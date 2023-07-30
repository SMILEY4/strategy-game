#version 300 es
#line 2

uniform mat3 u_viewProjection;

in vec2 in_position;
in vec3 in_color;

out vec3 v_color;

void main() {
    v_color = in_color;
    vec3 pos = u_viewProjection * vec3(in_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}