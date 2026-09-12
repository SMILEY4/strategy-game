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

out vec4 outColor;

bool isTrue(float v)  { return v > 0.5; }
bool isFalse(float v) { return v < 0.5; }

// Distance from point P to line segment AB
float distanceSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    // vertices of the triangle
    vec2 a  = v_worldPosA.xz;
    vec2 b  = v_worldPosB.xz;
    vec2 c  = v_worldPosC.xz;
    vec2 midAB = 0.5 * (a + b);

    // current sample point
    vec2 p  = v_worldPos.xz;

    // additional vertices of adjacent triangles
    vec2 aw = v_worldPosAwing.xz;
    vec2 bw = v_worldPosBwing.xz;

    // check on which side of the current triangle we are on (left / a side or right / b side)
    vec2 dirMidC = c - midAB;
    vec2 dirMidP = p - midAB;
    float dMid = dirMidC.x * dirMidP.y - dirMidC.y * dirMidP.x;
    bool isSideA = dMid > 0.0;
    bool isSideB = dMid < 0.0;

    // Corner radius and arc distance calculations
    float cornerCircleRadius = distance(c, midAB);
    float distanceCornerInner = cornerCircleRadius - distance(p, c);

    float minDist = 1e5;

    // 1) contact on ab-edge, bends away from a and b
    if (isTrue(v_landDirection.x) && isTrue(v_extendedLand.x) && isTrue(v_extendedLand.y)) {
        minDist = min(minDist, distanceSegment(p, a, b));
    }

    // 2) contact on ab-edge, bends away from a and towards b
    if (isTrue(v_landDirection.x) && isFalse(v_extendedLand.x) && isTrue(v_extendedLand.y)) {
        if (isSideA) {
            minDist = min(minDist, distanceCornerInner);
        } else {
            minDist = min(minDist, distanceSegment(p, a, b));
        }
    }

    // 3) contact on ab-edge, bends towards a and away from b
    if (isTrue(v_landDirection.x) && isTrue(v_extendedLand.x) && isFalse(v_extendedLand.y)) {
        if (isSideB) {
            minDist = min(minDist, distanceCornerInner);
        } else {
            minDist = min(minDist, distanceSegment(p, a, b));
        }
    }

    // 4) contact on ab-edge, bends towards a and towards b
    if (isTrue(v_landDirection.x) && isFalse(v_extendedLand.x) && isFalse(v_extendedLand.y)) {
        if (isSideA || isSideB) {
            minDist = min(minDist, distanceCornerInner);
        } else {
            minDist = min(minDist, distanceSegment(p, a, b));
        }
    }

    // 5) contact only on vertex a
    if (isFalse(v_landDirection.x) && isTrue(v_landDirection.y) && isFalse(v_landDirection.z)) {
        minDist = min(minDist, distanceSegment(p, a, aw));
    }

    // 6) contact only on vertex b
    if (isFalse(v_landDirection.x) && isFalse(v_landDirection.y) && isTrue(v_landDirection.z)) {
        minDist = min(minDist, distanceSegment(p, b, bw));
    }

    // 7) contact only on vertices a and b
    if (isFalse(v_landDirection.x) && isTrue(v_landDirection.y) && isTrue(v_landDirection.z)) {
        minDist = min(minDist, distanceSegment(p, b, bw));
        minDist = min(minDist, distanceSegment(p, a, aw));
    }

    float normDist = 1.0 - clamp(minDist, 0.0, 1.0);
    normDist = 1.0 - step(normDist, u_dbg_threshold);

    outColor = vec4(normDist, 0.4, 0.4, 1.0);
}