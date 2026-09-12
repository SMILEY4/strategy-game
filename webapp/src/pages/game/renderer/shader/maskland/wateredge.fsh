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

bool isTrue(float v)  { return v > 0.5; }
bool isFalse(float v) { return v < 0.5; }

// Distance from point P to line segment AB
float distanceSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

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

vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

// Generates smooth 2D Simplex Noise in range [-1.0, 1.0]
float simplexNoise2D(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0 - sqrt(3.0)) / 6.0
            0.366025403784439,  // 0.5 * (sqrt(3.0) - 1.0)
            -0.577350269189626,  // -1.0 + 2.0 * C.x
            0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// 2-Octave Fractal Brownian Motion (fBm) for richer coastline detail
vec2 domainNoise2D(vec2 p) {
    // Primary large-scale coastline bends
    float nX = simplexNoise2D(p);
    float nY = simplexNoise2D(p + vec2(5.2, 1.3));

    // Secondary fine-scale rocky ripples (octave 2)
    nX += 0.5 * simplexNoise2D(p * 2.08 + vec2(1.7, 9.2));
    nY += 0.5 * simplexNoise2D(p * 2.08 + vec2(8.3, 2.8));

    return vec2(nX, nY);
}

// --- Domain Warping Function ---
// p: world position (v_worldPos.xz)
// scale: controls frequency/size of coastline features (smaller = larger features)
// amplitude: controls how far the coastline gets pushed/displaced
vec2 warpDomain(vec2 p, float scale, float amplitude) {
    vec2 noiseOffset = domainNoise2D(p * scale);
    return p + noiseOffset * amplitude;
}

vec4 getColorInRange(float val, float minVal, float maxVal, vec4 targetColor) {
    float inRange = step(minVal, val) * (1.0 - step(maxVal, val));
    return targetColor * inRange;
}

void main() {
    // vertices of the triangle
    vec2 a  = v_worldPosA.xz;
    vec2 b  = v_worldPosB.xz;
    vec2 c  = v_worldPosC.xz;
    vec2 midAB = 0.5 * (a + b);

    // current sample point
    vec2 p  = warpDomain(v_worldPos.xz, u_dbg_noiseScale, u_dbg_noiseAmplitude);

    // additional vertices of adjacent triangles
    vec2 aw = v_worldPosAwing.xz;
    vec2 bw = v_worldPosBwing.xz;

    // check on which side of the current triangle we are on (left / a side or right / b side)
    bool isSideA = calculateIsSideA(p, a, b, c);
    bool isSideB = !isSideA;

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
    normDist = clamp(normDist, 0.0, 1.0);

    vec4 land = getColorInRange(normDist, u_dbg_threshold, 99.0, vec4(1.0));
    vec4 outline = getColorInRange(normDist, u_dbg_threshold-0.03, u_dbg_threshold, vec4(1.0, 0.0, 0.0, 1.0));

    vec4 wave1 = getColorInRange(normDist, u_dbg_threshold-0.13, u_dbg_threshold-0.1, vec4(0.0, 0.0, 1.0, 1.0));
    vec4 wave2 = getColorInRange(normDist, u_dbg_threshold-0.43, u_dbg_threshold-0.4, vec4(0.0, 0.0, 1.0, 1.0)); // todo idea: calculate diff distances with different noise frequences -> use for different effects


    vec4 color = vec4(0.0);
    color = mix(color, land, land.a);
    color = mix(color, outline, outline.a);
    color = mix(color, wave1, wave1.a);
    color = mix(color, wave2, wave2.a);

    outColor = color;

//    outColor = vec4(normDist, normDist, normDist, 1.0);
}