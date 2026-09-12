#version 300 es

in vec3 in_vertexPosition; // vertex position of in "mesh space"
in vec3 in_corner; // the distance to the three corners (b = center, r = clockwise, g = counterclockwise)
in vec2 in_tilePosition; // the hex coordinates of the tile
in uint in_direction; // the direction the triangle is facing, vertices need to be rotated first
in vec3 in_landDirection; // [edge, first vertex, second vertex], each component is 1 when land is present
in vec2 in_extendedLand;
in vec3 in_vertexPositionA; // vertex position of vertex a / 1
in vec3 in_vertexPositionB; // vertex position of vertex b / 2

uniform mat4 u_camera;
uniform float u_dbg_hexOffsetScale;

out vec3 v_corner;
out vec3 v_worldPos;
flat out vec3 v_worldPosA;
flat out vec3 v_worldPosB;
flat out vec3 v_worldPosC;
flat out vec3 v_worldPosAwing;
flat out vec3 v_worldPosBwing;
flat out vec3 v_landDirection;
flat out vec2 v_extendedLand;

#include "../utils/random.glsl"
#include "../utils/hex-to-world.glsl"

// calculate random offset.
// seed is the world position of the vertex to make the random offset "seamless" between tiles
// seed/world position must be rounded to remove error introduced by floating point precision
vec2 offsetVertexPosition(vec3 worldPosition, float strength) {
    vec2 seed = vec2(worldPosition.x, worldPosition.z);
    seed.x = round(seed.x * 200.0) + 10.0;
    seed.y = round(seed.y * 200.0) + 10.0;
    return random2(seed) * vec2(strength);
}

vec3 rotate(vec3 in_vertexPosition, float angleDeg) {
    float rotation = radians(angleDeg);
    float sine = sin(rotation);
    float cosine = cos(rotation);
    vec3 rotatedVertexPosition = in_vertexPosition;
    rotatedVertexPosition.x = cosine * in_vertexPosition.x - sine * in_vertexPosition.z;
    rotatedVertexPosition.z = sine * in_vertexPosition.x + cosine * in_vertexPosition.z;
    return rotatedVertexPosition;
}

void main() {
    v_corner = in_corner;
    v_landDirection = in_landDirection;

    // rotate verticec
    float baseAngleDeg = 60.0;
    float segmentAngle = (4.0 - float(in_direction)) * baseAngleDeg;
    vec3 rotatedVertexPosition = rotate(in_vertexPosition, segmentAngle);
    vec3 rotatedVertexPositionA = rotate(in_vertexPositionA, segmentAngle);
    vec3 rotatedVertexPositionB = rotate(in_vertexPositionB, segmentAngle);
    vec3 rotatedVertexPositionAwing = rotate(rotatedVertexPositionA, -baseAngleDeg);
    vec3 rotatedVertexPositionBwing = rotate(rotatedVertexPositionB, +baseAngleDeg);;

    // tile coordinates
    vec3 tileWorldCenter = hexToWorldCenter(in_tilePosition);

    // calculate world coordinate of each vertex
    vec3 vertexWorldPos = tileWorldCenter + rotatedVertexPosition;
    vec3 vertexWorldPosA = tileWorldCenter + rotatedVertexPositionA;
    vec3 vertexWorldPosB = tileWorldCenter + rotatedVertexPositionB;
    vec3 vertexWorldPosAwing = tileWorldCenter + rotatedVertexPositionAwing;
    vec3 vertexWorldPosBwing = tileWorldCenter + rotatedVertexPositionBwing;

    // introduce random offset (based on unscaled world position)
//    vec2 offset = offsetVertexPosition(tileWorldCenter + rotatedVertexPosition, u_dbg_hexOffsetScale);
//    vec2 offsetA = offsetVertexPosition(tileWorldCenter + rotatedVertexPositionA, u_dbg_hexOffsetScale);
//    vec2 offsetB = offsetVertexPosition(tileWorldCenter + rotatedVertexPositionB, u_dbg_hexOffsetScale);
//    vec2 offsetAwing = offsetVertexPosition(tileWorldCenter + rotatedVertexPositionAwing, u_dbg_hexOffsetScale);
//    vec2 offsetBwing = offsetVertexPosition(tileWorldCenter + rotatedVertexPositionBwing, u_dbg_hexOffsetScale);
//    vertexWorldPos = vertexWorldPos + vec3(offset.x, 0.0, offset.y);
//    vertexWorldPosA = vertexWorldPosA + vec3(offsetA.x, 0.0, offsetA.y);
//    vertexWorldPosB = vertexWorldPosB + vec3(offsetB.x, 0.0, offsetB.y);
//    vertexWorldPosAwing = vertexWorldPosAwing + vec3(offsetAwing.x, 0.0, offsetAwing.y);
//    vertexWorldPosBwing = vertexWorldPosBwing + vec3(offsetBwing.x, 0.0, offsetBwing.y);

    // Output variables to fragment shader
    v_corner = in_corner;
    v_landDirection = in_landDirection;
    v_extendedLand = in_extendedLand;
    v_worldPos = vertexWorldPos;
    v_worldPosA = vertexWorldPosA;
    v_worldPosB = vertexWorldPosB;
    v_worldPosC = tileWorldCenter;
    v_worldPosAwing = vertexWorldPosAwing;
    v_worldPosBwing = vertexWorldPosBwing;

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0);
}
