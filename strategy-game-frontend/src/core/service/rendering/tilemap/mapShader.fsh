#version 300 es
precision mediump float;

uniform vec2 u_tileMouseOver;
uniform vec2 u_tileSelected;

flat in vec2 v_tilePosition;
flat in float v_terrainData;
flat in vec4 v_overlayColor;
in vec3 v_cornerData;
flat in vec2 v_borderData;

out vec4 outColor;

vec3 calcTerrainColor(float terrainId) {
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

bool inPrimaryBorder(float distToCenter, vec2 borderData) {
    return borderData.x > 0.5 && distToCenter > 0.6;
}

bool inSecondaryBorder(float distToCenter, vec2 borderData) {
    return borderData.y > 0.5 && distToCenter > 0.95;
}


void main() {

    // "unpack"
    float terrainId = v_terrainData;
    vec2 tilePos = v_tilePosition;

    // base terrain color
    vec3 tileColor = calcTerrainColor(terrainId);

    // overlay color
    tileColor = blend(tileColor, v_overlayColor*vec4(1.0, 1.0, 1.0, 0.5));

    // border
    if (inSecondaryBorder(1.0-v_cornerData.x, v_borderData)) {
        tileColor = vec3(0.0);
    }
    if (inPrimaryBorder(1.0-v_cornerData.x, v_borderData)) {
        tileColor = v_overlayColor.rgb;
    }

    // highlight selected/mouseover
    if (isSelected(tilePos)) {
        tileColor = tileColor * 0.5;
    } else if (isMouseOver(tilePos)) {
        tileColor = tileColor * 0.75;
    }

    // return final color
    outColor = vec4(tileColor, 1.0);
}
