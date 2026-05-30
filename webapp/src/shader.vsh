#version 300 es

in vec2 in_position;

void main() {
    gl_Position = vec4(in_position.xy, 0.0, 1.0);
}