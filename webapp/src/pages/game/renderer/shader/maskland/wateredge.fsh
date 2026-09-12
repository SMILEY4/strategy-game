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

bool isTrue(float value) {
    return value > 0.5;
}

bool isFalse(float value) {
    return value < 0.5;
}

// Perpendicular distance from point P to line segment AB
float distanceToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {

    vec2 p = v_worldPos.xz;

    vec2 a = v_worldPosA.xz;
    vec2 b = v_worldPosB.xz;
    vec2 c = v_worldPosC.xz;

    vec2 aw = v_worldPosAwing.xz;
    vec2 bw = v_worldPosBwing.xz;

    float minDist = 1e5;

    if(isTrue(v_landDirection.x) && isTrue(v_extendedLand.x) && isTrue(v_extendedLand.y)) {
        // contact on ab-edge, bends away from a and b
    }

    if(isTrue(v_landDirection.x) && isFalse(v_extendedLand.x) && isTrue(v_extendedLand.y)) {
        // contact on ab-edge, bends away from a and towards b
    }

    if(isTrue(v_landDirection.x) && isTrue(v_extendedLand.x) && isFalse(v_extendedLand.y)) {
        // contact on ab-edge, bends towards a and away from b
    }

    if(isTrue(v_landDirection.x) && isFalse(v_extendedLand.x) && isFalse(v_extendedLand.y)) {
        // contact on ab-edge, bends towards a and towards b
    }

    if(isFalse(v_landDirection.x) && isTrue(v_landDirection.y) && isFalse(v_landDirection.z)) {
        // contact only on vertex a
    }

    if(isFalse(v_landDirection.x) && isFalse(v_landDirection.y) && isTrue(v_landDirection.z)) {
        // contact only on vertex b
    }

    if(isFalse(v_landDirection.x) && isTrue(v_landDirection.y) && isTrue(v_landDirection.z)) {
        // contact only on vertices a and b
    }

    outColor = vec4(color, 1.0);

}