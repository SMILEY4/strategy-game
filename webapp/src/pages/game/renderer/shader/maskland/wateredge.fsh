#version 300 es
precision mediump float;

in vec3 v_worldPos;

flat in vec3 v_worldPosA; // Left vertex on outer hex boundary
flat in vec3 v_worldPosB; // Right vertex on outer hex boundary
flat in vec3 v_worldPosC; // Center vertex of the hex

flat in vec3 v_worldPosAwing; // left vertex rotated one step left, represents the left vertex of the left neightbour triangle / hex segment
flat in vec3 v_worldPosBwing; // right vertex rotated one step right, represents the right vertex of the right neightbour / hex segment

flat in vec3 v_landDirection; // [0]: Edge BC (outer), [1]: Edge AB (left), [2]: Edge AC (right)

flat in vec2 v_extendedLand;  // [0]: Extended coastline ray at B, [1]: Extended coastline ray at C

out vec4 outColor;

bool isTrue(float value) { return value > 0.5; }
bool isFalse(float value) { return value < 0.5; }


float sdSegment(vec2 P, vec2 A, vec2 B) {
    vec2 ba = B - A;
    float d2 = dot(ba, ba);
    if (d2 < 1e-12) return length(P - A); // degenerate segment
    vec2 pa = P - A;
    float h = clamp(dot(pa, ba) / d2, 0.0, 1.0);
    return length(pa - ba * h);
}

// Distance from P to the circular arc that starts at A, ends at B,
// and bulges away from the chord AB by signed amount "bulge"
// (bulge = 0 means a straight line, i.e. just the segment A-B).
float sdArcAB(vec2 A, vec2 B, vec2 P, float bulge) {
    vec2 chord = B - A;
    float c = 0.5 * length(chord);          // half chord length
    if (c < 1e-6) return length(P - A);     // A == B

    vec2 mid = 0.5 * (A + B);

    if (abs(bulge) < 1e-5) {
        return sdSegment(P, A, B);          // degenerate: straight line
    }

    vec2 tangent = chord / (2.0 * c);
    vec2 perp = vec2(-tangent.y, tangent.x);

    float s = bulge;
    float r = (c * c + s * s) / (2.0 * s);  // signed radius
    vec2 center = mid + perp * (s - r);
    float ra = abs(r);

    vec2 apex = mid + perp * s;          // arc's midpoint (on the circle)
    vec2 apexDir = normalize(apex - center);
    vec2 rightDir = vec2(apexDir.y, -apexDir.x);

    // Local frame: y = toward apex, x = perpendicular to it
    vec2 rel = P - center;
    vec2 pp = vec2(abs(dot(rel, rightDir)), dot(rel, apexDir));

    float sinAp = clamp(c / ra, -1.0, 1.0);
    float cosAp = dot(normalize(A - center), apexDir);
    vec2 sc = vec2(sinAp, cosAp);           // half-aperture sin/cos

    // Classic IQ arc distance formula
    if (sc.y * pp.x > sc.x * pp.y) {
        return length(pp - sc * ra);        // closest to an endpoint
    } else {
        return abs(length(pp) - ra);        // closest to the circle body
    }
}


void main() {

    vec2 p = v_worldPos.xz;

    vec2 a = v_worldPosA.xz;
    vec2 b = v_worldPosB.xz;
    vec2 c = v_worldPosC.xz;

    vec2 aw = v_worldPosAwing.xz;
    vec2 bw = v_worldPosBwing.xz;

    float cornerOffsetLength = 0.1;
    vec2 dirAB = B - A;
    float lenAB = length(dirAB);
    vec2 ai = A + dir * cornerOffsetLength;
    vec2 bi = b - dir * cornerOffsetLength;


    float minDist = 1e5;
    vec4 color = vec4(0.3, 0.3, 0.3, 1.0);

    // 1) contact on ab-edge, bends away from a and b
    if (isTrue(v_landDirection.x) && isTrue(v_extendedLand.x) && isTrue(v_extendedLand.y)) {
        minDist = min(minDist, distanceToSegment(p, a, b));
    }

    // 2) contact on ab-edge, bends away from a and towards b
    if (isTrue(v_landDirection.x) && isFalse(v_extendedLand.x) && isTrue(v_extendedLand.y)) {
        minDist = min(minDist, distanceToSegment(p, a, b));
    }

    // 3) contact on ab-edge, bends towards a and away from b
    if (isTrue(v_landDirection.x) && isTrue(v_extendedLand.x) && isFalse(v_extendedLand.y)) {
        minDist = min(minDist, distanceToSegment(p, a, b));
    }

    // 4) contact on ab-edge, bends towards a and towards b
    if (isTrue(v_landDirection.x) && isFalse(v_extendedLand.x) && isFalse(v_extendedLand.y)) {
        minDist = min(minDist, distanceToSegment(p, a, b));
        color.r = 1.0;
    }

    // 5) contact only on vertex a
    if (isFalse(v_landDirection.x) && isTrue(v_landDirection.y) && isFalse(v_landDirection.z)) {
        minDist = min(minDist, distanceToSegment(p, a, aw));
    }

    // 6) contact only on vertex b
    if (isFalse(v_landDirection.x) && isFalse(v_landDirection.y) && isTrue(v_landDirection.z)) {
        minDist = min(minDist, distanceToSegment(p, b, bw));
    }

    // 7) contact only on vertices a and b
    if (isFalse(v_landDirection.x) && isTrue(v_landDirection.y) && isTrue(v_landDirection.z)) {
        minDist = min(minDist, distanceToSegment(p, b, bw));
        minDist = min(minDist, distanceToSegment(p, a, aw));
    }


    float normDist = 1.0 - clamp(minDist, 0.0, 1.0);

    outColor = vec4(normDist, normDist, normDist, 1.0);

    //    outColor = color;
}