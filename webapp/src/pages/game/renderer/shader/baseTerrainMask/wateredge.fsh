#version 300 es
precision mediump float;

in vec2 v_worldPos;

flat in vec2 v_worldPosA;     // Left vertex on outer hex boundary
flat in vec2 v_worldPosB;     // Right vertex on outer hex boundary
flat in vec2 v_worldPosC;     // Center vertex of the hex

flat in vec2 v_worldPosAwing; // Left vertex rotated one step left
flat in vec2 v_worldPosBwing; // Right vertex rotated one step right

flat in vec3 v_landDirection; // [0]: Edge AB, [1]: Vertex A, [2]: Vertex C
flat in vec2 v_extendedLand;  // [0]: Extended ray at A, [1]: Extended ray at B

uniform float u_dbg_noise1Scale;
uniform float u_dbg_noise1Amplitude;
uniform float u_dbg_noise2Scale;
uniform float u_dbg_noise2Amplitude;

out vec4 outColor;

#include "../utils/noise.glsl"
#include "../utils/geometry.glsl"


bool isTrue(float v)  { return v > 0.5; }
bool isFalse(float v) { return v < 0.5; }

vec2 warpDomain(vec2 p, float scale, float amplitude) {
    vec2 noiseOffset = domainNoise2D(p * scale);
    return p + noiseOffset * amplitude;
}

bool calculateIsSideA(vec2 p, vec2 m, vec2 dirMA, float MAdotMC) {
    vec2 dirMP = normalize(p - m);
    float MAdotMP = dot(dirMA, dirMP);
    return MAdotMP > MAdotMC;
}

float cross2D(vec2 u, vec2 v) {
    return u.x * v.y - u.y * v.x;
}

bool isOutsideAB(vec2 p, vec2 a, vec2 b, vec2 c) {
    vec2 ab = b - a;
    float sideC = cross2D(ab, c - a);
    float sideP = cross2D(ab, p - a);
    if ((sideP * sideC) < 0.0) {
        return true;
    }
    return false;
}

float computeDistance(
        vec3 landDirection,
        vec2 extendedLand,
        vec2 p,
        vec2 a,
        vec2 b,
        vec2 c,
        vec2 aw,
        vec2 bw,
        vec2 m,
        vec2 dirMA,
        float MAdotMC
) {

    // boolean flags describing coastline
    bool touchesAB = landDirection.x > 0.5;
    bool touchesA = landDirection.y > 0.5;
    bool touchesB = landDirection.z > 0.5;
    bool extendsA = extendedLand.x > 0.5;
    bool extendsB = extendedLand.y > 0.5;
    
    // check on which side of the current triangle we are on (left / a side or right / b side)
    bool isSideA = calculateIsSideA(p, m, dirMA, MAdotMC);
    bool isSideB = !isSideA;

    // Corner radius and arc distance calculations
    float cornerCircleRadius = distance(c, m);
    float distanceCornerInner = cornerCircleRadius - distance(p, c);

    float minDist = 1e5;

    // 0) point lies inside of land (was warped outside of triangle)
    if(touchesAB && isOutsideAB(p, a, b, c)) {
        minDist = 0.0;
    }

    // 1) contact on ab-edge, bends away from a and b
    if (touchesAB && extendsA && extendsB) {
        minDist = min(minDist, distanceLineSegment(p, a, b));
    }

    // 2) contact on ab-edge, bends away from a and towards b
    if (touchesAB && !extendsA && extendsB) {
        if (isSideA) {
            minDist = min(minDist, distanceCornerInner);
        } else {
            minDist = min(minDist, distanceLineSegment(p, a, b));
        }
    }

    // 3) contact on ab-edge, bends towards a and away from b
    if (touchesAB && extendsA && !extendsB) {
        if (isSideB) {
            minDist = min(minDist, distanceCornerInner);
        } else {
            minDist = min(minDist, distanceLineSegment(p, a, b));
        }
    }

    // 4) contact on ab-edge, bends towards a and towards b
    if (touchesAB && !extendsA && !extendsB) {
        minDist = min(minDist, distanceCornerInner);
    }

    // 5) contact only on vertex a
    if (!touchesAB && touchesA && !touchesB) {
        minDist = min(minDist, distanceLineSegment(p, a, aw));
    }

    // 6) contact only on vertex b
    if (!touchesAB && !touchesA && touchesB) {
        minDist = min(minDist, distanceLineSegment(p, b, bw));
    }

    // 7) contact only on vertices a and b
    if (!touchesAB && touchesA && touchesB) {
        minDist = min(minDist, distanceLineSegment(p, b, bw));
        minDist = min(minDist, distanceLineSegment(p, a, aw));
    }

    return clamp(minDist, 0.0, 1.0);
}

void main() {
    // vertices of the triangle
    vec2 a  = v_worldPosA;
    vec2 b  = v_worldPosB;
    vec2 c  = v_worldPosC;

    // additional vertices of adjacent triangles
    vec2 aw = v_worldPosAwing;
    vec2 bw = v_worldPosBwing;

    // mid point between vertices A and B
    vec2 m = 0.5 * (a + b);

    // calculate dot product between vectors MC and MA (optimization for later re-use)
    vec2 dirMC = normalize(c - m);
    vec2 dirMA = normalize(a - m);
    float MAdotMC = dot(dirMA, dirMC);

    // raw distance 1
    vec2 p1 = v_worldPos;
    float dist1 = computeDistance(v_landDirection, v_extendedLand, p1, a, b, c, aw, bw, m, dirMA, MAdotMC);

    // light warped distance 2
    vec2 p2 = warpDomain(v_worldPos, u_dbg_noise1Scale, u_dbg_noise1Amplitude);
    float dist2 = computeDistance(v_landDirection, v_extendedLand, p2, a, b, c, aw, bw, m, dirMA, MAdotMC);

    // strong warped distance 3
    vec2 p3 = warpDomain(v_worldPos, u_dbg_noise2Scale, u_dbg_noise2Amplitude);
    float dist3 = computeDistance(v_landDirection, v_extendedLand, p3, a, b, c, aw, bw, m, dirMA, MAdotMC);

    outColor = vec4(dist1, dist2, dist3, 1.0);
}