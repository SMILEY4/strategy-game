#version 300 es
precision mediump float;

in vec3 v_worldPos;

flat in vec3 v_worldPosA;     // Left vertex on outer hex boundary
flat in vec3 v_worldPosB;     // Right vertex on outer hex boundary
flat in vec3 v_worldPosC;     // Center vertex of the hex

flat in vec3 v_worldPosAwing; // Left vertex rotated one step left
flat in vec3 v_worldPosBwing; // Right vertex rotated one step right

flat in vec3 v_landDirection; // [0]: Edge AB, [1]: Edge AC, [2]: Edge BC
flat in vec2 v_extendedLand;  // [0]: Extended ray at A, [1]: Extended ray at B

uniform float u_dbg_threshold;
uniform float u_dbg_noiseScale;
uniform float u_dbg_noiseAmplitude;

out vec4 outColor;

#include "../utils/noise.glsl"
#include "../utils/geometry.glsl"


bool isTrue(float v)  { return v > 0.5; }
bool isFalse(float v) { return v < 0.5; }

bool calculateIsSideA(vec2 p, vec2 a, vec2 b, vec2 c) {
    vec2 dirAB = normalize(b - a);
    float halfLengthAB = distance(a, b) / 2.0;
    vec2 mid = a + (dirAB * halfLengthAB);

    vec2 cDir = normalize(c - mid);
    vec2 aDir = normalize(a - mid);
    vec2 pDir = normalize(p - mid);

    float dotC = dot(aDir, cDir);
    float dotP = dot(aDir, pDir);

    return dotP > dotC;
}

vec2 warpDomain(vec2 p, float scale, float amplitude) {
    vec2 noiseOffset = domainNoise2D(p * scale);
    return p + noiseOffset * amplitude;
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
        vec2 midAB
) {

    // check on which side of the current triangle we are on (left / a side or right / b side)
    bool isSideA = calculateIsSideA(p, a, b, c);
    bool isSideB = !isSideA;

    // Corner radius and arc distance calculations
    float cornerCircleRadius = distance(c, midAB);
    float distanceCornerInner = cornerCircleRadius - distance(p, c);

    float minDist = 1e5;

    // 1) contact on ab-edge, bends away from a and b
    if (isTrue(landDirection.x) && isTrue(extendedLand.x) && isTrue(extendedLand.y)) {
        minDist = min(minDist, distanceLineSegment(p, a, b));
    }

    // 2) contact on ab-edge, bends away from a and towards b
    if (isTrue(landDirection.x) && isFalse(extendedLand.x) && isTrue(extendedLand.y)) {
        if (isSideA) {
            minDist = min(minDist, distanceCornerInner);
        } else {
            minDist = min(minDist, distanceLineSegment(p, a, b));
        }
    }

    // 3) contact on ab-edge, bends towards a and away from b
    if (isTrue(landDirection.x) && isTrue(extendedLand.x) && isFalse(extendedLand.y)) {
        if (isSideB) {
            minDist = min(minDist, distanceCornerInner);
        } else {
            minDist = min(minDist, distanceLineSegment(p, a, b));
        }
    }

    // 4) contact on ab-edge, bends towards a and towards b
    if (isTrue(landDirection.x) && isFalse(extendedLand.x) && isFalse(extendedLand.y)) {
        if (isSideA || isSideB) {
            minDist = min(minDist, distanceCornerInner);
        } else {
            minDist = min(minDist, distanceLineSegment(p, a, b));
        }
    }

    // 5) contact only on vertex a
    if (isFalse(landDirection.x) && isTrue(landDirection.y) && isFalse(landDirection.z)) {
        minDist = min(minDist, distanceLineSegment(p, a, aw));
    }

    // 6) contact only on vertex b
    if (isFalse(landDirection.x) && isFalse(landDirection.y) && isTrue(landDirection.z)) {
        minDist = min(minDist, distanceLineSegment(p, b, bw));
    }

    // 7) contact only on vertices a and b
    if (isFalse(landDirection.x) && isTrue(landDirection.y) && isTrue(landDirection.z)) {
        minDist = min(minDist, distanceLineSegment(p, b, bw));
        minDist = min(minDist, distanceLineSegment(p, a, aw));
    }

    float normDist = 1.0 - clamp(minDist, 0.0, 1.0);
    normDist = clamp(normDist, 0.0, 1.0);
    
    return normDist;
}

void main() {
    // vertices of the triangle
    vec2 a  = v_worldPosA.xz;
    vec2 b  = v_worldPosB.xz;
    vec2 c  = v_worldPosC.xz;
    vec2 midAB = 0.5 * (a + b);

    // additional vertices of adjacent triangles
    vec2 aw = v_worldPosAwing.xz;
    vec2 bw = v_worldPosBwing.xz;

    // raw distance 1
    vec2 p1 = v_worldPos.xz;
    float dist1 = computeDistance(v_landDirection, v_extendedLand, p1, a, b, c, aw, bw, midAB);

    // light warped distance 2
    vec2 p2 = warpDomain(v_worldPos.xz, u_dbg_noiseScale * 0.5, u_dbg_noiseAmplitude);
    float dist2 = computeDistance(v_landDirection, v_extendedLand, p2, a, b, c, aw, bw, midAB);

    // strong warped distance 3
    vec2 p3 = warpDomain(v_worldPos.xz, u_dbg_noiseScale, u_dbg_noiseAmplitude);
    float dist3 = computeDistance(v_landDirection, v_extendedLand, p3, a, b, c, aw, bw, midAB);

    outColor = vec4(dist1, dist2, dist3, 1.0);

}