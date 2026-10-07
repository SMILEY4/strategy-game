#version 300 es

in vec3 in_vertexPosition;
in vec2 in_textureCoordinates;
in vec2 in_tilePosition;
in int in_type;

uniform mat4 u_camera;
uniform float u_scale;
uniform float u_height;

out vec2 v_textureCoordinates;
out vec3 v_vertexWorldPos;
out float v_highlightHeight;
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
    vec3 vertexWorldPos = tileWorldCenter + (in_vertexPosition * vec3(u_scale, 1.0, u_scale));
    vertexWorldPos.y *= u_height / 4.0;
    vertexWorldPos.y += 0.01;

    v_vertexWorldPos = vertexWorldPos;
    v_highlightHeight = u_height;

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0);
}
