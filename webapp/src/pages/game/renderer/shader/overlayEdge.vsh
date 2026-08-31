#version 300 es

in vec3 in_vertexPosition;
in vec3 in_corner;
in vec2 in_tilePosition;
in uint in_direction;
in vec4 in_color;
in uint in_style;

uniform mat4 u_camera;
uniform float u_dbg_hexOffsetScale;

out vec3 v_corner;
out vec4 v_color;
flat out uint v_style;

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
    v_corner = in_corner;
    v_color = in_color;
    v_style = in_style;

    // The unit slice is the edge facing the fourth neighbour direction
    // (q - 1, r + 1). Rotate it around the tile center to the requested edge.
    // Keep y unchanged: the mesh lies on the ground plane, while x/z are the
    // horizontal axes in world space.
    float rotation = radians((4.0 - float(in_direction)) * 60.0);
    float sine = sin(rotation);
    float cosine = cos(rotation);
    vec3 rotatedVertexPosition = in_vertexPosition;
    rotatedVertexPosition.x = cosine * in_vertexPosition.x - sine * in_vertexPosition.z;
    rotatedVertexPosition.z = sine * in_vertexPosition.x + cosine * in_vertexPosition.z;

    // tile coordinates
    vec3 tileWorldCenter = hexToWorldCenter(in_tilePosition);

    // calculate world coordinate of each vertex
    vec3 vertexWorldPos = tileWorldCenter + rotatedVertexPosition;

    // introduce random offset (based on unscaled world position)
    vec2 offset = offsetVertexPosition(tileWorldCenter + rotatedVertexPosition, u_dbg_hexOffsetScale);
    vertexWorldPos = vertexWorldPos + vec3(offset.x, 0.0, offset.y);

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0);
}
