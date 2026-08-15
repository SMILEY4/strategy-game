#version 300 es

in vec3 in_vertexPosition;
in vec2 in_textureCoordinates;
in vec2 in_tilePosition;

uniform mat4 u_camera;
uniform float u_dbg_scale;
uniform float u_dbg_hexOffsetScale;

flat out vec2 v_tilePosition;
out vec2 v_textureCoordinates;

#include "utils/wireframe-vsh.glsl"
#include "utils/hex-to-world.glsl"

// generates a random number between -1 and +1 based on the given 2d seed
float random(vec2 seed) {
    float value =  fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    return value * 2.0 - 1.0;
}

// generates a random 2d vector with values between -1 and +1 based on the given 2d seed
vec2 random2(vec2 seed) {
    return vec2(
            random(seed + vec2(+10.0, -10.0)),
            random(seed + vec2(-10.0, +10.0))
    );
}

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
    v_tilePosition = in_tilePosition;
    v_textureCoordinates = in_textureCoordinates;
    computeBarycentricCoordinates();

    // tile coordinates
    vec3 tileWorldCenter = hexToWorldCenter(in_tilePosition);

    // calculate world coordinate of each vertex
    float scale = u_dbg_scale;
    vec3 vertexWorldPos = tileWorldCenter + (in_vertexPosition * vec3(scale, 1.0, scale));

    // introduce random offset (based on unscaled world position)
    vec2 offset = offsetVertexPosition(tileWorldCenter + in_vertexPosition, u_dbg_hexOffsetScale);
    vertexWorldPos  = vertexWorldPos + vec3(offset.x, 0.0, offset.y);

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0) * vec4(1.0, -1.0, 1.0, 1.0);
}