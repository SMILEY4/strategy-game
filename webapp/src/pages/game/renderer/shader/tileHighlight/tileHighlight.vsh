#version 300 es

in vec3 in_vertexPosition;
in vec2 in_textureCoordinates;
in vec2 in_tilePosition;
in int in_type;

uniform mat4 u_camera;

out vec2 v_textureCoordinates;
out vec3 v_vertexWorldPos;
flat out ivec2 v_tilePosition;
flat out int v_type;

#include "./../utils/hex-to-world.glsl"

void main() {
    v_textureCoordinates = in_textureCoordinates;
    v_tilePosition = ivec2(int(in_tilePosition.x), int(in_tilePosition.y));
    v_type = in_type;

    // tile coordinates
    vec3 tileWorldCenter = hexToWorldCenter(in_tilePosition);

    // calculate world coordinate of each vertex
    float scale = 1.0; // todo: debug variable
    vec3 vertexWorldPos = tileWorldCenter + (in_vertexPosition * vec3(scale, 1.0, scale));
    vertexWorldPos.y += 0.01;

    v_vertexWorldPos = vertexWorldPos;

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0);
}
