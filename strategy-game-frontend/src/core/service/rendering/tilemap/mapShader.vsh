#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_position;
in vec3 in_tiledata;
in vec3 in_tilecolor;

flat out vec3 v_tiledata;
flat out vec3 v_tilecolor;

void main() {
    v_tiledata = in_tiledata;
    v_tilecolor = in_tilecolor;
    vec3 pos = u_viewProjection * vec3(in_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
