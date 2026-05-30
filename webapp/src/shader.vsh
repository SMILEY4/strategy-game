#version 300 es

in vec3 in_position;
in vec2 in_textureCoords;

uniform float u_rotation;
uniform mat4 u_camera;

out vec2 v_textureCoords;


void main() {
    v_textureCoords = in_textureCoords;

    float cosR = cos(u_rotation);
    float sinR = sin(u_rotation);

    mat4 rotationY = mat4(
        cosR, 0.0, sinR, 0.0,
        0.0, 1.0,  0.0, 0.0,
        -sinR, 0.0, cosR, 0.0,
        0.0, 0.0,  0.0, 1.0
    );

    gl_Position = u_camera * rotationY * vec4(in_position, 1.0) * vec4(1.0, -1.0, 1.0, 1.0);
}