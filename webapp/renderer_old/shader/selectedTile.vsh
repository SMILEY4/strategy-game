#version 300 es

in vec3 in_vertexPosition;
in vec2 in_textureCoordinates;
in vec2 in_tilePosition;

uniform mat4 u_camera;

out vec2 v_textureCoordinates;

#include "utils/hex-to-world.glsl"

void main() {
    v_textureCoordinates = in_textureCoordinates;

    // tile coordinates
    vec3 tileWorldCenter = hexToWorldCenter(in_tilePosition);

    // calculate world coordinate of each vertex
    float scale = 1.0; // todo: debug variable
    vec3 vertexWorldPos = tileWorldCenter + (in_vertexPosition * vec3(scale, 1.0, scale));

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0);
}