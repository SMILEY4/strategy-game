#version 300 es

in vec2 in_tilePosition;
in vec3 in_vertexPosition;
in vec2 in_offset;
in vec2 in_textureCoordinates;
in vec3 in_color;

uniform mat4 u_camera;
uniform vec3 u_cameraDirection;

out vec2 v_textureCoordinates;
out vec3 v_color;

#include "utils/hex-to-world.glsl"

void main() {
    v_textureCoordinates = in_textureCoordinates;
    v_color = in_color;

    // tile coordinates
    vec3 tileWorldCenter = hexToWorldCenter(in_tilePosition);

    // calculate world coordinate of each vertex
    float scale = 1.0; // todo: debug variable
    vec3 vertexWorldPos = tileWorldCenter + (in_vertexPosition * vec3(scale, 1.0, scale));
    vertexWorldPos += vec3(in_offset.x, 0.0, in_offset.y);

    // todo: really hacky...
    float tiltFactor = -u_cameraDirection.x;
    float tilt = smoothstep(-5.0, -0.0, tiltFactor);
    vertexWorldPos += vec3(-tilt * vertexWorldPos.y, 0.0, 0.0);

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0) * vec4(1.0, -1.0, 1.0, 1.0);
}