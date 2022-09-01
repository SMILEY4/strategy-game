#version 300 es
precision mediump float;

uniform vec2 u_tileMouseOver;
uniform vec2 u_tileSelected;

flat in vec2 v_tilePosition;
flat in float v_terrainData;
flat in vec4 v_overlayColor;
in vec3 v_cornerData;
flat in vec3 v_borderData;

out vec4 outColor;


vec3 calcTerrainColor(float terrainId) {
    if(terrainId < -0.5) { // -1 -> undiscovered
        return vec3(0.2);
    }
    if (terrainId < 0.5) { // 0 -> water
        return vec3(0.3, 0.3, 1.0);
    }
    if (terrainId > 0.5) { // 1 -> land
        return vec3(0.3, 1.0, 0.3);
    }
    return vec3(0.0);
}


bool isMouseOver(vec2 tilePos) {
    return abs(u_tileMouseOver.x - tilePos.x) < 0.01 && abs(u_tileMouseOver.y - tilePos.y) < 0.01;
}


bool isSelected(vec2 tilePos) {
    return abs(u_tileSelected.x - tilePos.x) < 0.01 && abs(u_tileSelected.y - tilePos.y) < 0.01;
}


vec3 blend(vec3 background, vec4 foreground) {
    return vec3(
    background.r * (1.0 - foreground.a) + foreground.r * foreground.a,
    background.g * (1.0 - foreground.a) + foreground.g * foreground.a,
    background.b * (1.0 - foreground.a) + foreground.b * foreground.a
    );
}


bool isPrimaryBorderId(float borderId) {
    return 0.9 < borderId && borderId <  1.1;
}


bool isSecondaryBorderId(float borderId) {
    return 1.9 < borderId && borderId <  2.1;
}


bool inPrimaryBorder(float distToCenter, float distToCornerA, float distToCornerB, vec3 borderData) {
    return (isPrimaryBorderId(borderData.x) && distToCenter > 0.7)
    || (isPrimaryBorderId(borderData.y) && distToCornerA < 0.3 && distToCenter > 0.7)
    || (isPrimaryBorderId(borderData.z) && distToCornerB < 0.3 && distToCenter > 0.7);
}


bool inSecondaryBorder(float distToCenter, float distToCornerA, float distToCornerB, vec3 borderData) {
    return (isSecondaryBorderId(borderData.x) && distToCenter > 0.95)
    || (isSecondaryBorderId(borderData.y) && distToCornerA < 0.05 && distToCenter > 0.95)
    || (isSecondaryBorderId(borderData.z) && distToCornerB < 0.05 && distToCenter > 0.95);
}


void main() {

    // base terrain color
    vec3 tileColor = calcTerrainColor(v_terrainData);

    // overlay color
    tileColor = blend(tileColor, v_overlayColor*vec4(1.0, 1.0, 1.0, 0.5));

    // border
    if (inSecondaryBorder(1.0-v_cornerData.x, 1.0-v_cornerData.y, 1.0-v_cornerData.z, v_borderData)) {
        tileColor = mix(vec3(0.0), v_overlayColor.rgb, 0.5);
    }
    if (inPrimaryBorder(1.0-v_cornerData.x, 1.0-v_cornerData.y, 1.0-v_cornerData.z, v_borderData)) {
        tileColor = v_overlayColor.rgb;
    }

    // highlight selected/mouseover
    if (isSelected(v_tilePosition)) {
        tileColor = tileColor * 0.5;
    } else if (isMouseOver(v_tilePosition)) {
        tileColor = tileColor * 0.75;
    }

    // return final color
    outColor = vec4(tileColor, 1.0);
}
