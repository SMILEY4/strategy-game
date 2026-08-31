#version 300 es

in vec3 in_vertexPosition;
in vec2 in_tilePosition;

uniform mat4 u_camera;
uniform float u_dbg_hexOffsetScale;

#include "utils/random.glsl"
#include "utils/hex-to-world.glsl"

// calculate random offset.
// seed is the world position of the vertex to make the random offset "seamless" between tiles
// seed/world position must be rounded to remove error introduced by floating point precision
vec2 offsetVertexPosition(vec3 worldPosition, float strength) {
    vec2 seed = vec2(worldPosition.x, worldPosition.z);
    seed.x = round(seed.x * 200.0) + 10.0;
    seed.y = round(seed.y * 200.0) + 10.0;
    return random2(seed) * vec2(strength);
}

void main() {

    // tile coordinates
    vec3 tileWorldCenter = hexToWorldCenter(in_tilePosition);

    // calculate world coordinate of each vertex
    vec3 vertexWorldPos = tileWorldCenter + in_vertexPosition;

    // introduce random offset (based on unscaled world position)
    vec2 offset = offsetVertexPosition(tileWorldCenter + in_vertexPosition, u_dbg_hexOffsetScale);
    vertexWorldPos = vertexWorldPos + vec3(offset.x, 0.0, offset.y);

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0);
}