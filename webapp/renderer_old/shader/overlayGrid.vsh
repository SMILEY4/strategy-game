#version 300 es

in vec3 in_vertexPosition;
in float in_center;
in vec2 in_tilePosition;

uniform float u_dbg_hexOffsetScale;
uniform mat4 u_camera;
uniform vec2 u_pointerHexPosition;

out float v_center;
out vec2 v_worldPosition;

#include "utils/hex-to-world.glsl"

void main() {

    // tile coordinates
    vec3 tileWorldCenter = hexToWorldCenter(in_tilePosition + u_pointerHexPosition);

    // calculate world coordinate of each vertex
    vec3 vertexWorldPos = tileWorldCenter + in_vertexPosition;

    v_worldPosition = vertexWorldPos.xz;
    v_center = in_center;

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0);
}