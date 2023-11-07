#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_position;

void main() {
    gl_Position = vec4((u_viewProjection * vec3(in_position, 1.0)).xy, 0.0, 1.0);
}