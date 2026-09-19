#version 300 es

in vec2 in_vertexPosition;
in vec2 in_textureCoordinates;
in float in_pathLength;

uniform mat4 u_camera;

out vec2 v_textureCoordinates;
out float v_pathLength;

void main() {
    v_textureCoordinates = in_textureCoordinates;
    v_pathLength = in_pathLength;
    gl_Position = u_camera * vec4(in_vertexPosition.x, 0.02, in_vertexPosition.y, 1.0);
}
