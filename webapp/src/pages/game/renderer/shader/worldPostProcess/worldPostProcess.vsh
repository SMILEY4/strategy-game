#version 300 es

in vec2 in_vertexPosition;

out vec2 v_textureCoordinates;

void main() {
    v_textureCoordinates = (in_vertexPosition + 1.0) * 0.5;
    gl_Position = vec4(in_vertexPosition, 0.0, 1.0);
}