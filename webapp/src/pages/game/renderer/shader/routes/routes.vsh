#version 300 es

in vec2 in_vertexPosition;
in vec2 in_textureCoordinates;

uniform mat4 u_camera;

out vec2 v_textureCoordinates;

void main() {
    v_textureCoordinates = in_textureCoordinates;
    gl_Position = u_camera * vec4(in_vertexPosition.x, 0.02, in_vertexPosition.y, 1.0);
}